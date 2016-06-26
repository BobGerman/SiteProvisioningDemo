// This service might return site metadata...
interface ISiteMetadata {
    ConfidentialityLevel: string,
    Location: string,
    Project: string,
    IsAdmin: boolean
}

// ... or only an error
interface IServiceError {
    Message: string;
}

// Here is the service interface
interface ISpDataService {
    GetSiteMetadata: () => ng.IPromise<ISiteMetadata | IServiceError>;
}

((): void => {

    class spDataService implements ISpDataService {

        static $inject = ["$http", "$q"];

        constructor(private $http: ng.IHttpService, private $q: ng.IQService) { }

        public GetSiteMetadata() {
            var defer = this.$q.defer();
            let promise: ng.IPromise<ISiteMetadata | IServiceError> = defer.promise;

            var url = window._spPageContextInfo.siteServerRelativeUrl + '/_api/web/AllProperties';

            this.$http.get(url, { headers: { accept: "application/json;odata=verbose" } })
                .then((response: SPWebAllProperties.RootObject) => {

                    // Resolve the promise with ISiteMetadata
                    let data: SPWebAllProperties.D = response.data.d;
                    defer.resolve({
                        ConfidentialityLevel: data.siteSensitivity,
                        Location: data.siteLocation,
                        Project: data.siteProject,
                        IsAdmin: window._spPageContextInfo.isSiteAdmin
                    });

                })
                .catch((reason: ng.IHttpPromiseCallbackArg<void>) => {

                    // Reject the promise with ISiteError
                    defer.reject(
                        {
                            Message: 'Error ' + reason.status + ': ' + reason.statusText
                        }
                    )

                });

            return promise;
        }
    }

    angular.module('metadataWidget')
        .service('spDataService', spDataService);

})();
