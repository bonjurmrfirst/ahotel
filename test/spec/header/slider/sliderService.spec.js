describe('ahotelApp slider service', function () {
    var sliderService;

    beforeEach(function() {
        module('ahotelApp');

        /*module(function($provide) {
            $provide.value('sliderImgPathConstant', ['123', 'abc']);
        });*/
    });

    beforeEach(inject(function (_sliderService_) {
        sliderService = _sliderService_;
    }));

    it('should return an array of images source list', function () {
        expect(Array.isArray(sliderService.getImageSrcList())).toBe(true);
    });

    it('should return an not empty array of images source list', function () {
        expect(sliderService.getImageSrcList().length).toBeGreaterThan(0);
    });

    it('should return src of current slide', function () {
        expect(typeof sliderService.getCurrentSlide()).toBe('string');
        expect(sliderService.getCurrentSlide()).not.toBe('');
    });

    it('should return index of current slide if getImageSrcList invoked with arg == true', function () {
        expect(typeof sliderService.getCurrentSlide(true)).toBe('number');
        expect(typeof sliderService.getCurrentSlide(1)).toBe('number');
        expect(typeof sliderService.getCurrentSlide(null)).toBe('string');
    });

    it('current slide index by default is 0', function () {
        expect(sliderService.getCurrentSlide(true)).toBe(0);
    });

    it('should set current slide by index', function () {
        sliderService.setCurrentSlide(2);
        expect(sliderService.getCurrentSlide(true)).toBe(2);
    });

    it('shouldn\'t set current slide by index, if (index < 0) or (index > slider gallery length) ', function () {
        sliderService.setCurrentSlide(-1);
        expect(sliderService.getCurrentSlide(true)).toBe(0);

        sliderService.setCurrentSlide(15);
        expect(sliderService.getCurrentSlide(true)).toBe(0);

        sliderService.setCurrentSlide();
        expect(sliderService.getCurrentSlide(true)).toBe(0);
    });

    it('shouldn\'t set current slide by index, if arg of setCurrentSlide is not present or equals NaN', function () {
        sliderService.setCurrentSlide(1);

        sliderService.setCurrentSlide();
        expect(sliderService.getCurrentSlide(true)).toBe(1);

        sliderService.setCurrentSlide(15);
        expect(sliderService.getCurrentSlide(true)).toBe(1);

        sliderService.setCurrentSlide('a.2a');
        expect(sliderService.getCurrentSlide(true)).toBe(1);
    });

    it('should set next slide', function () {
        sliderService.setCurrentSlide(1);
        sliderService.setNextSlide();

        expect(sliderService.getCurrentSlide(true)).toBe(2);
        expect(typeof sliderService.getCurrentSlide()).toBe('string');
    });

    it('setNextSlide should set 1st slide if current slide is last', function () {
        sliderService.setCurrentSlide(sliderService.getImageSrcList().length - 1);
        sliderService.setNextSlide();

        expect(sliderService.getCurrentSlide(true)).toBe(0);
        expect(typeof sliderService.getCurrentSlide()).toBe('string');
    });

    it('should set prev slide', function () {
        sliderService.setCurrentSlide(1);
        sliderService.setPrevSlide();

        expect(sliderService.getCurrentSlide(true)).toBe(0);
        expect(typeof sliderService.getCurrentSlide()).toBe('string');
    });

    it('setNextSlide should set last slide if current slide is 1st', function () {
        sliderService.setCurrentSlide(0);
        sliderService.setPrevSlide();

        expect(sliderService.getCurrentSlide(true)).toBe(sliderService.getImageSrcList().length - 1);
        expect(typeof sliderService.getCurrentSlide()).toBe('string');
    });
});