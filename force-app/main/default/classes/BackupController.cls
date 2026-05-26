public with sharing class BackupController {

    // ========================================
    // Start Backup
    // ========================================

    @AuraEnabled
    public static String startBackup(

        String clientId,

        String clientSecret,

        String environment,

        String repoUrl

    ) {

        return BackupService.startBackup(

            clientId,

            clientSecret,

            environment,

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