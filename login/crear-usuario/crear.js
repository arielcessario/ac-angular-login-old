(function(){

    'use strict';

    angular.module('login.crear', ['ngRoute', 'toastr'])

        .config(['$routeProvider', function($routeProvider) {
            $routeProvider.when('/crear', {
                templateUrl: './crear-usuario/crear.html',
                controller: 'CrearCtrl'
            });
        }])

        .controller('CrearCtrl', CrearCtrl)
        .factory('CrearService', CrearService);



    CrearCtrl.$inject = ['CrearService', '$location', 'toastr'];
    CrearService.$inject = ['$http'];


    function CrearCtrl(CrearService, $location, toastr) {
        var vm = this;
        // Variables


        // Function Declarations
        vm.create = create;
        vm.test = function(){
        CrearService.test();
        }

        //toastr.success('Usuario creado con éxito');

        //Implementation
        function create(){
            CrearService.Create(vm.nombre, vm.apellido, vm.username, vm.password,
            function(data){
            //console.log(data);
            
                if(data){
                    toastr.success('Usuario creado con éxito');
                    $location.path('#');
                }else{
                    toastr.error('Vuelva a intentar');
                    console.log(data);
                }
            });
        }
    }

    function CrearService($http){
        var service = {};

        service.Create = Create;
        service.test = test;
        
       

        return service;

function test(){
return $http.post('./login-api/test.php',
                {'function': 'test'})
                .success(function(data){
                    console.log(data);
                })
                .error(function(data){
                    console.log(data);
                });
}

        //Functions
        function Create(nombre, apellido, username, password, callback){
            var user = {
                'nombre': nombre,
                'apellido': apellido,
                'username': username,
                'password': password
            };

            return $http.post('./login-api/user.php',
                {'function': 'create', 'user': JSON.stringify(user) })
                .success(function(data){
                    callback(data);
                })
                .error(function(data){
                    console.log(data);
                });
        }

    }


})();