const gulp 				= require('gulp');
const fileInclude = require('gulp-file-include');
const panini 		 	 = require('panini');
const sass 			 	= require('gulp-sass')(require('sass'));
const concat 			= require('gulp-concat');
const sassGlob 	 	= require('gulp-sass-glob');
const server 		 	= require('gulp-server-livereload');
const clean 	   	= require('gulp-clean');
const fs 				 	= require('fs');
const sourceMaps 	= require('gulp-sourcemaps');
const plumber 	 	= require('gulp-plumber');
const notify 		 	= require('gulp-notify');
const webpack 	 	= require('webpack-stream');
const babel 		 	= require('gulp-babel');
const imagemin 	 	= require('gulp-imagemin');
const svgsprite   = require('gulp-svg-sprite');
const changed 	 	= require('gulp-changed');

gulp.task('clean:dev', function (done) {
	if (fs.existsSync('./build/')) {
		return gulp
			.src('./build/', { read: false })
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

gulp.task('html:dev', function () {
	panini.refresh();
	return (
		gulp
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
			.pipe(changed('./build/', { hasChanged: changed.compareContents }))
			.pipe(plumber(plumberNotify('HTML')))
			.pipe(fileInclude(fileIncludeSetting))
			.pipe(gulp.dest('./build/'))
	);
});

gulp.task('sass:dev', function () {
	return (
		gulp
			.src('./app/scss/*.scss')
			.pipe(changed('./build/css/'))
			.pipe(plumber(plumberNotify('SCSS')))
			.pipe(sourceMaps.init())
			.pipe(sassGlob())
			.pipe(concat('style.min.css'))
			.pipe(sass({ outputStyle: 'compressed' }))
			.pipe(sourceMaps.write())
			.pipe(gulp.dest('./build/css/'))
	);
});

gulp.task('images:dev', function () {
	return gulp
  .src(['./app/images/**/*', '!./app/images/svgicons/**/*'])
		.pipe(changed('./build/images/'))
		// .pipe(imagemin({ verbose: true }))
		.pipe(gulp.dest('./build/images/'));
});

const svgStack = {
	mode: {
		stack: {
			example: true,
		},
	},
	shape: {
		transform: [
			{
				svgo: {
					js2svg: { indent: 4, pretty: true },
				},
			},
		],
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
					js2svg: { indent: 4, pretty: true },
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

gulp.task('svgStack:dev', function () {
	return gulp
		.src('./app/images/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgStack))
		.pipe(gulp.dest('./build/images/svgsprite/'))
});

gulp.task('svgSymbol:dev', function () {
	return gulp
		.src('./app/images/svgicons/**/*.svg')
		.pipe(plumber(plumberNotify('SVG:dev')))
		.pipe(svgsprite(svgSymbol))
		.pipe(gulp.dest('./build/images/svgsprite/'));
});

gulp.task('fonts:dev', function () {
	return gulp
		.src('./app/fonts/**/*')
		.pipe(changed('./build/fonts/'))
		.pipe(gulp.dest('./build/fonts/'));
});

gulp.task('files:dev', function () {
	return gulp
		.src('./app/files/**/*')
		.pipe(changed('./build/files/'))
		.pipe(gulp.dest('./build/files/'));
});

gulp.task('js:dev', function () {
	return gulp
		.src('./app/js/*.js')
		.pipe(changed('./build/js/'))
		.pipe(plumber(plumberNotify('JS')))
		// .pipe(babel())
		.pipe(webpack(require('./../webpack.config.js')))
		.pipe(gulp.dest('./build/js/'));
});

const serverOptions = {
	livereload: true,
	open: true,
};

gulp.task('server:dev', function () {
	return gulp.src('./build/').pipe(server(serverOptions));
});

gulp.task('watch:dev', function () {
	gulp.watch('./app/scss/**/*.scss', gulp.parallel('sass:dev'));
	gulp.watch(
		['./app/html/**/*.html', './app/html/**/*.json'],
		gulp.parallel('html:dev')
	);
	gulp.watch('./app/images**/*', gulp.parallel('images:dev'));
	gulp.watch('./app/fonts/**/*', gulp.parallel('fonts:dev'));
	gulp.watch('./app/files/**/*', gulp.parallel('files:dev'));
	gulp.watch('./app/js/**/*.js', gulp.parallel('js:dev'));
  gulp.watch(
		'./app/images/svgicons/*',
		gulp.series('svgStack:dev', 'svgSymbol:dev')
	);
});
