public with sharing class BackupService {

    @AuraEnabled
    public static String startBackup(

        String repoUrl,

        String sessionId

    ) {

        try {

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
            // HTTP Setup
            // ========================================

            Http http =
                new Http();

            HttpRequest request =
                new HttpRequest();

            // ========================================
            // Backend Endpoint
            // ========================================

            request.setEndpoint(
                'callout:Backup_API/start-backup'
            );

            request.setMethod('POST');

            request.setHeader(
                'Content-Type',
                'application/json'
            );

            // ========================================
            // Request Body
            // ========================================

            Map<String, String> bodyMap =
                new Map<String, String>{

                    'repoUrl' =>
                        repoUrl,

                    'sessionId' =>
                        sessionId

                };

            request.setBody(
                JSON.serialize(bodyMap)
            );

            // ========================================
            // Send Request
            // ========================================

            HttpResponse response =
                http.send(request);

            System.debug(
                'STATUS CODE: ' +
                response.getStatusCode()
            );

            System.debug(
                'RESPONSE: ' +
                response.getBody()
            );

            // ========================================
            // Handle Errors
            // ========================================

            if (
                response.getStatusCode() >= 400
            ) {

                throw new AuraHandledException(
                    response.getBody()
                );

            }

            // ========================================
            // Success
            // ========================================

            return response.getBody();

        } catch (Exception e) {

            System.debug(
                'BACKUP ERROR: ' +
                e.getMessage()
            );

            throw new AuraHandledException(
                e.getMessage()
            );

        }

    }

}