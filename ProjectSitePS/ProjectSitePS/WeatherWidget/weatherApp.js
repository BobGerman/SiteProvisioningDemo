(function () {

    angular
      .module('WeatherApp', [])
      .controller('main', ['$scope', 'spDataService', 'weatherService',
        function ($scope, spDataService, weatherService) {

            var vm = this;

            spDataService.getSiteMetadataValues()
            .then(function (properties) {

                if (properties["siteLocation"]) {

                    // Found the key - grab the value
                    var weatherLocation = properties["siteLocation"];
                    weatherService.GetWeather(weatherLocation)
                      .then(function (data) {

                          // Copy data from the service into the model
                          vm.City = data.City;
                          vm.Condition = data.Condition;
                          vm.Description = data.Description;
                          vm.IconUrl = data.IconUrl;
                          vm.Temperatures = data.Temperatures;
                          vm.Wind = data.Wind;
                          vm.Gusts = data.Gusts;
                          vm.Humidity = data.Humidity;

                          // If we got this far, we have good data
                          vm.ValidDataLoaded = true;

                      })
                }
            })

            .catch(function (message) {

                vm.error = message;
                vm.ValidDataLoaded = false;

            });

        }
      ]); // End Controller()
}());