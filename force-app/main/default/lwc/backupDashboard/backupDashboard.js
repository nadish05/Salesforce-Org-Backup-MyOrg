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

    @track repoUrl = '';

    @track sessionId = '';

    @track loading = false;

    @track currentStep =
        'Waiting to start backup';

    @track logs = [];

    @track isConnected = false;

    @track connectedOrg =
        '';

    @track jobId = '';

    pollingInterval;

    // =====================================
    // Handle Repo URL
    // =====================================

    handleRepoChange(event) {

        this.repoUrl =
            event.target.value;

    }

    // =====================================
    // Handle Session ID
    // =====================================

    handleSessionChange(event) {

        this.sessionId =
            event.target.value;

        if (this.sessionId) {

            this.isConnected = true;

            this.connectedOrg =
                'Salesforce OAuth Connected';

        }

    }

    // =====================================
    // Connect Salesforce
    // =====================================

    connectSalesforce() {

        window.open(

            'https://salesforce-backup-backend-1.onrender.com/auth/salesforce',

            '_blank'

        );

    }

    // =====================================
    // Start Backup
    // =====================================

    async startBackup() {

        // =====================================
        // Validation
        // =====================================

        if (!this.repoUrl) {

            this.showToast(

                'Error',

                'Please enter GitHub Repository URL',

                'error'

            );

            return;

        }

        if (!this.sessionId) {

            this.showToast(

                'Error',

                'Please enter Session ID',

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
                'Starting backup job...';

            // =====================================
            // Start Backup
            // =====================================

            const result =
                await startBackup({

                    repoUrl:
                        this.repoUrl,

                    sessionId:
                        this.sessionId

                });

            const response =
                JSON.parse(result);

            console.log(response);

            // =====================================
            // Store Job ID
            // =====================================

            this.jobId =
                response.jobId;

            // =====================================
            // Start Polling
            // =====================================

            this.startPolling();

            // =====================================
            // Toast
            // =====================================

            this.showToast(

                'Success',

                'Backup Started Successfully',

                'success'

            );

        } catch (error) {

            console.error(error);

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

                    console.error(error);

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