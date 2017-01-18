(function() {
    'use strict';

    angular
        .module('ahotelApp')
        .factory('filtersService', filtersService);

    filtersService.$inject = ['hotelDetailsConstant', '$log'];

    function filtersService(hotelDetailsConstant, $log) {

        /*let model,
            filteredModel,
            filters = {};

        function initFilters() {
            filters = {};

            for (let key in hotelDetailsConstant) {
                filters[key] = {};
                for (let i = 0; i < hotelDetailsConstant[key].length; i++) {
                    filters[key][hotelDetailsConstant[key][i]] = false;
                }
            }

            filters.price = {
                min: 0,
                max: 1000
            };

            return filters
        }

        function setModel(newModel) {
            model = currenetModel;
        }

        function applyFilters(newFilters) {


            return resultModel;
        }

        return {
            initFilters: initFilters,
            setModel: setModel,
            applyFilters: applyFilters
        };*/

        function FiltersHandler(initFilters) {
            this._initFilters = initFilters;
            this._filters = {};

            this._model = null;
            this._filteredModel = null;
        }

        FiltersHandler.prototype.createFilters = function() {
            let filters = {};

            for (let key in this._initFilters) {
                filters[key] = {};
                for (let i = 0; i < this._initFilters[key].length; i++) {
                    filters[key][this._initFilters[key][i]] = false;
                }
            }

            filters.price = {
                min: 0,
                max: 1000
            };

            return filters
        };

        FiltersHandler.prototype.applyFilter = function(newFilterGroup, newFilter, value) {
            this._filteredModel = [];

            this._filters = newFilters;
            console.log(this._filters);

            for (let hotel in this._model) {
                let match = true;

                for (let filterGroup in this._filters) {
                    console.log(this._filters[filterGroup])
                    for (let filter in this._filters[filterGroup]) {
                        console.log(filter)
                    }
                }
            }

            if (value) {
                this._filters[newFilterGroup] = this._filters[newFilterGroup] || {};
                this._filters[newFilterGroup][newFilter] = true;
            } else {
                delete this._filters[newFilterGroup][newFilter];
                if (Object.keys(this._filters[newFilterGroup]).length === 0) {
                    delete this._filters[newFilterGroup]
                }
            }

            if (Object.keys(this._filters).length === 0) {
                this._filteredModel = this._model;

                return this;
            }

            this._filteredModel = [];



            return this;
        };

        FiltersHandler.prototype.getModel = function() {
            return this._filteredModel;
        };

        FiltersHandler.prototype.setModel = function(model) {
            this._model = model;
            this._filteredModel = model;

            return this;
        };

        return new FiltersHandler(hotelDetailsConstant)
    }
})();
/*

 return {
 initFilters: initFilters
 };

 function initFilters(obj) {
 let filters = {};

 for (let key in hotelDetailsConstant) {
 filters[key] = {};
 for (let i = 0; i < hotelDetailsConstant[key].length; i++) {
 filters[key][hotelDetailsConstant[key][i]] = false;
 }
 }

 filters.price = {
 min: 0,
 max: 1000
 };

 return filters
 }

 */


/*let model,
 filteredModel,
 filters = {};

 function initFilters() {
 filters = {};

 for (let key in hotelDetailsConstant) {
 filters[key] = {};
 for (let i = 0; i < hotelDetailsConstant[key].length; i++) {
 filters[key][hotelDetailsConstant[key][i]] = false;
 }
 }

 filters.price = {
 min: 0,
 max: 1000
 };

 return filters
 }

 function setModel(newModel) {
 model = currenetModel;
 }

 function applyFilters(newFilters) {


 return resultModel;
 }

 return {
 initFilters: initFilters,
 setModel: setModel,
 applyFilters: applyFilters
 };*/