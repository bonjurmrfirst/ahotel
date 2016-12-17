module.exports = {
	index: './src/index.html',
	templates: './src/app/templates/**/*.html',
	app: 'src/app/**/*.js',
	vendorList: [
		'./src/assets/vendor/placeholder.js',
		'./src/assets/vendor/angularShiv.js'
	],
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