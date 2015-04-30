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
        // Functions
        var vm = this;

        // Variables
        vm.email = '';
        vm.password = '';
        vm.password_1 = '';
        vm.password_2 = '';

        // Function Declarations
        //asigno la funcion a una variable
        vm.changePassword = changePassword;

        /**
         * Envia un mail para recuperar la Password o bien para tener una nueva
         */
        function changePassword() {
            console.log(vm.email);
            ///Valido que ingrese las 3 contraseñas
            if(vm.email !== '' && vm.password !== '' && vm.password_1 !== '' && vm.password_2 !== '') {
                if (ValidateEmail(vm.email)) {
                    if(vm.password_1 === vm.password_2) {
                        ///Verifico que la contraseña ingresada sea valida y que no caduco
                        ChangePwdService.validatePassword(vm.email, vm.password, function (data) {
                            console.log(data);
                            if (data.isValid == "true") {
                                ChangePwdService.savePassword(data.user, vm.password_1, function (result) {
                                    if (result == "true") {
                                        toastr.success('La contrase&ntilde;a fue modificada satisfactoriamente');
                                    }
                                    else {
                                        toastr.error('Se produjo un error guardando la nueva contrase&ntilde;a');
                                    }
                                });
                            }
                            else {
                                toastr.error(data.message);
                            }
                        });
                    }
                    else {
                        toastr.error('Las contraseñas nuevas no son iguales. Por favor ingrese las mismas contraseñas');
                    }
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
                    'function': 'getUserByEmailAndPassword',
                    'email': email,
                    'password': password
                })
                .success(function (data) {
                    if (data) {
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
                    'password': password,
                    'changepwd': '0'
                })
                .success(function (data) {
                    console.log(data);
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
