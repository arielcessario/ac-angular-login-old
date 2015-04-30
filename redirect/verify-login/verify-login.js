(function () {

    'use strict';

    var destinationWebsite = "http://192.185.67.199/~arielces/playground/login/#/login/";
    var cookieName = 'appname.client.userLogged';

    angular.module('nombreapp.verify-login', ['ngRoute'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/verify-login/:auth/:id', {
                templateUrl: './verify-login/verify-login.html',
                controller: 'VerifyCtrl'
            });

            //$routeProvider.when('/verify-login', {
            //    templateUrl: './verify-login/verify-login.html',
            //    controller: 'VerifyCtrl'
            //});
        }])

        .controller('VerifyCtrl', VerifyCtrl)
        .factory('VerifyService', VerifyService);

    VerifyCtrl.$inject = ['$routeParams', '$window', '$cookieStore', 'VerifyService', '$rootScope'];
    VerifyService.$inject = ['$http', '$cookieStore', '$window', '$location'];


    function VerifyCtrl($routeParams, $window, $cookieStore, VerifyService, $rootScope) {
        //MainCtrl.$inject = ['$scope', '$routeParams', '$location'];
        var vm = this;

        //vm.logout = logout;
        //
        //function logout() {
        //
        //    VerifyService.logout();
        //
        //    //var globals = $cookieStore.get(cookieName);
        //    ////console.log(globals);
        //    //VerifyService.logout(globals.userid, function (data) {
        //    //    $cookieStore.remove(cookieName);
        //    //    $window.location.href = destinationWebsite + 'clear';
        //    //});
        //
        //}

        //console.log($routeParams.auth);
        //console.log($routeParams.id);
        if ($routeParams !== undefined) {
            //console.log($routeParams);
            if ($routeParams.id == -1) {

                //console.log('entra');
                VerifyService.checkCookie();
            } else {

                VerifyService.checkLastLogin($routeParams.id, $routeParams.auth, function (data) {

                });
            }
        } else {

            VerifyService.checkCookie();
            //$window.location.href=destinationWebsite;
        }
        //$location.url('#/view1');

        $rootScope.$on('$routeChangeStart', function (event, next, current) {
            VerifyService.checkCookie();
        });

    }

    function VerifyService($http, $cookieStore, $window, $location) {
        //Variables
        var service = {};

        //Function declarations
        service.checkLogged = checkLogged;
        service.checkLastLogin = checkLastLogin;
        service.checkCookie = checkCookie;
        service.logout = logout;

        return service;


        function checkCookie() {


            if (!$location.path().match(/verify-login/g)) {
                console.log('servicio');
                var globals = $cookieStore.get(cookieName);
                //console.log(globals);
                if (globals !== undefined &&
                    globals.userid !== undefined &&
                    globals.userid !== '' &&
                    globals.verification !== '' &&
                    globals.rol !== undefined &&
                    globals.rol !== '') {
                    checkLastLogin(globals.userid, globals.verification, function (data) {
                        //console.log(data);
                        if (!data) {
                            // Redirecciona a la aplicación verdadera
                            //console.log('true');
                            $window.location.href = destinationWebsite + 'clear';
                        }
                    });


                } else {
                    $window.location.href = destinationWebsite + 'clear';
                }
            }


        }

        function checkLastLogin(userid, token, callback) {
            //console.log(userid);
            if (userid === undefined) {
                //$window.location.href=destinationWebsite + 'clear';
            }

            return $http.post('./login-api/user.php',
                {function: 'checkLastLogin', 'userid': userid, 'token': token})
                .success(function (data) {


                    if (data == 'false' || data.rol_id == 0 || data.rol_id == '' || data.rol_id == null) {
                        $cookieStore.remove(cookieName);

                        $window.location.href = destinationWebsite + 'clear';
                    } else {
                        setLogged(data.user_name, userid, data.rol_id, token);

                    }
                    //var user = JSON.parse(data.user);
                    //callback(data);
                })
                .error()


        }

        function setLogged(username, userid, rol, verification) {

            var datos = {
                'username': username || '',
                'userid': userid || '',
                'rol': rol || '',
                'verification': verification || ''
            };
            $cookieStore.put(cookieName, datos);


            //console.log($cookieStore.get(cookieName));
            //$window.location.href=destinationWebsite;
        }

        function checkLogged() {

        }

        function logout() {
            var globals = $cookieStore.get(cookieName);

            return $http.post('./login-api/user.php',
                {function: 'logout', 'userid': globals.userid})
                .success(function (data) {
                    $cookieStore.remove(cookieName);
                    $window.location.href = destinationWebsite + 'clear';

                })
                .error()
        }

    }
})();