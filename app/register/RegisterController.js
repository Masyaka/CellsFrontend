(function(){
    'use strict';
    angular.module('CellsWebClient.Register', ['ngRoute', 'ngAnimate'])
        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when("/register",{
                templateUrl: "/register/_.html",
                controller: "RegisterController"
            });
        }]).controller('RegisterController', ['$scope', '$http', function($scope, $http) {
            angular.extend($scope, {
                submit: function(){
                    var req = {
                        method: 'POST',
                        url: 'http://localhost:4567/register',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        data: { email: $scope.registerForm.email.$viewValue }
                    };
                    $http(req).then(
                        function(e){
                            $scope.result = e.data;
                        },
                        function(e){
                            console.log(e.data);
                        }
                    );
                }
            });
        }]);
})();
