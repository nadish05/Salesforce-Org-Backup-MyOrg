public with sharing class BackupService {

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

        try {

            Http http =
                new Http();

            HttpRequest request =
                new HttpRequest();

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

            Map<String, String> requestBody =
                new Map<String, String>{

                    'clientId' => clientId,

                    'clientSecret' => clientSecret,

                    'environment' => environment,

                    'repoUrl' => repoUrl

                };

            request.setBody(

                JSON.serialize(requestBody)

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
            // Error Handling
            // ========================================

            if (

                response.getStatusCode() >= 400

            ) {

                throw new AuraHandledException(

                    response.getBody()

                );

            }

            return response.getBody();

        } catch (Exception e) {

            System.debug(
                'ERROR: ' +
                e.getMessage()
            );

            throw new AuraHandledException(

                e.getMessage()

            );

        }

    }

    // ========================================
    // Get Logs
    // ========================================

    @AuraEnabled
    public static String getLogs(

        String jobId

    ) {

        try {

            Http http =
                new Http();

            HttpRequest request =
                new HttpRequest();

            request.setEndpoint(

                'callout:Backup_API/logs/' +

                jobId

            );

            request.setMethod('GET');

            HttpResponse response =
                http.send(request);

            return response.getBody();

        } catch (Exception e) {

            throw new AuraHandledException(

                e.getMessage()

            );

        }

    }

}