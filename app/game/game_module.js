(function(){
    'use strict';
    angular.module('CellsWebClient.Game', ['ngRoute', 'ngAnimate'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when("/game",{
                templateUrl: "/game/game.html",
                controller: "GameController"
            });
        }])

        .factory('MessageDispatcherService',['$rootScope', function ($rootScope) {
            var messageQueue = [];
            var websocket = new WebSocket("ws:/" + window.location.hostname + ":" + gameConfig.port + "/");
            websocket.onopen = function (evt) {
                console.log("CONNECTED");

                if(messageQueue.length === 0){
                    return;
                }

                messageQueue.forEach(function(message){
                    messageDispatcherService.sendMessage(message);
                });
                messageQueue = [];
                console.log('Queued messages sent.');
            };
            websocket.onclose = function (evt) {
                console.log("DISCONNECTED");
            };
            websocket.onerror = function (evt) {
                console.error(evt);
            };
            websocket.onmessage = function (evt) {
                var data = $.parseJSON(evt.data);
                messageDispatcherService.messageReceived(data);
            };

            var messageDispatcherService = {
                webSocket: websocket,
                eventListeners: [],

                sendMessage: function(message){
                    if(websocket.readyState === 1){
                        this.webSocket.send(JSON.stringify(
                            message
                        ));
                        this.dispatchEvent('messageSent', message);
                        $rootScope.$broadcast('messageSent', message);
                    } else {
                        messageQueue.push(message);
                        console.log('Message queued.');
                    }
                },

                messageReceived: function(message){
                    this.dispatchEvent('messageReceived', message);
                    $rootScope.$broadcast('messageReceived', message);
                },

                addEventListener: function(eventName, callback){
                    this.eventListeners.push({
                        eventName: eventName,
                        callback: callback
                    });
                },

                dispatchEvent: function(eventName, data){
                    for( var k in this.eventListeners ){
                        var listener = this.eventListeners[k];
                        if(listener.eventName === eventName){
                            listener.callback(eventName, data);
                        }
                    }
                }
            };

            return messageDispatcherService;
        }])

        .controller('GameController', ['$scope', '$http', 'MessageDispatcherService', 'UserService', function($scope, $http, MessageDispatcherService, UserService) {
            angular.extend($scope, $http, MessageDispatcherService, UserService, {
                data: {
                    players : []
                },
                addPlayers: function(playersCollection){
                    $scope.data.players = $scope.data.players.concat(playersCollection);
                }
            });
            $scope.$on('messageReceived', function (e, data) {
                if(data.players_created){
                    $scope.$apply(function(){
                        $scope.addPlayers(data.players_created);
                    });
                }
            });

            gameConfig.messageDispatcherService = MessageDispatcherService;
            gameConfig.userService = UserService;
            gameConfig.angularScope = $scope;
            var game = new CellsGame(gameConfig);
            new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', game);
        }]);
})();
