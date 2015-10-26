(function(){
    'use strict';
    angular.module('CellsWebClient.Game', ['ngRoute', 'ngAnimate'])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when("/game",{
                templateUrl: "/game/game.html",
                controller: "GameController"
            });
        }]).controller('GameController', ['$scope', '$http', function($scope, $http) {
            angular.extend($scope, {

            });
        }]);
})();
