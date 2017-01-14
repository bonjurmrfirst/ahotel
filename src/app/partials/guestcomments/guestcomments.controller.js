(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('GuestcommentsController', GuestcommentsController);

    GuestcommentsController.$inject = ['$rootScope', 'guestcommentsService'];

    function GuestcommentsController($rootScope, guestcommentsService) {
        this.comments = [];

        this.openForm = false;
        this.showPleaseLogiMessage = false;

        this.writeComment = function() {
            if ($rootScope.$logged) {
                this.openForm = true
            } else {
                this.showPleaseLogiMessage = true;
            }
        };

        guestcommentsService.getGuestComments().then(
            (response) => {
                this.comments = response.data;
                console.log(response);
            }
        );

        this.addComment = function() {
            guestcommentsService.sendComment(this.formData)
                .then((response) => {
                    this.comments.push({'name': this.formData.name, 'comment': this.formData.comment});
                    this.openForm = false;
                    this.formData = null;
                })
        };
    }
})();