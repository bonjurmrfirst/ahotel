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
		.pipe(browserSync.reload({ stream: true }));
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
			plugins.babel(SETTINGS.js.babelConfig).on('error', plugins.util.log) :
			plugins.epmty())
		.pipe(plugins.angularFilesort().on('error', plugins.util.log))
		.pipe(plugins.angularFilesort().on('error', plugins.util.log))
		.pipe(plugins.concat(SRC_PATH.dev.outputAppFileName).on('error', plugins.util.log))
		.pipe(SETTINGS.js.ngAnnotate ?
			plugins.ngAnnotate().on('error', plugins.util.log) :
			plugins.empty())
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(SRC_PATH.dev.app))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('vendor', function() {
	return gulp.src(SRC_PATH.vendorList)
		.pipe(gulp.dest(SRC_PATH.dev.vendor))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('styles', function() {
	return gulp.src(SRC_PATH.sassMainFile)
		.pipe(plugins.sourcemaps.init())
		.pipe(plugins.sass().on('error', plugins.sass.logError))
		.pipe(plugins.postcss(postcssProcessors).on('error', plugins.util.log))
		.pipe(SETTINGS.dev.autoprefixer ?
			plugins.autoprefixer({
				browsers: ['>0%'],
				cascade: false
			}).on('error', plugins.util.log) :
			plugins.empty())
		.pipe(plugins.sourcemaps.write())
		.pipe(gulp.dest(SRC_PATH.dev.css))
		.pipe(browserSync.reload({ stream: true }));
});

gulp.task('copy', function() {
	return gulp.src(SRC_PATH.copyAsIs.from, {base: SRC_PATH.copyAsIs.base})
		.pipe(gulp.dest(SRC_PATH.copyAsIs.toDev))
});

gulp.task('watch', function() {
	gulp.watch(SRC_PATH.index, gulp.series('index'));
	gulp.watch(SRC_PATH.templates, gulp.series('templates'));
	gulp.watch(SRC_PATH.app, gulp.series('app-js'));
	gulp.watch(SRC_PATH.sass, gulp.series('styles'));
	gulp.watch(SRC_PATH.vendorList, gulp.series('vendor'));
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
		.pipe(plugins.htmlmin({collapseWhitespace: true}).on('error', plugins.util.log))
		.pipe(gulp.dest(SRC_PATH.dist.templates))
});

gulp.task('htmlValidator:build', function () {
	/*const excludeIndex = [SRC_PATH.templates];
	const f = plugins.filter(excludeIndex, {restore: true});*/
	const prependString = '<!doctype html><html><head><title>Title</title></head><body>',
				appendString = '</body></html>';
	return gulp.src([SRC_PATH.templates])
		.pipe(plugins.injectString.prepend(prependString).on('error', plugins.util.log))
		.pipe(plugins.injectString.append(appendString).on('error', plugins.util.log))
		.pipe(plugins.htmlValidator({format: 'html'}).on('error', plugins.util.log))
		.pipe(gulp.dest(SRC_PATH.htmlValidatorDist));
});

gulp.task('app-js:build', function() {
	return gulp.src(SRC_PATH.app)
		.pipe(plugins.babel(SETTINGS.js.babelConfig).on('error', plugins.util.log))
		.pipe(plugins.angularFilesort().on('error', plugins.util.log))
		.pipe(plugins.angularFilesort().on('error', plugins.util.log))
		.pipe(plugins.concat(SRC_PATH.dist.outputAppFileName).on('error', plugins.util.log))
		.pipe(SETTINGS.js.ngAnnotate ?
			plugins.ngAnnotate().on('error', plugins.util.log) :
			plugins.empty())
		.pipe(plugins.uglify().on('error', plugins.util.log))
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
	return gulp.src(SRC_PATH.vendorList)
		.pipe(plugins.uglify().on('error', plugins.util.log))
		.pipe(gulp.dest(SRC_PATH.dist.vendor))
});

gulp.task('styles:build', function() {
	return gulp.src(SRC_PATH.sassMainFile)
		.pipe(plugins.sass().on('error', plugins.sass.logError))
		.pipe(plugins.postcss(postcssProcessors).on('error', plugins.util.log))
		.pipe(plugins.autoprefixer({
			browsers: ['>0%'],
			cascade: false
		}).on('error', plugins.util.log))
		.pipe(plugins.cleanCss({debug: true, compatibility: 'ie8'}, function(details) {
			console.log(details.name + ': ' + details.stats.originalSize);
			console.log(details.name + ': ' + details.stats.minifiedSize);
			console.log('efficiency: ' + details.stats.efficiency);
		}).on('error', plugins.util.log))
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

	return gulp.src( globs, { base: SRC_PATH.dist.root, buffer: false } ) //buffer? read:false...?
		.pipe(connection.newer(FTP_PATH.dest).on('error', plugins.util.log))
		.pipe(connection.dest(FTP_PATH.dest).on('error', plugins.util.log));
});
// Upload END

/*
	Chains
 */
gulp.task('dev',
	gulp.series([
		'index',
		'templates',
		'app-js',
		'vendor',
		'styles',
		'copy',
		gulp.parallel([
			'watch',
			'browser-sync-server'
		])
	])
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
		'build',
		'clean:upload',
		'copy:upload'
	)
);
// Chains END
