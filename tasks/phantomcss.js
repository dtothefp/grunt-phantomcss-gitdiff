/**
 * grunt-phantomcss
 * https://github.com/chrisgladd/grunt-phantomcss
 *
 * Copyright (c) 2013 Chris Gladd
 * Licensed under the MIT license.
 */
'use strict';

var path = require('path');
var tmp = require('temporary');
var phantomBinaryPath = require('phantomjs').path;
var runnerPath = path.join(__dirname, '..', 'phantomjs', 'runner.js');
var phantomCSSPath = path.join(__dirname, '..', 'node_modules', 'phantomcss-github-diff');

module.exports = function(grunt) {
    grunt.registerMultiTask('phantomcss-gitdiff', 'CSS Regression Testing', function() {
        var done = this.async();

        var options = this.options({
            gitDiff: true,
            baseUrl: 'http://localhost:3000/',
            serverRoot: '.',
            screenshots: 'screenshots',
            failures: 'results',
            viewportSize: [1280, 800],
            logLevel: 'error'
        });

        // Timeout ID for message checking loop
        var messageCheckTimeout;

        // The number of tempfile lines already read
        var lastLine = 0;

        // The number of failed tests
        var failureCount = 0;

        // This is effectively the project root (location of Gruntfile)
        // This allows relative paths in tests, i.e. casper.start('someLocalFile.html')
        var cwd = process.cwd();

        // Create a temporary file for message passing between the task and PhantomJS
        var tempFile = new tmp.File();

        var deleteDiffScreenshots = function() {
            // Find diff/fail files
            var diffScreenshots = grunt.file.expand([
                path.join(options.screenshots, '*diff.png'),
                path.join(options.screenshots, '*fail.png')
            ]);

            // Delete all of 'em
            diffScreenshots.forEach(function(filepath) {
                grunt.file.delete(filepath);
            });
        };

        var cleanup = function(error) {
            // Remove temporary file
            tempFile.unlink();

            // DFP NOTE: Original diff copy logic removed because it is encompassed in phantomcss using 
            // phantomjs FS object

            // Copy fixtures, diffs, and failure images to the results directory
            // var allScreenshots = grunt.file.expand(path.join(options.screenshots, '**.png'));
            // var encodingOpts = {encoding: 'base64'};
            // allScreenshots.forEach(function(filepath) {
            //     if (options.gitDiff) {
            //         // If there is a diff then overwrite the previous file -- this is not taking into account comparison yet
            //         if(/\.diff/.test(filepath) ) {
            //             //filepath = filepath.replace(/\.diff/, '');
            //             // setup logic to overwrite current base file if it has been diffed
            //             grunt.file.write(filepath.replace(/\.diff/, ''), grunt.file.read(filepath , encodingOpts), encodingOpts);
            //             //grunt.file.copy(filepath, path.join(options.screenshots, path.basename(filepath)));
            //         }
            //     } else {
            //         // Create the output directory
            //         grunt.file.mkdir(options.results);
            //         grunt.file.copy(filepath, path.join(options.results, path.basename(filepath)));
            //     }
            // });

            deleteDiffScreenshots();

            // DFP TODO: Hanlde async termination failure
            // prevent failure of multi-target task
            //done(error || failureCount === 0);
            done(error);
        };

        var checkForMessages = function checkForMessages(stopChecking) {
            // Disable logging temporarily
            grunt.log.muted = true;

            // Read the file, splitting lines on \n, and removing a trailing line
            var lines = grunt.file.read(tempFile.path).split('\n').slice(0, -1);

            // Re-enable logging
            grunt.log.muted = false;

            // Iterate over all lines that haven't already been processed
            lines.slice(lastLine).some(function(line) {
                // Get args and method
                var args = JSON.parse(line);
                var eventName = args[0];

                // Debugging messages
                grunt.log.debug(JSON.stringify(['phantomjs'].concat(args)).magenta);

                // Call handler
                if (messageHandlers[eventName]) {
                    messageHandlers[eventName].apply(null, args.slice(1));
                }
            });

            // Update lastLine so previously processed lines are ignored
            lastLine = lines.length;

            if (stopChecking) {
                clearTimeout(messageCheckTimeout);
            }
            else {
                // Check back in a little bit
                messageCheckTimeout = setTimeout(checkForMessages, 100);
            }
        };

        var messageHandlers = {
            onFail: function(test) {
                grunt.log.writeln('Visual change found for ' + path.basename(test.filename) + ' (' + test.mismatch + '% mismatch)');
            },
            onPass: function(test) {
                grunt.log.writeln('No changes found for ' + path.basename(test.filename));
            },
            onTimeout: function(test) {
                grunt.log.writeln('Timeout while processing ' + path.basename(test.filename));
            },
            onComplete: function(allTests, noOfFails, noOfErrors) {
                if (allTests.length) {
                    var noOfPasses = allTests.length - failureCount;
                    failureCount = noOfFails + noOfErrors;
                    if (failureCount === 0) {
                        grunt.log.ok('All ' + noOfPasses + ' tests passed!');
                    }
                    else {
                        if (noOfErrors === 0) {
                            grunt.log.error(noOfFails + ' tests failed.');
                        }
                        else {
                            grunt.log.error(noOfFails + ' tests failed, ' + noOfErrors + ' had errors.');
                        }
                    }
                }
                else {
                    grunt.log.ok('Baseline screenshots generated in '+options.screenshots);
                    grunt.log.warn('Check that the generated screenshots are visually correct and delete them if they aren\'t.');
                }
            }
        };

        options.test = [];
        if (options.gitDiff) {
            // Resolve paths for tests
            var current = process.cwd();
            this.filesSrc.forEach(function(filepath) {
                options.test.push( filepath );
            });
        } else {
            // Resolve paths for tests
            this.filesSrc.forEach(function(filepath) {
                options.test.push(path.resolve(filepath));
            });
        }

        options.screenshots = path.resolve(options.screenshots);

        // Put failure screenshots in the same place as source screenshots, we'll move/delete them after the test run
        // Note: This duplicate assignment is provided for clarity; PhantomCSS will put failures in the screenshots folder by default
        options.failures = options.screenshots;

        // Pass necessary paths
        options.tempFile = tempFile.path;
        options.phantomCSSPath = phantomCSSPath;

        // Remove old diff screenshots
        deleteDiffScreenshots();

        // Start watching for messages
        checkForMessages();

        // TODO figure out how to spawn a child process using `casper test` command to avoid Casper errors
        grunt.util.spawn({
            cmd: phantomBinaryPath,
            args: [
                runnerPath,
                JSON.stringify(options)
            ],
            opts: {
                cwd: cwd,
                stdio: 'inherit'
            }
        }, function(error, result, code) {
            // When Phantom exits check for remaining messages one last time
            checkForMessages(true);
            cleanup(error);
        });
    });
};
