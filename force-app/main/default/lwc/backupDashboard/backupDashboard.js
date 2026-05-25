import { LightningElement, track }
from 'lwc';

import startBackup
from '@salesforce/apex/BackupController.startBackup';

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
        'Waiting to start backup...';

    @track logs = [];

    @track isConnected = false;

    @track connectedOrg =
        '';

    // =====================================
    // Handle Repo
    // =====================================

    handleRepoChange(event) {

        this.repoUrl =
            event.target.value;

    }

    // =====================================
    // Handle Session
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

        // =====================================
        // UI Reset
        // =====================================

        this.loading = true;

        this.logs = [];

        this.currentStep =
            'Starting Backup...';

        this.addLog(
            'Backup job initialized'
        );

        try {

            // =====================================
            // Call Apex
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
            // Update UI
            // =====================================

            this.currentStep =
                'Backup Started Successfully';

            this.addLog(
                'Salesforce connection verified'
            );

            this.addLog(
                'Repository validated'
            );

            this.addLog(
                'Metadata retrieval started'
            );

            this.addLog(
                'Git push started'
            );

            // =====================================
            // Success Toast
            // =====================================

            this.showToast(
                'Success',
                'Backup Started Successfully',
                'success'
            );

        } catch (error) {

            console.error(error);

            this.currentStep =
                'Backup Failed';

            this.addLog(
                'Error occurred during backup'
            );

            this.showToast(
                'Error',
                'Backup Failed',
                'error'
            );

        }

        this.loading = false;

    }

    // =====================================
    // Add Logs
    // =====================================

    addLog(message) {

        this.logs = [
            ...this.logs,
            message
        ];

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