'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngCookies',
  'myApp.view1',
  'myApp.view2',
  'myApp.version',
    'nombreapp.verify-login'
]).
config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}])
    .controller('MainController', MainController);

MainController.$inject = ['VerifyService', '$location']
function MainController(VerifyService, $location){

    VerifyService.checkCookie();

    var vm = this;

    vm.logout = VerifyService.logout;
}
