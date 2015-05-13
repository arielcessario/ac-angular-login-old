(function () {
    'use strict';

    var destinationWebsite = "http://192.185.67.199/~arielces/playground/redirect/#/verify-login/";

    angular.module('login.login', ['ngRoute', 'ngCookies', 'toastr'])
    //angular.module('login.login', ['ngRoute', 'ngCookies'])
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
    LoginCtrl.$inject = ['LoginService', '$cookieStore', '$window', '$routeParams', 'toastr']
    //LoginCtrl.$inject = ['LoginService', '$cookieStore', '$window', '$routeParams'];
    LoginService.$inject = ['$http', '$cookieStore', '$window'];


    //Implementations
    //function LoginCtrl(LoginService, $cookieStore, $window, $routeParams) {
    function LoginCtrl(LoginService, $cookieStore, $window, $routeParams, toastr) {
        // Functions
        var vm = this;

        // Variables
        vm.username = '';
        vm.password = '';

        // Functions declaration
        vm.login = login;
        vm.createUser = createUser;
        vm.recoveryPwd = recoveryPwd;
        vm.changePwd = changePwd;

        //Init
        checkLogged();

        //Implementations
        function login() {
            if(vm.username.trim().length > 0 && vm.password.trim().length > 0) {
                if(vm.password.trim().length >= 6 && vm.password.trim().length <= 25) {
                    LoginService.login(vm.username, vm.password, function (data){
                        if(!data.response) {
                            toastr.error('Usuario o contraseña invalido');
                        }
                        else {
                            if(data.changepwd) {
                                $window.location.href = "http://192.185.67.199/~arielces/playground/login/#/changepwd";
                            }
                        }
                    });
                }
                else {
                    toastr.warning('La contraseña deben tener un mínimo de 6 caracteres y un máximo de 25');
                }
            }
            else {
                toastr.error('Por favor ingrese un usuario y contraseña');
            }
        }

        function createUser() {
            $window.location.href = "http://192.185.67.199/~arielces/playground/login/#/crear";
        }

        function recoveryPwd() {
            $window.location.href = "http://192.185.67.199/~arielces/playground/login/#/recovery";
        }

        function changePwd() {
            $window.location.href = "http://192.185.67.199/~arielces/playground/login/#/changepwd";
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
                    if (data.response) {
                        if(data.changepwd) {
                            console.log("cambie la contraseña temporal");
                        }
                        var user = JSON.parse(data.user);

                        setLogged(user.user_name, user.usuario_id, user.rol_id, user.token);
                    }
                    else {
                        console.log("Contraseña o usuario invalido");
                    }
                    console.log(data);
                    callback(data);
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