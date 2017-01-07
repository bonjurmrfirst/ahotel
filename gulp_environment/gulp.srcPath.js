module.exports = {
	src: './src/**/*.*',
	index: './src/index.html',
	templates: './src/app/partials/**/*.html',
	app: 'src/app/**/*.js',
	vendorList: {
		root: './src/assets/vendor/**/*.*',
		notMinified: [
			'**/angularShiv.js',
			'**/html5shiv.js'
		],
		minified: [
			'./src/assets/vendor/placeholder.js',
			'./src/assets/vendor/promise.js'
		]
	},
	sass: './src/sass/**/*.sass',
	sassMainFile: './src/sass/styles.sass',

	dev: {
		root: './dist.dev',
		app: './dist.dev/app',
		outputAppFileName: 'app.js',
		templates: './dist.dev/app/templates',
		vendor: './dist.dev/assets/vendor',
		css: './dist.dev/styles'
	},

	dist: {
		root: './dist',
		app: './dist/app',
		outputAppFileName: 'app.js',
		templates: './dist/app/templates',
		vendor: './dist/assets/vendor',
		css: './dist/styles',
		temp: './dist/tmp'
	},

	copyAsIs: {
		from: [
			'./src/assets/images/**/*.*',
			'./src/assets/fonts/**/*.*'
		],
		toDev: './dist.dev/assets',
		toDist: './dist/assets',
		base: './src/assets'
	},

	htmlValidatorDist: './htmlValidator'
};