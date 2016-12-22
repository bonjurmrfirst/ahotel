"use strict";

const gulp = require('gulp'),
	plugins = require('gulp-load-plugins')({ //TODO config gulp-plugins
		pattern: ['gulp-*', 'gulp.*'],
		lazy: true,
		camelize: true
	}),
	browserSync = require('browser-sync'),
	ftp = require( 'vinyl-ftp');


const SETTINGS = require('./gulp_environment/gulp.settings'),
	SRC_PATH = require('./gulp_environment/gulp.srcPath'),
	CDN_PATH = require('./gulp_environment/gulp.CDNpath'),
	FTP_PATH = SETTINGS.ftp.FTPpathIsPresent ? require('./gulp_environment/gulp.FTPpath') : null;

/*
 Dev
 */
var postcssProcessors = [
	function (css, opts) {
		css.eachDecl(function(decl) {
			if (decl.prop === 'opacity') {
				decl.parent.insertAfter(decl, {
					prop: '-ms-filter',
					value: '"progid:DXImageTransform.Microsoft.Alpha(Opacity=' + (parseFloat(decl.value) * 100) + ')"'});
			}
		});
	}
];

let errorHandler = function (title) {
	return function (err) {
		plugins.util.log(plugins.util.colors.white.bgRed(`[${title}]`), err.toString());
		//TODO
		this.emit('end');
	};
};

gulp.task('browser-sync-server', function() {
	browserSync.init({
		server: {
			baseDir: SRC_PATH.dev.root,
			routes: {
				"/bower_components": "bower_components"
			}
		},
		logLevel: 'info',
		logFileChanges: true,
		notify: false,
		injectChanges: true,
		browser: "chrome"
	});

	//todo browserSync.watch('./src/**/*.html').on('change', browserSync.reload);
});

gulp.task('index', function() {
	return gulp.src(SRC_PATH.index)
		.pipe(gulp.dest(SRC_PATH.dev.root))
		.pipe(browserSync.reload({ stream: true }))
});

