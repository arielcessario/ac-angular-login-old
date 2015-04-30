/**
 * Created by Matute on 26/04/2015.
 */
(function() {
    'use strict';

    angular.module('login.changepwd', ['ngRoute', 'toastr'])

        .config(['$routeProvider', function ($routeProvider) {
            $routeProvider.when('/changepwd', {
                templateUrl: './change-pwd/changepwd.html',
                controller: 'ChangePwdCtrl'
            });
        }])
        .controller('ChangePwdCtrl', ChangePwdCtrl)
        .factory('ChangePwdService', ChangePwdService);

    //Injects
    ChangePwdCtrl.$inject = ['ChangePwdService', '$scope', '$location', 'toastr'];
    ChangePwdService.$inject = ['$http'];

    /**
     *
     * @param ChangePwdService
     * @param $scope
     * @param $location
     * @param toastr
     * @constructor
     */
    function ChangePwdCtrl(ChangePwdService, $scope, $location, toastr) {

        // Variables
        $scope.email = '';
        $scope.password = '';
        $scope.password_1 = '';
        $scope.password_2 = '';

        // Function Declarations
        //asigno la funcion a una variable
        $scope.changePassword = changePassword;

        /**
         * Envia un mail para recuperar la Password o bien para tener una nueva
         */
        function changePassword() {
            ///Valido que ingrese las 3 contraseñas
            if($scope.email !== '' && $scope.password !== '' && $scope.password_1 !== '' && $scope.password_2 !== '') {
                if (ValidateEmail($scope.signup.email)) {
                    ///Verifico que la contraseña ingresada sea valida y que no caduco
                    ChangePwdService.validatePassword($scope.email, $scope.password, function (data) {
                        if (data.isValid == "true") {
                            ChangePwdService.savePassword(data.user, $scope.password_1, function (result) {
                                if (result == "true") {
                                    toastr.success('La contrase&ntilde;a fue modificada satisfactoriamente');
                                }
                                else {
                                    toastr.error('Se produjo un error guardando la nueva contrase&ntilde;a');
                                }
                            });
                        }
                        else {
                            toastr.error('La contrase&ntilde;a ingresada expiro. Por favor genere una nueva.');
                        }
                    });
                }
                else {
                    toastr.error('Por favor ingrese una direccion de Mail valida');
                }
            }
            else {
                toastr.error('Por favor complete todos los campos');
            }
        }
    }

    /**
     *
     * @param email
     * @returns {boolean}
     */
    function ValidateEmail(email)
    {
        var re = /\S+@\S+\.\S+/;
        return re.test(email)
    }

    /**
     *
     * @param $http
     * @returns {{}}
     * @constructor
     */
    function ChangePwdService($http) {
        //Variables
        var service = {};

        //Function declarations
        service.validatePassword = validatePassword;
        service.savePassword = savePassword;

        return service;

        /**
         *
         * @param password
         * @param callback
         * @returns {*}
         */
        function validatePassword(email, password, callback) {
            return $http.post('./login-api/user.php',
                {
                    'function': 'getUserByEmail',
                    'email': email
                })
                .success(function (data) {
                    //console.log(data);
                    if (data) {
                        var user = JSON.parse(data.user);
                        if(user.password == password) {
                            var minutes = getMinutes(user.passwordExpirationDate, new Date());
                            if(minutes < 10) {
                                data.isValid = true;
                            }
                            else {
                                data.isValid = false;
                                data.message = "Su contraseña expiro. Por favor genere una nueva contraseña";
                            }
                        }
                        else {
                            data.isValid = false;
                            data.message = "La contraseña ingresada no coinciden";
                        }
                        callback(data);
                    }
                })
                .error()
        }

        /**
         *
         * @param password
         * @param callback
         * @returns {*}
         */
        function savePassword(user, password, callback) {
            return $http.post('./login-api/user.php',
                {
                    'function': 'resetPassword',
                    'user': user,
                    'password': password
                })
                .success(function (data) {
                    //console.log(data);
                    if (data) {
                        callback(data);
                    }
                })
                .error()
        }

        /**
         * Retorno la cantidad de minutos entre dos fechas
         * @param dateFrom
         * @param dateTo
         * @returns {number}
         */
        function getMinutes(dateFrom, dateTo) {
            var diff = Math.abs(dateTo - dateFrom);
            var minutes = Math.floor((diff/1000)/60);

            return minutes;
        }
    }

})();
