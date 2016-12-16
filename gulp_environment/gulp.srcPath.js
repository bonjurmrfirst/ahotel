module.exports = {
	index: './src/index.html',
	templates: './src/app/templates/**/*.html',
	app: 'src/app/**/*.js',
	vendorList: [
		'./src/assets/vendor/html5shiv.angular.js'
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

	htmlValidatorDist: './htmlValidator'
};