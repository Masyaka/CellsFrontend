(function () {
    'use strict';
    angular.module('CellsWebClient', ['ngRoute', 'ngAnimate', 'CellsWebClient.Game'])
        .config([
            '$locationProvider',
            '$routeProvider',
            function ($locationProvider, $routeProvider) {
                $locationProvider.html5Mode(true);
                $locationProvider.hashPrefix('!');
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
            'UserService',
            '$location',
            function ($scope, UserService, $location) {
                UserService.updatePlayer().then(function(){
                    if(UserService.player){
                        $location.path('/game');
                    }
                });
            }
        ])
        .factory('UserService',[
            '$http',
            function ($http) {
                var userService = {
                    player: null
                };
                userService.updatePlayer = function () {
                    var req = {
                        method: 'GET',
                        url: 'http://' + window.location.hostname + ":" + gameConfig.port + '/player',
                        headers: {
                            'Content-Type': 'application/json'
                        }
                    };
                    var promise = $http(req);
                    promise.then(
                        function (e) {
                            console.log(e.data);
                            userService.player = e.data;
                        },
                        function (e) {
                            console.log(e.data);
                        }
                    );
                    return promise;
                };
                return userService;
            }
        ]);
}());