(function () {
    'use strict';
    angular.module('CellsWebClient', ['ngRoute', 'ngAnimate', 'CellsWebClient.Game'])
        .config([
            '$locationProvider',
            '$routeProvider',
            function ($locationProvider, $routeProvider) {
                $locationProvider.html5Mode(true);
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
            function ($scope) {
            }
        ])
        .factory('UserService',['$http', function ($http) {
            var userService = {
                player: null
            };
            userService.updatePlayer = function () {
                var req = {
                    method: 'GET',
                    url: 'http://localhost:4567/player',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                };
                $http(req).then(
                    function (e) {
                        console.log(e.data);
                        userService.player = e.data;
                    },
                    function (e) {
                        console.log(e.data);
                    }
                );
            };
            return userService;
        }]);
}());