/**
 * angular-spinner version 0.7.0
 * License: MIT.
 * Copyright (C) 2013, 2014, 2015, Uri Shaked and contributors.
 */

(function factory(angular, Spinner) {

		return angular
			.module('angularSpinner', [])

			.constant('SpinJSSpinner', Spinner)

			.provider('usSpinnerConfig', function () {
				var _config = {}, _themes = {};

				return {
					setDefaults: function (config) {
						_config = config || _config;
					},
					setTheme: function(name, config) {
						_themes[name] = config;
					},
					$get: function () {
						return {
							config: _config,
							themes: _themes
						};
					}
				};
			})

			.factory('usSpinnerService', ['$rootScope', function ($rootScope) {
				var config = {};

				config.spin = function (key) {
					$rootScope.$broadcast('us-spinner:spin', key);
				};

				config.stop = function (key) {
					$rootScope.$broadcast('us-spinner:stop', key);
				};

				return config;
			}])

			.directive('usSpinner', ['SpinJSSpinner', 'usSpinnerConfig', function (SpinJSSpinner, usSpinnerConfig) {
				return {
					scope: true,
					link: function (scope, element, attr) {
						scope.spinner = null;

						scope.key = angular.isDefined(attr.spinnerKey) ? attr.spinnerKey : false;

						scope.startActive = angular.isDefined(attr.spinnerStartActive) ?
							scope.$eval(attr.spinnerStartActive) : scope.key ?
							false : true;

						function stopSpinner() {
							if (scope.spinner) {
								scope.spinner.stop();
							}
						}

						scope.spin = function () {
							if (scope.spinner) {
								scope.spinner.spin(element[0]);
							}
						};

						scope.stop = function () {
							scope.startActive = false;
							stopSpinner();
						};

						scope.$watch(attr.usSpinner, function (options) {
							stopSpinner();

							// order of precedence: element options, theme, defaults.
							options = angular.extend(
								usSpinnerConfig.config,
								usSpinnerConfig.themes[attr.spinnerTheme],
								options);

							scope.spinner = new SpinJSSpinner(options);
							if (!scope.key || scope.startActive) {
								scope.spinner.spin(element[0]);
							}
						}, true);

						scope.$on('us-spinner:spin', function (event, key) {
							if (key === scope.key) {
								scope.spin();
							}
						});

						scope.$on('us-spinner:stop', function (event, key) {
							if (key === scope.key) {
								scope.stop();
							}
						});

						scope.$on('$destroy', function () {
							scope.stop();
							scope.spinner = null;
						});
					}
				};
			}]);
})(window.angular, window.Spinner);
