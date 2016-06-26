(function () {
    angular.module('metadataWidget', []);
})();
(function () {
    var metadataDisplayController = (function () {
        function metadataDisplayController($scope, $location, spDataService) {
            var _this = this;
            this.$location = $location;
            this.FormUrl = "";
            this.ConfidentialityLevel = "(loading)";
            this.ConfidentialityCss = "";
            this.Location = "";
            this.Project = "";
            this.ShowControls = false;
            this.ErrorMessage = "";
            spDataService.GetSiteMetadata()
                .then(function (metadata) {
                // Life is good! Display the data
                _this.ConfidentialityLevel = metadata.ConfidentialityLevel;
                _this.ConfidentialityCss = metadata.ConfidentialityLevel.toLowerCase();
                _this.Location = metadata.Location;
                _this.Project = metadata.Project;
                if (metadata.IsAdmin) {
                    _this.ShowControls = true;
                }
            })
                .catch(function (reason) {
                // No good. Display the error
                _this.ErrorMessage = reason.Message;
            });
        }
        metadataDisplayController.prototype.ChangeMetadataClick = function () {
            window.location.href = this.FormUrl + "?siteUrl=" +
                window._spPageContextInfo.siteServerRelativeUrl;
        };
        metadataDisplayController.$inject = ["$scope", "$location", "spDataService"];
        return metadataDisplayController;
    }());
    angular.module('metadataWidget')
        .controller('metadataDisplayController', metadataDisplayController);
})();
(function () {
    var spDataService = (function () {
        function spDataService($http, $q) {
            this.$http = $http;
            this.$q = $q;
        }
        spDataService.prototype.GetSiteMetadata = function () {
            var defer = this.$q.defer();
            var promise = defer.promise;
            var url = window._spPageContextInfo.siteServerRelativeUrl + '/_api/web/AllProperties';
            this.$http.get(url, { headers: { accept: "application/json;odata=verbose" } })
                .then(function (response) {
                // Resolve the promise with ISiteMetadata
                var data = response.data.d;
                defer.resolve({
                    ConfidentialityLevel: data.siteSensitivity,
                    Location: data.siteLocation,
                    Project: data.siteProject,
                    IsAdmin: window._spPageContextInfo.isSiteAdmin
                });
            })
                .catch(function (reason) {
                // Reject the promise with ISiteError
                defer.reject({
                    Message: 'Error ' + reason.status + ': ' + reason.statusText
                });
            });
            return promise;
        };
        spDataService.$inject = ["$http", "$q"];
        return spDataService;
    }());
    angular.module('metadataWidget')
        .service('spDataService', spDataService);
})();
//# sourceMappingURL=app.js.map