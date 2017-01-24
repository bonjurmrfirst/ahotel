(function () {
    angular
        .module('ahotelApp')
        .controller('BookingFormController', BookingFormController);

    BookingFormController.$inject = ['$http', 'backendPathsConstant', '$scope', '$log'];

    function BookingFormController($http, backendPathsConstant, $scope, $log) {
        'use strict';
        this.showForm = true;

        this.form = {
            date: 'pick date',
            guests: 1
        };

        this.addGuest = function () {
            this.form.guests !== 5 ? this.form.guests++ : this.form.guests
        };

        this.removeGuest = function () {
            this.form.guests !== 1 ? this.form.guests-- : this.form.guests
        };

        this.submit = function() {
            $http({
                method: 'GET',
                url: backendPathsConstant.booking,
                data: this.form
            }).then(onResolve, onRejected);

            let self = this;
            function onResolve(response) {
                self.showForm = false;

                $scope.$root.$broadcast('modalOpen', {
                    show: 'text',
                    header: 'Your request is in process.',
                    message: 'We will send you email with all information about your travel.'
                });
            }

            function onRejected(response) {
                $log.error('Cant post /booking');
                $scope.$root.$broadcast('displayError', {
                    show: true,
                    message: 'Server is not responding. Try again or call hotline: +0 123 456 89'
                })
             }
             /*
             }, (response) => {
             if (!response) {
                        */
        }
    }
})();