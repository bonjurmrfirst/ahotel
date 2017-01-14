(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .config(function ($provide) {
            $provide.decorator('$log', function ($delegate, $window) {
                let logHistory = {
                        warn: [],
                        err: []
                    };

                $delegate.log = function (message) {
                };

                let _logWarn = $delegate.warn;
                $delegate.warn = function (message) {
                    logHistory.warn.push(message);
                    _logWarn.apply(null, [message]);
                };

                let _logErr = $delegate.error;
                $delegate.error = function (message) {
                    logHistory.err.push({name: message, stack: new Error().stack});
                    _logErr.apply(null, [message]);
                };

                (function sendOnUnload() {
                    $window.onbeforeunload = function () {
                        if (!logHistory.err.length && !logHistory.warn.length) {
                            return
                        }

                        let xhr = new XMLHttpRequest();
                        xhr.open('post', '/api/log', false);
                        xhr.setRequestHeader('Content-Type', 'application/json');
                        xhr.send(JSON.stringify(logHistory));
                    };
                })();

                return $delegate;
            });
        });
})();

/*
        .factory('log', log);

    log.$inject = ['$window', '$log'];

    function log($window, $log) {


        function warn(...args) {
            logHistory.warn.push(args);

            if (browserLog) {
                $log.warn(args);
            }
        }

        function error(e) {
            logHistory.err.push({
                name: e.name,
                message: e.message,
                stack: e.stack
            });
            $log.error(e);
        }

        //todo all errors



        return {
            warn: warn,
            error: error,
            sendOnUnload: sendOnUnload
        }
    }
})();*/
