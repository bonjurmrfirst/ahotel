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
            this._credentials = null;

            this._onResolve = (response) => {
                if (response.status === 200) {
                    console.log(response);
                    if (response.data.token) {
                        tokenKeeper.saveToken(response.data.token);
                    }
                    return 'OK'
                }
            };

            this._onRejected = function(response) {
                return response.data
            };

            var tokenKeeper = (function() {
                let token = null;

                function saveToken(_token) {
                    token = _token;
                    console.log(token)
                }

                function getToken() {
                    return token;
                }

                return {
                    saveToken: saveToken,
                    getToken: getToken
                }
            })();
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
                .then(this._onResolve, this._onRejected);
        };

        User.prototype.login = function(credentials) {
            this._credentials = credentials;

            return $http({
                method: 'POST',
                url: this._backendApi,
                params: {
                    action: 'get'
                },
                data: this._credentials
            })
                .then(this._onResolve, this._onRejected);
        };

        return new User(backendPathsConstant.auth);
    }
})();