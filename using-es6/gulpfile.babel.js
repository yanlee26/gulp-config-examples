'use strict';

import gulp from 'gulp';
import del from 'del';
import runSequence from 'run-sequence';
import browserSync from 'browser-sync';
import swPrecache from 'sw-precache';
import gulpLoadPlugins from 'gulp-load-plugins';
import {
  output as pagespeed
} from 'psi';
import replace from 'gulp-replace';
// import less from 'gulp-less';
const $ = gulpLoadPlugins();
const reload = browserSync.reload;

// Optimize images
gulp.task('images', () =>
  gulp
  .src('app/images/**/*')
  .pipe(
    $.cache(
      $.imagemin({
        progressive: true,
        interlaced: true,
      })
    )
  )
  .pipe(gulp.dest('dist/images'))
  .pipe($.size({
    title: 'images'
  }))
);

gulp.task('copy', () =>
  gulp
  .src(
    [
      'app/*',
      '!app/*.html',
      '!app/components',
      'node_modules/apache-server-configs/dist/.htaccess',
    ], {
      dot: true,
    }
  )
  .pipe(gulp.dest('dist'))
  .pipe($.size({
    title: 'copy'
  }))
);

gulp.task('styles', () => {
  const AUTOPREFIXER_BROWSERS = [
    'ie >= 10',
    'ie_mob >= 10',
    'ff >= 30',
    'chrome >= 34',
    'safari >= 7',
    'opera >= 23',
    // 'ios >= 7',
    // 'android >= 4.4',
    'bb >= 10',
  ];

  // For best performance, don't add Sass partials to `gulp.src`
  return (
    gulp
    .src([
      'app/styles/**/*.scss',
      'app/styles/**/*.css',
      // 'app/styles/**/*.less',
      'app/pages/**/*.css',
    ])
    .pipe($.newer('.tmp/styles'))
    .pipe($.sourcemaps.init())
    .pipe($.if('*.scss', $.concat('style.min.scss')))
    .pipe(
      $.if(
        '*.scss',
        $.sass({
          precision: 10,
        }).on('error', $.sass.logError)
      )
    )
    // .pipe($.if('*.less', $.less()))
    .pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
    .pipe(gulp.dest('.tmp/styles'))
    // Concatenate and minify styles
    .pipe($.if('*.css', $.cssnano()))
    .pipe($.size({
      title: 'styles'
    }))
    .pipe($.if('*.css', $.concat('style.min.css')))
    .pipe($.sourcemaps.write('./'))
    .pipe(gulp.dest('dist/styles'))
    .pipe(gulp.dest('.tmp/styles'))
  );
});

gulp.task('scripts', () =>
  gulp
  .src(['./app/scripts/**/*.js'])
  .pipe($.newer('.tmp'))
  .pipe($.sourcemaps.init())
  .pipe($.if('main/*.js', $.babel()))
  .pipe($.sourcemaps.write())
  .pipe(gulp.dest('.tmp'))
  // .pipe($.concat('main.min.js'))
  .pipe($.uglify({
    preserveComments: 'some'
  }))
  // Output files
  .pipe($.size({
    title: 'scripts'
  }))
  .pipe($.sourcemaps.write('.'))
  .pipe(gulp.dest('dist/scripts'))
  .pipe(gulp.dest('.tmp/scripts'))
);

gulp.task('html', () => {
  return (
    gulp
    .src(['app/pages/*.html', 'app/index.html'])
    .pipe(
      $.useref({
        searchPath: '{.tmp,app}',
        noAssets: true,
      })
    )
    // Minify any HTML
    .pipe(
      $.if(
        '*.html',
        $.htmlmin({
          // removeComments: true,
          // collapseWhitespace: true,
          // collapseBooleanAttributes: true,
          // removeAttributeQuotes: true,
          // removeRedundantAttributes: true,
          // removeEmptyAttributes: true,
          // removeScriptTypeAttributes: true,
          // removeStyleLinkTypeAttributes: true,
          // removeOptionalTags: true
        })
      )
    )
    // Output files
    .pipe($.if('*.html', $.size({
      title: 'html',
      showFiles: true
    })))
    .pipe(
      $.if(
        '*.html',
        replace(/..\/styles\/main\/\S*.css/g, '../styles/style.min.css')
      )
    )
    .pipe($.if('!index.html', gulp.dest('dist/pages')))
    .pipe($.if('index.html', gulp.dest('dist')))
  );
});
// Clean output directory
gulp.task('clean', () => del(['.tmp', 'dist/*', '!dist/fonts'], {
  dot: true
}));

// Watch files for changes & reload
gulp.task('serve', ['scripts', 'styles'], () => {
  browserSync({
    notify: false,
    // Customize the Browsersync console logging prefix
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: ['.tmp', 'app'],
    port: 3000,
  });

  gulp.watch(['app/**/*.html'], reload);
  gulp.watch(['app/styles/**/*.{scss,css}'], ['styles', reload]);
  gulp.watch(['app/scripts/**/*.js'], ['scripts', reload]);
  gulp.watch(['app/images/**/*'], reload);
  gulp.watch(['app/images/**/*'], reload);
});

// Build and serve the output from the dist build
gulp.task('serve:dist', ['default'], () =>
  browserSync({
    notify: false,
    logPrefix: 'WSK',
    // Allow scroll syncing across breakpoints
    scrollElementMapping: ['main', '.mdl-layout'],
    // Run as an https by uncommenting 'https: true'
    // Note: this uses an unsigned certificate which on first access
    //       will present a certificate warning in the browser.
    // https: true,
    server: 'dist',
    port: 3001,
  })
);

// Build production files, the default task
gulp.task('default', ['clean'], cb =>
  runSequence('styles', ['html', 'scripts', 'images', 'copy'], cb)
);