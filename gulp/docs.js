const gulp 				 = require('gulp');

// HTML
const fileInclude  = require('gulp-file-include');
const htmlclean 	 = require('gulp-htmlclean');
const webpHTML 		 = require('gulp-webp-html');
const panini 		 	 = require('panini');

// SASS
const sass 				 = require('gulp-sass')(require('sass'));
const concat 			 = require('gulp-concat');
const sassGlob 		 = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const csso 				 = require('gulp-csso');
const webpCss 		 = require('gulp-webp-css');

const server 			 = require('gulp-server-livereload');
const clean 			 = require('gulp-clean');
const fs 					 = require('fs');
const sourceMaps 	 = require('gulp-sourcemaps');
const groupMedia 	 = require('gulp-group-css-media-queries');
const plumber 		 = require('gulp-plumber');
const notify 			 = require('gulp-notify');
const webpack 		 = require('webpack-stream');
const babel 			 = require('gulp-babel');
const changed 		 = require('gulp-changed');

// Images
const imagemin 		 = require('gulp-imagemin');
const webp 				 = require('gulp-webp');

//SVG
const svgsprite    = require('gulp-svg-sprite');

gulp.task('clean:docs', function (done) {
	if (fs.existsSync('./docs/')) {
		return gulp
			.src('./docs/', { read: false })
			.pipe(clean({ force: true }));
	}
	done();
});

const fileIncludeSetting = {
	prefix: '@@',
	basepath: '@file',
};

const plumberNotify = (title) => {
	return {
		errorHandler: notify.onError({
			title: title,
			message: 'Error <%= error.message %>',
			sound: false,
		}),
	};
};

gulp.task('html:docs', function () {
	panini.refresh();
	return gulp
	.src([
		'./app/html/**/*.html',
		'!./app/html/blocks/*.html',
		'!./app/html/partials/*.html',
		'!./app/html/layouts/*.html'
])
		.pipe(panini({
			root: 		 './app/',
			layouts: 	 './app/html/layouts/',
			partials:  './app/html/partials/',
			helpers: 	 './app/html/helpers/',
			data: 		 './app/html/data/',
		}))
		.pipe(changed('./docs/'))
		.pipe(plumber(plumberNotify('HTML')))
		.pipe(fileInclude(fileIncludeSetting))
		.pipe(webpHTML())
		.pipe(htmlclean())
		.pipe(gulp.dest('./docs/'));
});

gulp.task('sass:docs', function () {
	return gulp
		.src('./app/scss/*.scss')
		.pipe(changed('./docs/css/'))
		.pipe(plumber(plumberNotify('SCSS')))
		.pipe(sourceMaps.init())
		.pipe(autoprefixer())
		.pipe(concat('style.min.css'))
		.pipe(sassGlob())
		.pipe(webpCss())
		.pipe(groupMedia())
		.pipe(sass({ outputStyle: 'compressed' }))
		.pipe(csso())
		.pipe(sourceMaps.write())
		.pipe(gulp.dest('./docs/css/'));
});

gulp.task('images:docs', function () {
	return gulp
    .src(['./app/images/**/*', '!./app/images/svgicons/**/*'])
		.pipe(changed('./docs/images/'))
		.pipe(webp())
		.pipe(gulp.dest('./docs/images/'))
		.pipe(gulp.src('./app/images/**/*'))
		.pipe(changed('./docs/images/'))
		.pipe(imagemin({ verbose: true }))
		.pipe(gulp.dest('./docs/images/'));
});

const svgStack = {
	mode: {
		stack: {
			example: true,
		},
	},
};

const svgSymbol = {
	mode: {
		symbol: {
			sprite: '../sprite.symbol.svg',
		},
	},
	shape: {
		transform: [
			{
				svgo: {
					plugins: [
						{
							name: 'removeAttrs',
							params: {
								attrs: '(fill|stroke)',
							},
						},
					],
				},
			},
		],
	},
};

gulp.task('svgStack:docs', function () {
	return gulp
		.src('./app/images/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgStack))
		.pipe(gulp.dest('./docs/images/svgsprite/'));
});

gulp.task('svgSymbol:docs', function () {
	return gulp
		.src('./app/images/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest('./docs/images/svgsprite/'));
});

gulp.task('fonts:docs', function () {
	return gulp
		.src('./app/fonts/**/*')
		.pipe(changed('./docs/fonts/'))
		.pipe(gulp.dest('./docs/fonts/'));
});

gulp.task('files:docs', function () {
	return gulp
		.src('./app/files/**/*')
		.pipe(changed('./docs/files/'))
		.pipe(gulp.dest('./docs/files/'));
});

gulp.task('js:docs', function () {
	return gulp
		.src('./app/js/*.js')
		.pipe(changed('./docs/js/'))
		.pipe(plumber(plumberNotify('JS')))
		.pipe(babel())
		.pipe(webpack(require('./../webpack.config.js')))
		.pipe(gulp.dest('./docs/js/'));
});

const serverOptions = {
	livereload: true,
	open: true,
};

gulp.task('server:docs', function () {
	return gulp.src('./docs/').pipe(server(serverOptions));
});
