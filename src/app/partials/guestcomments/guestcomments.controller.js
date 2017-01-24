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
                if (!response || !response.data) {
                    this.loadCommentsError = true;
                    return
                }
                this.comments = response.data;
            }
        );

        this.addComment = function() {
            guestcommentsService
                .sendComment(this.formData)
                .then((response) => {
                    if (!response) {
                        this.loadCommentsError = true;
                        return
                    }

                    this.comments.push({'name': this.formData.name, 'comment': this.formData.comment});
                    this.openForm = false;
                    this.formData = null;
                })
        };
    }
})();