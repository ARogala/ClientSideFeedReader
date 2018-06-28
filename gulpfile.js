const gulp = require('gulp');
const sass = require('gulp-sass');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();

//task name is sass type gulp sass to run in terminal
gulp.task('sass', function(){
  return gulp.src('app/scss/**/*.scss') // Get source files with gulp.src
    .pipe(sass()) // Using gulp-sass Sends it through a gulp plugin
    .pipe(autoprefixer({
			browsers: ['last 2 versions']
		}))
    .pipe(gulp.dest('app/css')) // Outputs the file in the destination folder
    //after sass compiles update browser
    .pipe(browserSync.stream())
});

/*
	browserSync and sass will run first in that order then watch all for changes
	when sass files change sass task will run
	when html and js files change browserSync.reload runs
*/
gulp.task('watch',['browserSync','sass'], function() {
	gulp.watch('app/scss/**/*.scss', ['sass']);
	//other watches
	gulp.watch('app/*.html', browserSync.reload);
  	gulp.watch('app/js/**/*.js', browserSync.reload);
});

//set up the browserSync server to serve index.html in app directory
gulp.task('browserSync', function() {
	browserSync.init({
		server: {
			baseDir: 'app'
		}
	});
});



