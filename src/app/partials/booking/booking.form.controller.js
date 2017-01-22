(function () {
    angular
        .module('ahotelApp')
        .controller('BookingFormController', BookingFormController)

    function BookingFormController() {
        'use strict';

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

        }
    }
})();