gulp.task('templates', function() {
	return gulp.src(SRC_PATH.templates)
		.pipe(gulp.dest(SRC_PATH.dev.templates))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('app-js', function() {
	return gulp.src(SRC_PATH.app)
		.pipe(plugins.sourcemaps.init())
		.pipe(SETTINGS.dev.transpile ?
			plugins.babel(SETTINGS.js.babelConfig).on('error', errorHandler('Error: Dev Babel')) :
			plugins.epmty())
		.pipe(SETTINGS.js.ngAnnotate ?
			plugins.ngAnnotate().on('error', errorHandler('Error: Dev ngAnnotate')) :
			plugins.empty())
		.pipe(plugins.angularFilesort().on('error', errorHandler('Error: Dev Angular Filesort')))
		.pipe(plugins.angularFilesort().on('error', errorHandler('Error: Dev Angular Filesort')))
		.pipe(plugins.concat(SRC_PATH.dev.outputAppFileName).on('error', errorHandler('Error: Dev Concat')))
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(SRC_PATH.dev.app))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('vendor', function() {
	return gulp.src(SRC_PATH.vendorList.root)
		.pipe(gulp.dest(SRC_PATH.dev.vendor))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('styles', function() {
	return gulp.src(SRC_PATH.sassMainFile)
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.sass().on('error', plugins.sass.logError))
		.pipe(plugins.postcss(postcssProcessors).on('error', errorHandler('Error: Dev postCss')))
		.pipe(SETTINGS.dev.autoprefixer ?
			plugins.autoprefixer({
				browsers: ['>0%'],
				cascade: false
			}).on('error', errorHandler('Error: Dev Autoprefixer')) :
			plugins.empty())
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(SRC_PATH.dev.css))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('copy', function() {
	return gulp.src(SRC_PATH.copyAsIs.from, {base: SRC_PATH.copyAsIs.base})
		.pipe(gulp.dest(SRC_PATH.copyAsIs.toDev))
});

function consoleTaskDone() {
	plugins.util.log(plugins.util.colors.green.bgWhite.bold('***** DONE *****'));

	return plugins.empty()
}

gulp.task('watch', function() {
	gulp.watch(SRC_PATH.index, gulp.series('index'));
	gulp.watch(SRC_PATH.templates, gulp.series('templates'));
	gulp.watch(SRC_PATH.app, gulp.series('app-js'));
	gulp.watch(SRC_PATH.sass, gulp.series('styles'));
	gulp.watch(SRC_PATH.vendorList.root, gulp.series('vendor'));
});
// Dev END

/*
 Build
 */
gulp.task('clean:build', function() {
	return gulp.src(SRC_PATH.dist.root, {read: false})
		.pipe(SETTINGS.build.cleanDistFolder ? plugins.clean() : plugins.empty())
});

gulp.task('index:build', function() {
	return gulp.src(SRC_PATH.index)
		.pipe(plugins.cdn(CDN_PATH))
		.pipe(SETTINGS.build.minifyIndex ? plugins.htmlmin({collapseWhitespace: true}) : plugins.empty())
		.pipe(SETTINGS.build.removeCommentsIndex ? plugins.stripComments({safe: true}) : plugins.empty())
		.pipe(gulp.dest(SRC_PATH.dist.root))
});

gulp.task('templates:build', function() {
	return gulp.src(SRC_PATH.templates)
		.pipe(plugins.htmlmin({collapseWhitespace: true}).on('error', errorHandler('Error: Build htmlMin')))
		.pipe(gulp.dest(SRC_PATH.dist.templates))
});

gulp.task('htmlValidator:build', function () {
	/*const excludeIndex = [SRC_PATH.templates];
	 const f = plugins.filter(excludeIndex, {restore: true});*/
	const prependString = '<!doctype html><html><head><title>Title</title></head><body>',
		appendString = '</body></html>';
	return gulp.src([SRC_PATH.templates])
		.pipe(plugins.injectString.prepend(prependString).on('error', errorHandler('Error: Build InjectString prepend')))
		.pipe(plugins.injectString.append(appendString).on('error', errorHandler('Error: Build InjectString append')))
		.pipe(plugins.htmlValidator({format: 'html'}).on('error', errorHandler('Error: Build HTML Validator')))
		.pipe(gulp.dest(SRC_PATH.htmlValidatorDist));
});

gulp.task('app-js:build', function() {
	return gulp.src(SRC_PATH.app)
		.pipe(plugins.babel(SETTINGS.js.babelConfig).on('error', errorHandler('Error: Build Babel')))
		.pipe(SETTINGS.js.ngAnnotate ?
			plugins.ngAnnotate().on('error', errorHandler('Error: Build Annotate')) :
			plugins.empty())
		.pipe(plugins.angularFilesort().on('error', errorHandler('Error: Build Angular Filesort')))
		.pipe(plugins.angularFilesort().on('error', errorHandler('Error: Build Angular Filesort')))
		.pipe(plugins.concat(SRC_PATH.dist.outputAppFileName).on('error', errorHandler('Error: Build Concat')))
		.pipe(SETTINGS.build.minifyAppJs ? plugins.uglify().on('error', plugins.util.log) : plugins.empty())
		//.pipe(plugins.minify({noSource: true}))
		//.pipe(plugins.rename({
		//	basename: "app"}))
		/*.pipe(require('gulp-uglify/minifier')({
		 compress: { screw_ie8: false },
		 mangle: { screw_ie8: false },
		 output: { screw_ie8: false }
		 }), require('gulp-uglify'))*/
		//.pipe(plugins.uglify())
		.pipe(gulp.dest(SRC_PATH.dist.app))
});

gulp.task('vendor:build', function() {
	const excludeMinified = SRC_PATH.vendorList.minified;
	/*todo*/ let f = require('gulp-filter'); let ff = f(SRC_PATH.vendorList.notMinified, {restore: true});

	return gulp.src(SRC_PATH.vendorList.root)
		.pipe(ff)
		.pipe(plugins.uglify().on('error', errorHandler('Error: Build Vendor list uglify')))
		.pipe(ff.restore)
		.pipe(gulp.dest(SRC_PATH.dist.vendor))
});

gulp.task('styles:build', function() {
	return gulp.src(SRC_PATH.sassMainFile)
		.pipe(plugins.sass().on('error', plugins.sass.logError))
		.pipe(plugins.postcss(postcssProcessors).on('error', errorHandler('Error: Build postCss')))
		.pipe(plugins.autoprefixer({
			browsers: ['>0%'],
			cascade: false
		}).on('error', errorHandler('Error: Build Autoprefixer')))
		.pipe(plugins.cleanCss({debug: true, compatibility: 'ie8'}, function(details) {
			console.log(details.name + ': ' + details.stats.originalSize);
			console.log(details.name + ': ' + details.stats.minifiedSize);
			plugins.util.log(plugins.util.colors.magenta('efficiency: ' + ~~(details.stats.efficiency * 100) + ' %'));
		}).on('error', errorHandler('Error: Build CleanCss')))
		.pipe(gulp.dest(SRC_PATH.dist.css))
});

gulp.task('copy:build', function() {
	return gulp.src(SRC_PATH.copyAsIs.from, {base: SRC_PATH.copyAsIs.base})
		.pipe(gulp.dest(SRC_PATH.copyAsIs.toDist))
});
// Build END

/*
 Upload
 */
const connection = ftp.create(FTP_PATH);

gulp.task( 'clean:upload', function ( cb ) {
	return SETTINGS.ftp.cleanFTPfolder ?
		connection.rmdir(FTP_PATH.dest, cb) : connection.rmdir(FTP_PATH.dest + '/fakeFolder', cb);
} );

gulp.task('copy:upload', function() {
	const globs = [SRC_PATH.dist.root + '/**/*.*'];

	return gulp.src( globs, { base: SRC_PATH.dist.root, buffer: true } ) //buffer? read:false...?
		.pipe(plugins.size({pretty: true, showFiles: true, showTotal: true}))
		.pipe(connection.differentSize(FTP_PATH.dest).on('error', errorHandler('Error: FTP copy:upload differentSize')))
		.pipe(connection.dest(FTP_PATH.dest).on('error', errorHandler('Error: FTP copy:upload dest')));
});

gulp.task('uploadChangedFile', function() {
	const globs = [SRC_PATH.dist.root + '/**/*.*'];

	return gulp.src( globs, { base: SRC_PATH.dist.root, buffer: true } ) //buffer? read:false...?
		.pipe(connection.differentSize(FTP_PATH.dest).on('error', errorHandler('Error: FTP uploadChangedFile differentSize')))
		.pipe(plugins.size({pretty: true, showFiles: true, showTotal: true}))
		.pipe(connection.dest(FTP_PATH.dest).on('error', errorHandler('Error: FTP uploadChangedFile dest')));
});

gulp.task('watch:upload', function(){
	gulp.watch(SRC_PATH.src, gulp.series('build', 'uploadChangedFile'));
});
// Upload END

/*
 Chains
 */
gulp.task('dev',
	gulp.series(
		gulp.parallel(
			'index',
			'templates',
			'app-js',
			'vendor',
			'styles',
			'copy'
		),
		gulp.parallel(
			'watch',
			'browser-sync-server'
		)
	)
);

gulp.task('build',
	gulp.series(
		'clean:build',
		gulp.parallel(
			'index:build',
			'templates:build',
			'app-js:build',
			'vendor:build',
			'styles:build',
			'copy:build',
			'htmlValidator:build'
		)
	)
);

gulp.task('upload',
	gulp.series(
		gulp.parallel(
			'build',
			'clean:upload'
		),
		'copy:upload'
	)
);
// Chains END