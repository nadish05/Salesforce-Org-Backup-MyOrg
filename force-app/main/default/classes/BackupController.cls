public with sharing class BackupController {

    @AuraEnabled
    public static String startBackup(

        String repoUrl,

        String sessionId

    ) {

        // ========================================
        // Validation
        // ========================================

        if (String.isBlank(repoUrl)) {

            throw new AuraHandledException(
                'Repository URL is required'
            );

        }

        if (String.isBlank(sessionId)) {

            throw new AuraHandledException(
                'Session ID is required'
            );

        }

        // ========================================
        // Start Backup
        // ========================================

        return BackupService.startBackup(

            repoUrl,

            sessionId

        );

    }

}