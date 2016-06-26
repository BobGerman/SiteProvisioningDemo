// The controller's interface is the ViewModel
interface IMetadataDisplayController {
    FormUrl: string,
    ConfidentialityLevel: string,
    ConfidentialityCss: string,
    Location: string,
    Project: string
    ChangeMetadataClick: () => void;
    ErrorMessage: string;
}

((): void => {

    class metadataDisplayController implements IMetadataDisplayController {
        public FormUrl: string = "";
        public ConfidentialityLevel: string = "(loading)";
        public ConfidentialityCss: string = "";
        public Location: string = "";
        public Project: string = "";
        public ShowControls: boolean = false;
        public ErrorMessage: string = "";

        static $inject = ["$scope", "$location", "spDataService"];

        constructor($scope: ng.IScope, private $location: ng.ILocationService, spDataService: ISpDataService) {

            spDataService.GetSiteMetadata()
                .then((metadata: ISiteMetadata) => {
                    // Life is good! Display the data
                    this.ConfidentialityLevel = metadata.ConfidentialityLevel;
                    this.ConfidentialityCss = metadata.ConfidentialityLevel.toLowerCase();
                    this.Location = metadata.Location;
                    this.Project = metadata.Project;
                    if (metadata.IsAdmin) {
                        this.ShowControls = true;
                    }
                })
                .catch((reason: IServiceError) => {
                    // No good. Display the error
                    this.ErrorMessage = reason.Message;
                });

        }

        public ChangeMetadataClick() {
            window.location.href = this.FormUrl + "?siteUrl=" +
                window._spPageContextInfo.siteServerRelativeUrl;
        }

    }

    angular.module('metadataWidget')
        .controller('metadataDisplayController', metadataDisplayController);

})();

