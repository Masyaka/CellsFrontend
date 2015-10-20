(function () {
    'use strict';
    angular.module('CellsWebClient', ['ngRoute', 'ngAnimate', 'CellsWebClient.Register'])
        .config(['$locationProvider', function($locationProvider){
            $locationProvider.html5Mode(true);
        }])
        .config(['$httpProvider', function($httpProvider) {
           /* //Enable cross domain calls
            $httpProvider.defaults.useXDomain = true;

            //Remove the header used to identify ajax call  that would prevent CORS from working
            delete $httpProvider.defaults.headers.common['X-Requested-With'];*/
        }])
        .config([
            '$locationProvider',
            '$routeProvider',
            function($locationProvider, $routeProvider) {
                $locationProvider.hashPrefix('!');
                // routes
                $routeProvider
                    .when("/", {
                        templateUrl: "./partials/index.html",
                        controller: "MainController"
                    })
                    .otherwise({
                        redirectTo: '/'
                    });
            }
        ])
        .controller('MainController', [
            '$scope',
            function($scope) {
                $scope.test = "Testing...";
            }
        ])
        .factory('UserService', function() {
            return {
                name : 'anonymous',
                fraction: 'none'
            };
        });
}());