(function () {
    'use strict';

    angular
        .module('ahotelApp')
        .controller('Pages', Pages);

    Pages.$inject = ['$scope'];

    function Pages($scope) {
        const hotelsPerPage = 5;

        this.currentPage = 1;
        this.pagesTotal = [];

        this.showFrom = function() {
            return (this.currentPage - 1) * hotelsPerPage;
        };

        this.showNext = function() {
            return ++this.currentPage;
        };

        this.showPrev = function() {
            return --this.currentPage;
        };

        this.setPage = function(page) {
            this.currentPage = page + 1;
        };

        this.isLastPage = function() {
            return this.pagesTotal.length === this.currentPage
        };

        this.isFirstPage = function() {
            return this.currentPage === 1
        };

        $scope.$on('showHotelCountChanged', (event, showHotelCount) => {
            this.pagesTotal = new Array(Math.ceil(showHotelCount / hotelsPerPage));
            this.currentPage = 1;
        });
    }
})();