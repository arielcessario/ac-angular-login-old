(function () {


    'use strict';

    var destinationWebsite = "http://192.185.67.199/~arielces/playground/redirect/#/verify-login/";


    angular.module('login.login',
        ['ngRoute',
            'ngCookies'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/login/:action', {
                templateUrl: './login/login.html',
                controller: 'LoginCtrl'
            });

            $routeProvider.when('/login', {
                templateUrl: './login/login.html',
                controller: 'LoginCtrl'
            });
        }])

        .controller('LoginCtrl', LoginCtrl)
        .factory('LoginService', LoginService);

    //Injects
    LoginCtrl.$inject = ['LoginService', '$cookieStore', '$window', '$routeParams']
    LoginService.$inject = ['$http', '$cookieStore', '$window'];


    //Implementations
    function LoginCtrl(LoginService, $cookieStore, $window, $routeParams) {
        // Functions
        var vm = this;


        // Variables

        // Functions declaration
        vm.login = login;

        //Init
        checkLogged();

        //Implementations
        function login() {
            //console.log(vm.username);
            LoginService.login(vm.username, vm.password);
        }

        function checkLogged() {
            if($routeParams !== undefined){
                if($routeParams.action == 'clear'){
                    $cookieStore.remove('appname.login.userLogged');
                }
            }


            var globals = $cookieStore.get('appname.login.userLogged');
            //console.log(globals);
            if (globals !== undefined &&
                globals.userid !== undefined &&
                globals.userid !== '') {
                LoginService.checkLastLogin(globals.userid, function (data) {
                    //console.log();
                    //console.log(data);

                    if (data) {
                        // Redirecciona a la aplicación verdadera
                        //console.log('true');
                        $window.location.href = destinationWebsite + globals.verification + '/' + globals.userid;
                    }
                });


            }
        }
    }


    function LoginService($http, $cookieStore, $window) {
        //Variables
        var service = {};

        //Function declarations
        service.login = login;
        service.checkLogged = checkLogged;
        service.checkLastLogin = checkLastLogin;

        return service;


        //Functions
        function login(username, password, callback) {
            return $http.post('./login-api/user.php',
                {'function': 'login', 'username': username, 'password': password})
                .success(function (data) {
                    if (data) {
                        var user = JSON.parse(data.user);
                        //console.log(data);

                        //console.log(user);
                        setLogged(user.user_name, user.usuario_id, user.rol_id, user.token);
                    }
                })
                .error()
        }

        function checkLastLogin(userid, callback) {
            return $http.post('./login-api/user.php',
                {function: 'checkLastLogin', 'userid': userid})
                .success(function (data) {
                    //console.log(data);
                    if(data !=='false'){

                        callback(data);
                    }
                })
                .error()


        }

        function setLogged(username, userid, rol, verification) {
            var datos = {
                'username': username || '',
                'userid': userid || '',
                'rol': rol || '',
                'verification': verification || ''
            }
            $cookieStore.put('appname.login.userLogged', datos);
            //console.log(verification);
            $window.location.href = destinationWebsite + verification + '/' + userid;
        }

        function checkLogged() {

        }

    }


})();