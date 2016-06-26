(function () {

    'use strict';

    angular
      .module('metacap', [])

      // Main Controller for Metadata Edit Page
      .controller('main', ['metadataService', '$location', '$log',
        function (metadataService, $location, $log) {

            // Set up viewmodel
            var vm = this;
            vm.siteUrl = GetQueryStringByParameter("siteUrl");
            vm.terms = metadataService.terms;

            // Load the viewmodel
            if (!vm.siteUrl) {
                vm.showForm = false;
                vm.message = "Site URL was not specified.";
            }
            else {
                vm.showForm = true;
                vm.load = function () {
                    metadataService.loadAll(vm.siteUrl);
                };
                vm.save = function () {
                    metadataService.saveAll(vm.siteUrl);
                };
                vm.returnToSite = function () {
                    window.location.href = vm.siteUrl;
                }

                metadataService.loadAll(vm.siteUrl);
            }

            // private GetQueryStringByParameter - parses the query string and returns a parameter value
            function GetQueryStringByParameter(name) {
                name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
                var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
                results = regex.exec(location.search);
                return results == null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
            }
        }])

      // Metadata Service
      .factory('metadataService', ['spDataService', 'base64Service', '$log', '$q',
        function (spDataService, base64Service, $log, $q) {

            // Metadata Service - Public

            // The terms collection below is the model for the metadata terms stored in the site.
            // The entire model is loaded and saved with the loadAll() and saveAll() methods.

            // Add and remove terms from this collection to change the site metadata taxonomy.
            // Note that removing terms from the list may leave orphaned metadata.
            var terms = [
                            {
                                name: "Sensitivity",                                   // Display name
                                key: "siteSensitivity",                                // Property bag key
                                choices: ["Confidential","Internal Use","Public"],     // Choices - empty array allows text box input
                                saved: false,                                          // True if we have just saved this property
                                lastValueLoaded: "",                                   // If lastValueLoaded != value, the value is dirty
                                value: ""                                              //     and needs saving
                            },
                            {
                                name: "Location",
                                key: "siteLocation",
                                choices: ["Boston, MA", "Chicago, IL", "New York, NY"],
                                saved: false,
                                lastValueLoaded: "",
                                value: ""
                            },
                            {
                                name: "Project",
                                key: "siteProject",
                                choices: [],
                                saved: false,
                                lastValueLoaded: "",
                                value: ""
                            }
            ];

            // public loadAll() - loads the terms collection with data from the specified site
            function loadAll(siteUrl) {

                spDataService.getSiteMetadataValues(siteUrl)
                .then(function (properties) {

                    // Go through the terms in the model
                    for (var t in terms) {

                        if (properties[terms[t].key]) {
                            // Found the key - grab the value
                            terms[t].value = properties[terms[t].key];
                            terms[t].lastValueLoaded = terms[t].value;
                        }
                        else {
                            // Didn't find the key - clear the value
                            terms[t].value = "";
                            terms[t].lastValueLoaded = "";
                        }
                        terms[t].saved = false;
                    }
                });
            }

            // public saveAll() - saves the terms collection to the specitied site
            function saveAll(siteUrl) {

                var INDEXED_PROP_KEYS_KEY = "vti_indexedpropertykeys";

                spDataService.getSiteMetadataValues(siteUrl)
                .then(function (properties) {

                    var oldIndexedPropertyKeyValue = properties[INDEXED_PROP_KEYS_KEY];
                    var keyValuePairs = [];
                    var i = 0;

                    // Loop through the terms and save any that have changed
                    for (var t in terms) {
                        var term = terms[t];
                        if (term.value !== term.lastValueLoaded) {
                            keyValuePairs[i++] = { key: term.key, value: term.value, index: t };
                        }
                    }

                    var indexedPropertyKeyValue = getIndexedPropertyKeyValue();
                    keyValuePairs[i++] = { key: INDEXED_PROP_KEYS_KEY, value: indexedPropertyKeyValue, index: -1 };

                    spDataService.setSiteMetadataValues(siteUrl, keyValuePairs)
                        .then(function (result) {
                            for (var j in keyValuePairs) {
                                if (j >= 0) {
                                    terms[keyValuePairs[j].index].lastValueLoaded = keyValuePairs[j].value;
                                    terms[keyValuePairs[j].index].saved = true;
                                }
                            }
                        })
                })
            }

            // private getIndexedPropertyKeyValue() - Calculates the property keys property value and sets it in the site
            function getIndexedPropertyKeyValue(oldIndexedPropertyKeyValue) {

                // Get the old list of keys
                var oldKeys = [];
                if (oldIndexedPropertyKeyValue) {
                    oldKeys = oldIndexedPropertyKeyValue.split('|');
                }

                // Look through the old keys. Any that aren't ours get copied to the new keys.
                var value = "";
                for (var k in oldKeys) {
                    if (oldKeys[k]) {
                        var ourKey = false;
                        for (var t in terms) {
                            ourKey |= (base64Service.encode(terms[t].key) === oldKeys[k]);
                        }
                        if (!ourKey) {
                            value += oldKeys[k] + "|";
                        }
                    }
                }

                // Now write our keys
                for (var t in terms) {
                    value += base64Service.encode(terms[t].key) + "|";
                }
                return value;

            }

            // Return public members
            return {
                terms: terms,
                loadAll: loadAll,
                saveAll: saveAll
            };
        }])
        
      // SharePoint Data Service
      .factory('spDataService', ['$http', '$q',
        function ($http, $q) {

            // public getSiteMetadataValues() - Retrieves all site metadata values for a specified site
            function getSiteMetadataValues(siteUrl) {

                var deferred = $q.defer();

                ExecuteOrDelayUntilScriptLoaded(function () {
                    ExecuteOrDelayUntilScriptLoaded(function () {

                        var clientContext = new SP.ClientContext(siteUrl);
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

            // public setSiteMetadataValue() - sets a property for the specified site
            function setSiteMetadataValues(siteUrl, keyValuePairs) {

                var deferred = $q.defer();

                ExecuteOrDelayUntilScriptLoaded(function () {
                    ExecuteOrDelayUntilScriptLoaded(function () {

                        var clientContext = new SP.ClientContext(siteUrl);
                        var web = clientContext.get_web();
                        var props = web.get_allProperties();

                        for (var i in keyValuePairs) {
                            props.set_item(keyValuePairs[i].key, keyValuePairs[i].value);
                        }
                        web.update();

                        clientContext.executeQueryAsync(
                            function (sender, args) {
                                deferred.resolve();
                            },
                            function (sender, args) {
                                deferred.reject(args.get_message());
                            });

                    }, "sp.core.js");
                }, "sp.js");

                return deferred.promise;
            }

            // Return public members
            return {
                getSiteMetadataValues: getSiteMetadataValues,
                setSiteMetadataValues: setSiteMetadataValues
            };
        }])

      .factory('base64Service', [
        function () {

            // Adapted from http://jsfiddle.net/gabrieleromanato/qAGHT/
            //   - Converted to an Angular service
            //   - Converted from UTC-8 to UTC-16 (little endian)
            //   - Made safe for "use strict"
            //   - Dropped decode - don't need it here

            var _keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";

            // public encode() - Encodes simple strings to Base64 with UTC-16 little endian encoding
            function encode(input) {
                var output = "";
                var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
                var i = 0;

                // Stuff zeroes after each character for simple UTC-16 encoding
                var characters = []
                for (i = 0; i < input.length; i++) {
                    characters[i * 2] = input.charCodeAt(i);
                    characters[(i * 2) + 1] = 0;
                }

                // Original Base64 conversion loop
                i = 0;
                while (i < characters.length) {

                    chr1 = characters[i++];
                    chr2 = characters[i++];
                    chr3 = characters[i++];

                    enc1 = chr1 >> 2;
                    enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
                    enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
                    enc4 = chr3 & 63;

                    if (isNaN(chr2)) {
                        enc3 = enc4 = 64;
                    } else if (isNaN(chr3)) {
                        enc4 = 64;
                    }

                    output = output + _keyStr.charAt(enc1) + _keyStr.charAt(enc2) + _keyStr.charAt(enc3) + _keyStr.charAt(enc4);

                }

                return output;
            }

            return {
                encode: encode
            }
            
        }])
}());