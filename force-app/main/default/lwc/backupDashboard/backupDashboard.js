import { LightningElement, track }
from 'lwc';

import connectSalesforce
from '@salesforce/apex/BackupController.connectSalesforce';

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

    @track isConnected = false;

    @track sessionId = '';

    @track currentStep =
        'Waiting to start backup';

    @track logs = [];

    @track jobId = '';

    pollingInterval;

    // =====================================
    // Connected Callback
    // =====================================

    connectedCallback() {

        // =================================
        // Restore Browser Session
        // =================================

        const storedConnected =

            sessionStorage.getItem(
                'sfBackupConnected'
            );

        const storedSessionId =

            sessionStorage.getItem(
                'sfBackupSessionId'
            );

        if (

            storedConnected === 'true' &&

            storedSessionId

        ) {

            this.isConnected = true;

            this.sessionId =
                storedSessionId;

            this.currentStep =
                'Salesforce Org Connected';

        }

        // =================================
        // Read Hash Params
        // =================================

        const hash =

            window.location.hash.substring(1);

        const urlParams =

            new URLSearchParams(hash);

        // =================================
        // Connected State
        // =================================

        const connected =

            urlParams.get('connected');

        const sessionId =

            urlParams.get('sessionId');

        if (

            connected === 'true' &&

            sessionId

        ) {

            this.isConnected = true;

            this.sessionId =
                sessionId;

            this.loading = false;

            this.currentStep =
                'Salesforce Org Connected';

            // =================================
            // Store Session In Browser
            // =================================

            sessionStorage.setItem(

                'sfBackupConnected',

                'true'

            );

            sessionStorage.setItem(

                'sfBackupSessionId',

                sessionId

            );

            this.showToast(

                'Success',

                'Salesforce Connected Successfully',

                'success'

            );

        }

        // =================================
        // Job ID Detection
        // =================================

        const jobId =

            urlParams.get('jobId');

        if (jobId) {

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
                label:
                    'Production / Developer',

                value:
                    'production'
            },

            {
                label:
                    'Sandbox',

                value:
                    'sandbox'
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
    // Connect Salesforce
    // =====================================

    async connectSalesforce() {

        // =================================
        // Validation
        // =================================

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

        try {

            this.loading = true;

            this.currentStep =
                'Connecting Salesforce Org...';

            // =================================
            // Connect Salesforce
            // =================================

            const result =
                await connectSalesforce({

                    clientId:
                        this.clientId,

                    clientSecret:
                        this.clientSecret,

                    environment:
                        this.environment

                });

            const response =
                JSON.parse(result);

            console.log(
                'Connect Response:',
                response
            );

            // =================================
            // Redirect To OAuth
            // =================================

            if (

                response.success &&

                response.authUrl

            ) {

                window.location.href =
                    response.authUrl;

            } else {

                this.loading = false;

                this.showToast(

                    'Error',

                    response.message ||

                    'Failed to connect Salesforce',

                    'error'

                );

            }

        } catch (error) {

            console.error(error);

            this.loading = false;

            this.showToast(

                'Error',

                'Salesforce Connection Failed',

                'error'

            );

        }

    }

    // =====================================
    // Start Backup
    // =====================================

    async startBackup() {

        // =================================
        // Connection Validation
        // =================================

        if (!this.isConnected) {

            this.showToast(

                'Error',

                'Connect Salesforce First',

                'error'

            );

            return;

        }

        // =================================
        // Repo Validation
        // =================================

        if (!this.repoUrl) {

            this.showToast(

                'Error',

                'Please enter Repository URL',

                'error'

            );

            return;

        }

        try {

            this.loading = true;

            this.currentStep =
                'Starting Backup...';

            // =================================
            // Execute Backup
            // =================================

            const result =
                await startBackup({

                    sessionId:
                        this.sessionId,

                    repoUrl:
                        this.repoUrl

                });

            const response =
                JSON.parse(result);

            console.log(
                'Backup Response:',
                response
            );

            // =================================
            // Backup Started
            // =================================

            if (

                response.success &&

                response.jobId

            ) {

                this.jobId =
                    response.jobId;

                this.currentStep =
                    'Backup in progress...';

                this.startPolling();

                this.showToast(

                    'Success',

                    'Backup Started Successfully',

                    'success'

                );

            } else {

                this.loading = false;

                this.showToast(

                    'Error',

                    response.message ||

                    'Failed to start backup',

                    'error'

                );

            }

        } catch (error) {

            console.error(error);

            this.loading = false;

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

                    // =============================
                    // Detect Completion
                    // =============================

                    const finalLog =

                        response.logs[
                            response.logs.length - 1
                        ];

                    if (

                        finalLog &&

                        (

                            finalLog.includes(
                                'completed'
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

                    console.error(error);

                    clearInterval(
                        this.pollingInterval
                    );

                    this.loading = false;

                }

            }, 3000);

    }

    // =====================================
    // Toast Helper
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