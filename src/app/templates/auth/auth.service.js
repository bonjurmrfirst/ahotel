(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .factory('authService', authService);

    authService.$inject = ['$http', 'backendPathsConstant', '$state'];

    function authService($http, backendPathsConstant) {
        //todo errors
        function User(backendApi) {
            this._backendApi = backendApi;
        }

        User.prototype.createUser = function(credentials) {
            return $http({
                method: 'POST',
                url: this._backendApi,
                params: {
                    action: 'put'
                },
                data: credentials
            })
            .then(onResolve, onRejected);

            function onResolve(response) {
                if (response.status === 200) {
                    return 'OK'
                }
            }

            function onRejected(response) {
                return response.data
            }
        };

        return new User(backendPathsConstant.auth);
    }
})();