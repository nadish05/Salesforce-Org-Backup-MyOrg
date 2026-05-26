import { LightningElement, track }
from 'lwc';

import startBackup
from '@salesforce/apex/BackupController.startBackup';

import getLogs
from '@salesforce/apex/BackupController.getLogs';

import { ShowToastEvent }
from 'lightning/platformShowToastEvent';

export default class BackupDashboard
extends LightningElement {

    // =====================================
    // Variables
    // =====================================

    @track clientId = '';

    @track clientSecret = '';

    @track environment = 'production';

    @track repoUrl = '';

    @track loading = false;

    @track currentStep =
        'Waiting to start backup';

    @track logs = [];

    @track jobId = '';

    pollingInterval;

    // =====================================
// Auto Detect Job ID From URL
// =====================================

connectedCallback() {

    const urlParams =

        new URLSearchParams(

            window.location.search

        );

    const jobId =

        urlParams.get('jobId');

    if (jobId) {

        console.log(
            'Job ID Found:',
            jobId
        );

        this.jobId = jobId;

        this.loading = true;

        this.currentStep =
            'Backup in progress...';

        this.startPolling();

    }

}

    // =====================================
    // Environment Options
    // =====================================

    get environmentOptions() {

        return [

            {
                label: 'Production / Developer',
                value: 'production'
            },

            {
                label: 'Sandbox',
                value: 'sandbox'
            }

        ];

    }

    // =====================================
    // Handle Client ID
    // =====================================

    handleClientIdChange(event) {

        this.clientId =
            event.target.value;

    }

    // =====================================
    // Handle Client Secret
    // =====================================

    handleClientSecretChange(event) {

        this.clientSecret =
            event.target.value;

    }

    // =====================================
    // Handle Environment
    // =====================================

    handleEnvironmentChange(event) {

        this.environment =
            event.target.value;

    }

    // =====================================
    // Handle Repo URL
    // =====================================

    handleRepoChange(event) {

        this.repoUrl =
            event.target.value;

    }

    // =====================================
    // Start Backup
    // =====================================

    async startBackup() {

        // =====================================
        // Validation
        // =====================================

        if (!this.clientId) {

            this.showToast(

                'Error',

                'Please enter Client ID',

                'error'

            );

            return;

        }

        if (!this.clientSecret) {

            this.showToast(

                'Error',

                'Please enter Client Secret',

                'error'

            );

            return;

        }

        if (!this.repoUrl) {

            this.showToast(

                'Error',

                'Please enter Repository URL',

                'error'

            );

            return;

        }

        try {

            // =====================================
            // Reset UI
            // =====================================

            this.loading = true;

            this.logs = [];

            this.currentStep =
                'Generating Salesforce authorization URL...';

            // =====================================
            // Start OAuth Flow
            // =====================================

            const result =
                await startBackup({

                    clientId:
                        this.clientId,

                    clientSecret:
                        this.clientSecret,

                    environment:
                        this.environment,

                    repoUrl:
                        this.repoUrl

                });

            const response =
                JSON.parse(result);

            console.log(
                'OAuth Response:',
                response
            );

            // =====================================
            // Open Salesforce Login
            // =====================================

            if (

                response.success &&

                response.authUrl

            ) {

                this.currentStep =

                    'Waiting for Salesforce authorization...';

                window.open(

                    response.authUrl,

                    '_blank'

                );

                this.showToast(

                    'Success',

                    'Salesforce authorization started',

                    'success'

                );

            } else {

                this.loading = false;

                this.showToast(

                    'Error',

                    response.message ||

                    'Failed to generate OAuth URL',

                    'error'

                );

            }

        } catch (error) {

            console.error(
                'Backup Error:',
                error
            );

            this.loading = false;

            this.currentStep =
                'Backup Failed';

            this.showToast(

                'Error',

                'Backup Failed',

                'error'

            );

        }

    }

    // =====================================
    // Start Polling Logs
    // =====================================

    startPolling() {

        this.pollingInterval =

            setInterval(async () => {

                try {

                    const result =
                        await getLogs({

                            jobId:
                                this.jobId

                        });

                    const response =
                        JSON.parse(result);

                    this.logs =
                        response.logs;

                    // =================================
                    // Detect Completion
                    // =================================

                    const finalLog =
                        response.logs[
                            response.logs.length - 1
                        ];

                    if (

                        finalLog &&
                        (
                            finalLog.includes(
                                'Backup completed successfully'
                            ) ||

                            finalLog.includes(
                                'ERROR'
                            )
                        )

                    ) {

                        clearInterval(
                            this.pollingInterval
                        );

                        this.loading = false;

                        this.currentStep =
                            'Backup Finished';

                    }

                } catch (error) {

                    console.error(
                        'Polling Error:',
                        error
                    );

                    clearInterval(
                        this.pollingInterval
                    );

                    this.loading = false;

                }

            }, 3000);

    }

    // =====================================
    // Toast
    // =====================================

    showToast(

        title,
        message,
        variant

    ) {

        this.dispatchEvent(

            new ShowToastEvent({

                title,
                message,
                variant

            })

        );

    }

}