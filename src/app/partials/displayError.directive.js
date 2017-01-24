(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .directive('ahtlDisplayError', displayErrorDirective);

    displayErrorDirective.$inject = ['$state'];

    function displayErrorDirective() {
        return {
            restrict: 'A',
            link: function($scope, elem) {
                const defaultErrorMsg = 'Could not connect to server. Refresh the page or try again later.';

                $scope.$on('displayError', (event, data) => {
                    let show = data.show ? 'block' : 'none';

                    $(elem).text(data.message || defaultErrorMsg);
                    $(elem).css('display', show);
                });

                $scope.$on('$stateChangeStart', function() {
                    $(elem).css('display', 'none');
                })
            }
        }
    }
})();