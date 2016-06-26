(function () {

    var module = angular
      .module('WeatherApp')

      // PLEASE REPLACE THIS APP ID if you plan to reuse this code
      // You can register for a free one at http://www.wunderground.com/
      .constant('appId', '1cacb37540873778')
      .factory("weatherService", ['$http', '$log', '$q', 'appId',

      // weatherService - Retrieves weather conditions from Open Weather Map
        function weatherService($http, $log, $q, appId) {

            var getWeather = function getWeather(weatherLocation) {

                var locationTokens = weatherLocation.split(',')
                var urlLocation = locationTokens[1].trim() + '/' + locationTokens[0].trim();

                $log.info("Retrieving weather for " + urlLocation);

                return $http.get('https://api.wunderground.com/api/' + appId + '/conditions/q/' + urlLocation + '.json')

                  .then(function sendResponseData(response) {

                      // Success
                      $log.info("Retrieved weather for " + location);

                      var data = response.data;
                      return {

                          // Return the weather data in nicer format than the web service
                          City: data.current_observation.display_location.city,
                          Condition: data.current_observation.weather,
                          Description: data.current_observation.wind_string,
                          IconUrl: data.current_observation.icon_url,
                          Temperatures: GetTemperatures(data.current_observation.temp_f),
                          Wind: data.current_observation.wind_string,
                          Gusts: "",
                          Humidity: data.current_observation.relative_humidity
                      }

                  }).catch(function (response) {

                      $log.error('HTTP request error: ' + response.status)
                      return $q.reject('Error: ' + response.status);

                  });
            }; // End getWeather()

            // In weatherService()
            return {
                GetWeather: getWeather
            };

        } // End weatherService()
      ])

      .factory('spDataService', ['$http', '$q',
        function ($http, $q) {

            // public getSiteMetadataValues() - Retrieves all site metadata values for a specified site
            function getSiteMetadataValues() {

                var deferred = $q.defer();

                ExecuteOrDelayUntilScriptLoaded(function () {
                    ExecuteOrDelayUntilScriptLoaded(function () {

                        var clientContext = SP.ClientContext.get_current();
                        var web = clientContext.get_web();
                        var props = web.get_allProperties();

                        clientContext.load(web);
                        clientContext.load(props);

                        clientContext.executeQueryAsync(
                            function (sender, args) {
                                deferred.resolve(props.get_fieldValues());
                            },
                            function (sender, args) {
                                deferred.reject(args.get_message());
                            });

                    }, "sp.core.js");
                }, "sp.js");

                return deferred.promise;
            }

            return {
                getSiteMetadataValues: getSiteMetadataValues
            };
        }]);

    // Private functions ------------------------------------------------

    //
    // GetTemperatures() - Extracts temperatures from weather data
    //
    var GetTemperatures = function GetTemperatures(temp) {
        return [{
            "Units": "Farenheit",
            "Current": temp
        }, {
            "Units": "Celsius",
            "Current": (temp-32) * (5 / 9)
        }, {
            "Units": "Kelvin",
            "Current": ((temp - 32) * (5 / 9)) + 273
        }];
    }; // End GetTemperatures()

}());