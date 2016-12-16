module.exports = {
	build: {
		minifyIndex: false,
		removeCommentsIndex: false,
		cleanDistFolder: true
	},
	dev: {
		transpile: true,
		autoprefixer: true
	},
	ftp: {
		FTPpathIsPresent: true,
		cleanDestBeforeUpload: true
	},
	js: {
		babelConfig: {
			presets: ['es2015']
		},
		ngAnnotate: false
	}
};

const gutil = require('gulp-util');

module.exports.errorHandler = function (title) {
	return function (err) {
		gutil.log(gutil.colors.red(`[${title}]`), err.toString());
		//TODO
		this.emit('end');
	};
};