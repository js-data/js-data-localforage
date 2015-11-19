/*
 * js-data-localforage
 * https://github.com/js-data/js-data-localforage
 *
 * Copyright (c) 2014-2015 Jason Dobry <http://www.js-data.io/docs/dslocalforageadapter>
 * Licensed under the MIT license. <https://github.com/js-data/js-data-localforage/blob/master/LICENSE>
 */
module.exports = function (grunt) {
  require('jit-grunt')(grunt, {
    coveralls: 'grunt-karma-coveralls'
  });
  require('time-grunt')(grunt);

  var webpack = require('webpack');
  var pkg = grunt.file.readJSON('package.json');
  var banner = 'js-data-localforage\n' +
    '@version ' + pkg.version + ' - Homepage <http://www.js-data.io/docs/dslocalforageadapter>\n' +
    '@author Jason Dobry <jason.dobry@gmail.com>\n' +
    '@copyright (c) 2014-2015 Jason Dobry \n' +
    '@license MIT <https://github.com/js-data/js-data-localforage/blob/master/LICENSE>\n' +
    '\n' +
    '@overview localforage adapter for js-data.';

  // Project configuration.
  grunt.initConfig({
    pkg: pkg,
    clean: {
      coverage: ['coverage/'],
      dist: ['dist/']
    },
    watch: {
      dist: {
        files: ['src/**/*.js'],
        tasks: ['build']
      }
    },
    uglify: {
      main: {
        options: {
          sourceMap: true,
          sourceMapName: 'dist/js-data-localforage.min.map',
          banner: '/*!\n' +
          '* js-data-localforage\n' +
          '* @version <%= pkg.version %> - Homepage <http://wwwjs-data.io/docs/dslocalforageadapter>\n' +
          '* @author Jason Dobry <jason.dobry@gmail.com>\n' +
          '* @copyright (c) 2014-2015 Jason Dobry\n' +
          '* @license MIT <https://github.com/js-data/js-data-localforage/blob/master/LICENSE>\n' +
          '*\n' +
          '* @overview localforage adapter for js-data.\n' +
          '*/\n'
        },
        files: {
          'dist/js-data-localforage.min.js': ['dist/js-data-localforage.js']
        }
      }
    },
    webpack: {
      dist: {
        entry: './src/index.js',
        output: {
          filename: './dist/js-data-localforage.js',
          libraryTarget: 'umd',
          library: 'DSLocalForageAdapter'
        },
        externals: {
          'js-data': {
            amd: 'js-data',
            commonjs: 'js-data',
            commonjs2: 'js-data',
            root: 'JSData'
          },
          'localforage': 'localforage'
        },
        module: {
          loaders: [
            { test: /(src)(.+)\.js$/, exclude: /node_modules/, loader: 'babel-loader' }
          ],
          preLoaders: [
            {
              test: /(src)(.+)\.js$|(test)(.+)\.js$/, // include .js files
              exclude: /node_modules/, // exclude any and all files in the node_modules folder
              loader: "jshint-loader?failOnHint=true"
            }
          ]
        },
        plugins: [
          new webpack.BannerPlugin(banner)
        ]
      }
    },
    karma: {
      options: {
        configFile: './karma.conf.js'
      },
      dev: {
        browsers: ['Chrome'],
        autoWatch: true,
        singleRun: false,
        reporters: ['spec'],
        preprocessors: {}
      },
      min: {
        browsers: ['Firefox', 'Chrome'],
        options: {
          files: [
            'bower_components/js-data/dist/js-data.js',
            'bower_components/localforage/dist/localforage.nopromises.js',
            'dist/js-data-localforage.min.js',
            'karma.start.js',
            'test/**/*.js'
          ]
        }
      },
      ci: {
        browsers: ['Firefox', 'Chrome']
      }
    },
    coveralls: {
      options: {
        coverage_dir: 'coverage'
      }
    }
  });

  grunt.registerTask('test', ['build', 'karma:ci', 'karma:min']);
  grunt.registerTask('build', [
    'clean',
    'webpack',
    'uglify:main'
  ]);
  grunt.registerTask('go', ['build', 'watch:dist']);
  grunt.registerTask('default', ['build']);
};
