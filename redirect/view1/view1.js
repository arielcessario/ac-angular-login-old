'use strict';

angular.module('myApp.view1', ['ngRoute',
    'nombreapp.verify-login'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/view1', {
    templateUrl: 'view1/view1.html',
    controller: 'View1Ctrl'
  });
}])

.controller('View1Ctrl', ['VerifyService', function(VerifyService) {
VerifyService.checkCookie();


}]);