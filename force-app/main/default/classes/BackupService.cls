public with sharing class BackupService {

    // ========================================
    // Start Backup
    // ========================================

    @AuraEnabled
    public static String startBackup(

        String repoUrl,

        String sessionId

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

            Map<String, String> requestBody =
                new Map<String, String>{

                    'repoUrl' => repoUrl,

                    'sessionId' => sessionId

                };

            request.setBody(

                JSON.serialize(requestBody)

            );

            HttpResponse response =
                http.send(request);

            if (

                response.getStatusCode() >= 400

            ) {

                throw new AuraHandledException(

                    response.getBody()

                );

            }

            return response.getBody();

        } catch (Exception e) {

            throw new AuraHandledException(

                e.getMessage()

            );

        }

    }

    // ========================================
    // Get Live Logs
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