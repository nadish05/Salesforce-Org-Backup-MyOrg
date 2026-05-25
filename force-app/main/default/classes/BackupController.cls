public with sharing class BackupController {

    // ========================================
    // Start Backup
    // ========================================

    @AuraEnabled
    public static String startBackup(

        String repoUrl,

        String sessionId

    ) {

        return BackupService.startBackup(

            repoUrl,

            sessionId

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