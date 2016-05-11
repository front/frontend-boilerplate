var gulp        = require('gulp'),
    gutil       = require('gulp-util'),
    gulpif      = require('gulp-if'),
    plumber     = require('gulp-plumber'),
    rename      = require('gulp-rename'),
    del         = require('del'),
    twig        = require('gulp-twig'),
    sass        = require('gulp-sass'),
    sourcemaps  = require('gulp-sourcemaps'),
    cssPrefix   = require('gulp-autoprefixer'),
    browserSync = require('browser-sync'),
    uglify      = require('gulp-uglify'),
    jshint      = require('gulp-jshint'),
    styledown   = require('gulp-styledown'),
    svgSprite   = require('gulp-svg-sprite'),
    svg2png     = require('gulp-svg2png'),
    filter      = require('gulp-filter');

// Setup default arguments.
var defaultOptions = {
  env: process.env.NODE_ENV || 'development',
  name: process.cwd().match(/([^\/]*)\/*$/)[1],
  // Paths.
  root: './',
  src:  './source/',
  dest: './build/',
  npm:  './node_modules/',
  tmp:  './tmp/',
  // Configurations.
  sassConfig: {
    errLogToConsole: true,
    outputStyle: 'nested'
  },
  sassConfigProd: {
    outputStyle: 'compressed'
  },
  cssPrefix: ['last 15 versions', '> 1%', 'ie 8']
};

var argv = require('yargs').default(defaultOptions).argv;

/**
 * Delete destination folder.
 */
gulp.task('clean', function() {
  del([ argv.dest ]).then(paths => {
    gutil.log('Deleted files and folders:\n', paths.join('\n'));
  });
});

/**
 * Log utility task.
 */
gulp.task('log', function() {
  gutil.log(argv.name);
});

/**
 * Prototype compiling task.
 */
gulp.task('prototype', function() {
  gulp.src([argv.src + 'prototype/**/*.twig', '!' + argv.src + 'prototype/includes/*.twig', '!' + argv.src +'prototype/layouts/*.twig'])
    .pipe(plumber())
    .pipe(twig())
    .pipe(gulp.dest(argv.dest + 'prototype'))
    .pipe(browserSync.reload({ stream: true }));
});

/**
 * Stylesheets task.
 */
gulp.task('sass', function () {
  gulp.src(argv.src + 'sass/*.scss')
    .pipe(plumber())
    .pipe(gulpif(argv.env === 'development', sourcemaps.init()))
    .pipe(gulpif(argv.env === 'development', sass(argv.sassConfig), sass(argv.sassConfigProd)))
    .pipe(cssPrefix(argv.cssPrefix, { cascade: true }))
    .pipe(gulpif(argv.env === 'development', sourcemaps.write('sourcemap')))
    .pipe(gulp.dest(argv.dest + 'css'))
    .pipe(browserSync.reload({ stream: true }));
});

/**
 * Javascript task.
 */
gulp.task('js', function() {
  gulp.src(argv.src + 'js/*.js')
    .pipe(plumber())
    .pipe(jshint())
    .pipe(jshint.reporter('default'))
    .pipe(gulp.dest(argv.dest + 'js'))
    .pipe(gulpif(argv.env === 'production', uglify()))
    .pipe(gulpif(argv.env === 'production', rename({ suffix: '.min' })))
    .pipe(gulpif(argv.env === 'production', gulp.dest(argv.dest + 'js')))
    .pipe(browserSync.reload({ stream: true, once: true }));
});

/**
 * Sprite tasks.
 */

// SVG
gulp.task('sprite', function() {
    gulp.src('**/*.svg', {cwd: argv.src + 'sprite'})
        .pipe(svgSprite({
            shape: {
                dest: "sprite/single"
            },
            mode: {
                css: {
                    spacing: {
                        padding: 5
                    },
                    dest: "./",
                    layout: "diagonal",
                    sprite: "sprite/sprite.svg",
                    bust: false,
                    render: {
                        scss: {
                            dest: "." + argv.src + "sass/_settings-sprite-autocompiled.scss",
                            template: argv.src + "/sprite/sprite-template.scss"
                        }
                    }
                }
            }
        }))
        .pipe(gulp.dest(argv.dest));
});

// PNG fallback
gulp.task('sprite-fallback', ['sprite'], function() {
    return gulp.src(argv.dest + 'sprite/sprite.svg')
        .pipe(svg2png())
        .pipe(gulp.dest(argv.dest + 'sprite'));
});

/**
 * Copy assets task.
 */
gulp.task('copy-assets', function() {
  gulp.src([
      argv.src + 'index.html',
      argv.src + 'fonts/**/*',
      argv.src + 'images/**/*'
    ], { base: argv.src })
    .pipe(gulp.dest( argv.dest ))
    .pipe(browserSync.reload({ stream: true }));
});

/**
 * Styleguide compiling task.
 */
gulp.task('styleguide', function() {
  gulp.src(argv.src + 'styleguide/styleguide.md')
    .pipe(plumber())
    .pipe(styledown({
      config: argv.src + 'styleguide/config-styleguide.md',
      filename: 'index.html'
    }))
    .pipe(gulp.dest(argv.dest + 'styleguide/'))
    .pipe(browserSync.reload({ stream: true }));
});

/**
 * Browser-sync task.
 */
gulp.task('browser-sync', ['build'], function() {
  browserSync({
    server: {
      baseDir: argv.dest
    }
  });
});

/**
 * Watch files.
 */
gulp.task('watch', function () {
    gulp.watch(argv.src + 'prototype/**/*.twig', ['prototype']);
    gulp.watch(argv.src + 'sass/**/*', ['sass']);
    gulp.watch(argv.src + 'js/**/*', ['js']);
    gulp.watch(argv.src + 'sprite/**/*', ['sprite-fallback']);
    gulp.watch(argv.src + 'images/**/*', ['copy-assets']);
    gulp.watch(argv.src + 'fonts/**/*', ['copy-assets']);
    gulp.watch(argv.src + 'styleguide/**/*.md', ['styleguide']);
});

/**
 * Add WordPress theme to the current boilerplate.
 */
gulp.task('add-theme:wordpress', function() {
  var fs      = require('fs'),
      git     = require('gulp-git'),
      replace = require('gulp-replace');

  // Quick check before trying to copy the theme assets and files.
  fs.stat(argv.root + 'functions.php', function(err, stat) {
    if (err === null) {
      gutil.log('Theme already exists in the current root directory.');
    }
    else {
      // Get a copy of the _t theme from https://github.com/front/_t
      git.clone('https://github.com/front/_t.git', { args: argv.tmp }, function(err) {
        // Handle git errors.
        if (err) {
          throw err;
        }
        else {
          const rootFilter   = filter(['**', '!**/js/**/*', '!**/sass/**/*'], { restore: true });
          const assetsFilter = filter(['**/js/**/*', '**/sass/**/*']);

          // Rename the theme machine names.
          gulp.src(argv.tmp + '**/*')
          // Search for: '_t' and replace with: 'argv.name'
            .pipe(replace("'_t'", "'" + argv.name + "'"))
          // Search for: _t_ and replace with: argv.name_
            .pipe(replace('_t_', argv.name + '_'))
          // Search for: Text Domain: _t and replace with: Text Domain: argv.name in style.css.
            .pipe(replace('Text Domain: _t', 'Text Domain: ' + argv.name))
          // Search for:  _t and replace with:  argv.name
            .pipe(replace(' _t', ' ' + argv.name))
          // Search for: _t- and replace with: argv.name-
            .pipe(replace('_t-', argv.name + '-'))
          // Override existing files.
            .pipe(gulp.dest(argv.tmp))
          // Copy the files and folders.
            .pipe(rootFilter)
            .pipe(gulp.dest(argv.root))
            .pipe(rootFilter.restore)
            .pipe(assetsFilter)
            .pipe(gulp.dest(argv.src));
        }
      });
    }
  });
});

/**
 * Clean leftovers from theme:wordpress.
 */
gulp.task('clean:wordpress', function () {
  del([
    argv.tmp,
    argv.root + 'js',
    argv.root + 'sass'
  ]);
});

// Base build task.
gulp.task('build', ['sass', 'sprite-fallback', 'copy-assets', 'styleguide', 'prototype']);

// Default task.
gulp.task('default', ['browser-sync', 'watch']);
