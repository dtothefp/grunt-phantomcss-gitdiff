/*
 * grunt-phantomcss
 * https://github.com/chrisgladd/grunt-phantomcss
 *
 * Copyright (c) 2013 Chris Gladd
 * Licensed under the MIT license.
 */

'use strict';
module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        jshint: {
            all: [
                'Gruntfile.js',
                'tasks/phantomcss.js',
                'phantomjs/runner.js',
                '<%= nodeunit.tests %>',
            ],
            options: {
                jshintrc: '.jshintrc',
            },
        },

        // Before generating any new files, remove any
        // previously-created files.
        clean: {
            tests: ['tmp'],
            results: ['results'],
        },

        // Configuration to be run (and then tested).
        // TODO configure for local testing outside of wrapper app
        'phantomcss-gitdiff': {
            visualTest: {
                options: {
                    screenshots: 'fixtures/screenshots/',
                    failures: 'fixtures/failures',
                    baseUrl: 'http://localhost:3000/',
                    serverRoot: 'fixtures/files/',
                    gitDiff: true
                },
                src: [
                    'fixtures/*.html'
                ]
            }
        },

        // Unit tests.
        nodeunit: {
            tests: ['test/*_test.js'],
        },
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks('tasks');

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-nodeunit');

    // Whenever the "test" task is run, first clean the "tmp" dir,
    // then run this plugin's task(s), then test the result.
    grunt.registerTask('test', ['clean', 'phantomcss-gitdiff', 'nodeunit']);

    // By default, lint and run all tests.
    grunt.registerTask('default', ['jshint', 'test']);
};
