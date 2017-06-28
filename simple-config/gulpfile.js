var gulp = require('gulp');

var sass = require('gulp-ruby-sass'),
	uglify = require('gulp-uglify'),
	imagemin = require('gulp-imagemin'),
	pngquant = require('imagemin-pngquant'),
	livereload = require('gulp-livereload'), // hot reload
	webserver = require('gulp-webserver'), //local server
	rename = require('gulp-rename'),
	sourcemaps = require('gulp-sourcemaps'), //sourcemaps
	changed = require('gulp-changed'), //only handle files changed
	concat = require("gulp-concat"),
	clean = require('gulp-clean');


var srcPath = {
	html: 'src',
	css: 'src/scss',
	script: 'src/js',
	image: 'src/images'
};
var destPath = {
	html: 'dist',
	css: 'dist/css',
	script: 'dist/js',
	image: 'dist/images'
};

// development env

gulp.task('html', function() {
	return gulp.src(srcPath.html + '/**/*.html')
		.pipe(changed(destPath.html))
		.pipe(gulp.dest(destPath.html));
});

gulp.task('sass', function() {
	return sass(srcPath.css.toString(), {
			style: 'compact',
			sourcemap: true
		})
		.on('error', function(err) {
			console.error('Error!', err.message);
		})
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest(destPath.css));
});

gulp.task('script', function() {
	return gulp.src([srcPath.script + '/*.js', '!' + srcPath.script + '/*.min.js'])
		.pipe(changed(destPath.script))
		.pipe(sourcemaps.init())
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(sourcemaps.write('maps'))
		.pipe(gulp.dest(destPath.script));
});

gulp.task('images', function() {
	return gulp.src(srcPath.image + '/**/*')
		.pipe(changed(destPath.image))
		.pipe(imagemin({
			progressive: true,
			svgoPlugins: [{
				removeViewBox: false
			}],
			use: [pngquant()]
		}))
		.pipe(gulp.dest(destPath.image));
});

gulp.task('concat', function() {
	return gulp.src(srcPath.script + '/*.min.js')
		.pipe(concat('libs.js'))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(gulp.dest(destPath.script));
});

gulp.task('webserver', function() {
	gulp.src(destPath.html)
		.pipe(webserver({
			livereload: true,
			open: true
		}));
});

gulp.task('watch', function() {
	gulp.watch(srcPath.html + '/**/*.html', ['html'])
	gulp.watch(srcPath.css + '/*.scss', ['sass']);
	gulp.watch(srcPath.image + '/**/*', ['images']);
	gulp.watch([srcPath.script + '/*.js', '!' + srcPath.script + '/*.min.js'], ['script']);
});

gulp.task('default', ['webserver', 'watch']);

// release env

gulp.task('clean', function() {
	return gulp.src([destPath.css + '/maps', destPath.script + '/maps'], {
			read: false
		})
		.pipe(clean());
});

gulp.task('sassRelease', function() {
	return sass(srcPath.css, {
			style: 'compressed'
		})
		.on('error', function(err) {
			console.error('Error!', err.message);
		})
		.pipe(gulp.dest(destPath.css));
});

gulp.task('scriptRelease', function() {
	return gulp.src([srcPath.script + '/*.js', '!' + srcPath.script + '/*.min.js'])
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(uglify({
			preserveComments: 'some'
		}))
		.pipe(gulp.dest(destPath.script));
});

gulp.task('release', ['clean'], function() {
	return gulp.start('sassRelease', 'scriptRelease', 'images');
});

// helps 

gulp.task('help', function() {
	console.log('gulp default		dev(default)');
	console.log('gulp html		html');
	console.log('gulp sass		sass');
	console.log('gulp script		js&& rename');
	console.log('gulp images		images compresse');
	console.log('gulp concat		files concat');

	console.log('gulp release		release');
	console.log('gulp clean		clean files');
	console.log('gulp sassRelease		style');
	console.log('gulp scriptRelease	js && compresse');
});