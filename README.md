# grunt-phantomcss-github-diff

> Automate CSS regression testing with PhantomCSS

## Getting Started
This plugin requires Grunt `~0.4.1`

If you haven't used [Grunt](http://gruntjs.com/) before, be sure to check out the [Getting Started](http://gruntjs.com/getting-started) guide, as it explains how to create a [Gruntfile](http://gruntjs.com/sample-gruntfile) as well as install and use Grunt plugins. Once you're familiar with that process, you may install this plugin with this command:

```shell
npm install grunt-phantomcss-gitdiff --save-dev
```

Once the plugin has been installed, it may be enabled inside your Gruntfile with this line of JavaScript:

```js
grunt.loadNpmTasks('grunt-phantomcss-gitdiff');
```

## The "phantomcss" task

### Overview
In your project's Gruntfile, add a section named `phantomcss` to the data object passed into `grunt.initConfig()`.

```js
grunt.initConfig({
  'phantomcss-gitdiff': {
    options: {},
    your_target: {
      options: {
        screenshots: 'test/visual/screenshots/',
      },
      src: [
        'root/**/*.html'
      ]
    }
  }
});
```

### Options

#### gitDiff
Type: `boolean`
Default: `true`

This will be obsolete soon but it is a good idead to always specify as `true` if you want to do your diffs on GitHub.

#### baseUrl
Type: 'String'

URL of your site or local server.

####
Type: 'String'
Default: `.`

Sorry if this seems redundant...hopefully it will be obsolete soon as well. 

#### src
Type: `String|Array`

The test files to run.

#### options.screenshots
Type: `String`  
Default: `'./screenshots'`

The screenshots directory where test fixtures (comparison screenshots) are stored. Baseline screenshots will be stored here on the first run if they're not present.

#### options.failures
Type: `String`  
Default: `'./failures'`

The directory to store failure screenshots after tests.

#### options.viewportSize
Type: `Array`  
Default: `[1280, 800]`

The viewport size to test the site in `[width, height]` format. Useful when testing responsive layouts. 

#### options.logLevel
Type: `String`  
Default: `error`

The CasperJS log level. See [CasperJS: Logging](http://casperjs.readthedocs.org/en/latest/logging.html) for details.


### Usage Examples

#### Basic visual tests
Run tests in `test/visual/` against comparison screenshots stored in `test/visual/screenshots/`, and put the resulting screenshots in `results/visual/`

```js
grunt.initConfig({
  'phantomcss-gitdiff': {
    options: {
      baseUrl: 'http://localhost:3000/'
    },
    desktop: {
      src: [
        'test/files/{,**/}*.html'
      ]
    }
  }
});
```

#### Responsive layout testing
Run tests in `test/visual/` against comparison screenshots for destop and mobile.

```js
grunt.initConfig({
  'phantomcss-gitdiff': {
    options: {
      baseUrl: 'http://localhost:3000/',
      serverRoot: 'test/files/',
      gitDiff: true,
    },
    desktop: {
      options: {
        screenshots: 'screens/desktop/',
        failures: 'failures/desktop/',
        viewportSize: [1024, 768]
      },
      src: [
        'test/files/{,**/}*.html'
      ]
    },
    mobile: {
      options: {
        screenshots: 'screens/mobile/',
        results: 'failures/mobile/',
        viewportSize: [320, 480]
      },
      src: [
        'test/files/{,**/}*.html'
      ]
    }
  }
});
```

##NOTE: Test files specified below are not necessary unless you want to based upon interactive behavior.  If you would only like to diff pages based upon CSS/JS changes the automated test file exists in phantomjs/lib/pageTest.js

#### Sample test file

Test files should do the following:
* Start CasperJS with the URL you want to test
* Manipulate the page in some way
* Take screenshots

```javascript
casper.start('http://localhost:3000/')
.then(function() {
  phantomcss.screenshot('#todo-app', 'Main app');
})
.then(function() {
  casper.fill('form.todo-form', {
    todo: 'Item1'
  }, true);

  phantomcss.screenshot('#todo-app', 'Item added');
})
.then(function() {
  casper.click('.todo-done');

  phantomcss.screenshot('#todo-app', 'Item checked off');
});
```

You can also load a local file by specifying a path (relative to the Gruntfile):

```javascript
casper.start('build/client/index.html')
.then(function() {
  // ...
});
```

### Multiple Test Files
Your first test file should use ```casper.start```

```javascript
casper.start('http://localhost:3000/')
.then(function() {
  phantomcss.screenshot('#todo-app', 'Main app');
})
.then(function() {
  casper.fill('form.todo-form', {
    todo: 'Item1'
  }, true);

  phantomcss.screenshot('#todo-app', 'Item added');
});

```
Subsequent files should call ```casper.then``` to continue the previous test.

```javascript
casper.then(function() {
  casper.click('.todo-done');

  phantomcss.screenshot('#todo-app', 'Item checked off');
});
```
You can also use ```casper.thenOpen``` to load a new url and continue testing in subsequent files instead of ```casper.start```.


See the [CasperJS documentation](http://casperjs.readthedocs.org/en/latest/modules/casper.html) and the [PhantomCSS documentation](https://github.com/Huddle/PhantomCSS) for more information on using CasperJS and PhantomCSS.


## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint and test your code using [Grunt](http://gruntjs.com/).

## Release History
* 2014-02-23   v0.2.2   Added multiple file example to README.md
* 2014-02-07   v0.2.1   Fixed ResembleJS path issue
* 2014-01-07   v0.2.0   Merged updates from Larry Davis
* 2013-10-24   v0.1.1   Added the ability to use an external server
* 2013-10-24   v0.1.0   Initial Release
