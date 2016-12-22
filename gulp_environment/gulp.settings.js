module.exports = {
	build: {
		minifyIndex: false,
		minifyAppJs: false,
		removeCommentsIndex: false,
		cleanDistFolder: true
	},
	dev: {
		transpile: true,
		autoprefixer: true
	},
	ftp: {
		FTPpathIsPresent: true,
		cleanFTPfolder: true
	},
	js: {
		babelConfig: {
			presets: ['es2015']
		},
		ngAnnotate: true
	}
};