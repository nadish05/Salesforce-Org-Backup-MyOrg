public with sharing class BackupController {

    // ========================================
    // Connect Salesforce
    // ========================================

    @AuraEnabled
    public static String connectSalesforce(

        String clientId,

        String clientSecret,

        String environment

    ) {

        return BackupService.connectSalesforce(

            clientId,

            clientSecret,

            environment

        );

    }

    // ========================================
    // Start Backup
    // ========================================

    @AuraEnabled
    public static String startBackup(

        String sessionId,

        String repoUrl

    ) {

        return BackupService.startBackup(

            sessionId,

            repoUrl

        );

    }

    // ========================================
    // Get Logs
    // ========================================

    @AuraEnabled
    public static String getLogs(

        String jobId

    ) {

        return BackupService.getLogs(

            jobId

        );

    }

}