describe('ahotel slider directive', function() {
    var
        elm, scope,
        homeTemplate, directiveTemplate;

    beforeEach(module('ahotelApp'));

    beforeEach(inject(function($templateCache) {
        homeTemplate = null;
        var req = new XMLHttpRequest();
        req.onload = function() {
            homeTemplate = this.responseText;
        };
        req.open("get", "src/app/templates/home/home.html", false);
        req.send();
        $templateCache.put("app/templates/home/home.html", homeTemplate);

        directiveTemplate = null;
        req = new XMLHttpRequest();
        req.onload = function() {
            directiveTemplate = this.responseText;
        };
        req.open("get", "src/app/templates/header/slider/slider.html", false);
        req.send();
        $templateCache.put("src/app/templates/header/slider/slider.html", directiveTemplate);
    }));

    beforeEach(inject(function ($rootScope, $compile) {
        elm = angular.element(directiveTemplate);
        scope = $rootScope;
        $compile(elm)(scope);

        scope.slider = {
            getImageSrcList: function(){return [1,2,3,4,5];},
            nextSlide: function(){},
            prevSlide: function(){}
        };

        scope.$digest();
    }));

    it('should generate images from getImageSrcList', function() {
        expect(elm.find('img').length).toBeDefined()
    });

    it('images count should equals length of image collection', function() {
        expect(elm.find('img').length).toBe(5)
    });

    it('should get next slide on buttonNext click', function() {
        spyOn(scope.slider, 'nextSlide');
        nextSlideClick = angular.element(elm.find('button')[0]).attr('ng-click').slice(0, -2);
        scope.slider[nextSlideClick]();
        expect(scope.slider.nextSlide).toHaveBeenCalled();
    });

    it('should get prev slide on buttonPrev click', function() {
        spyOn(scope.slider, 'prevSlide');
        nextSlideClick = angular.element(elm.find('button')[1]).attr('ng-click').slice(0, -2);
        scope.slider[nextSlideClick]();
        expect(scope.slider.prevSlide).toHaveBeenCalled();
    });
});