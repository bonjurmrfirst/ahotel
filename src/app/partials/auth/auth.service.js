(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .factory('authService', authService);

    authService.$inject = ['$rootScope', '$http', 'backendPathsConstant'];

    function authService($rootScope, $http, backendPathsConstant) {
        //todo errors
        function User(backendApi) {
            this._backendApi = backendApi;
            this._credentials = null;

            this._onResolve = (response) => {
                if (response.status === 200) {
                    console.log(response);
                    if (response.data.token) {
                        this._tokenKeeper.saveToken(response.data.token);
                    }
                    return 'OK'
                }
            };

            this._onRejected = function(response) {
                if (response.data === 'User already exists' || response.data === 'Login or password incorrect') {
                    return response
                }
                $rootScope.$broadcast('displayError', {show: true});
            };

            this._tokenKeeper = (function() {
                let token = null;

                function saveToken(_token) {
                    $rootScope.$logged = true;
                    token = _token;
                    console.debug(token)
                }

                function getToken() {
                    return token;
                }

                function deleteToken() {
                    token = null;
                }

                return {
                    saveToken: saveToken,
                    getToken: getToken,
                    deleteToken: deleteToken
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

        User.prototype.signIn = function(credentials) {
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

        User.prototype.signOut = function() {
            $rootScope.$logged = false;
            this._tokenKeeper.deleteToken();
        };

        User.prototype.getLogInfo = function() {
            return {
                credentials: this._credentials,
                token: this._tokenKeeper.getToken()
            }
        };

        return new User(backendPathsConstant.auth);
    }
})();