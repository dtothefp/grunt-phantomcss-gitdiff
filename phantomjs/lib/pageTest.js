exports.basePages = function(options) {
  var rootUrl, rootPath, rootIndex;
  var baseUrl = options.baseUrl;
  var serverRoot = options.serverRoot;

  // check for specified document root
  if ( /^\.$/.test(serverRoot) ) {
    rootIndex = options.test.indexOf('index.html');
  } else {
    if (serverRoot.substr(-1) !== '/') {
      serverRoot += '/';
    }
    rootIndex = options.test.indexOf(serverRoot + 'index.html');
  }

  if (rootIndex !== -1) {
    rootUrl = baseUrl + options.serverRoot;
    rootPath = options.test.splice(rootIndex, 1)[0];
  } else {
    rootUrl = baseUrl + options.test[0];
    rootPath = options.test.splice(0, 1)[0];
  }

  function prettyPath(path) {
    var afterLastSlash = path.substr(path.lastIndexOf('/') + 1);
    if( !!afterLastSlash.match(/^index\.html$/) ) {
      return path.replace('/' + afterLastSlash, '').replace(/\//g, ' ');
    } else {
      return path.replace(/\.html/, '').replace(/\//g, ' ').replace(/_/g, ' ');
    }
  }

  casper.start(rootUrl)
  .then(function() {
    phantomcss.screenshot('body', rootIndex !== -1 ? 'Main Index' : rootPath);
  });

  options.test.forEach(function(path) {
    casper.thenOpen(baseUrl + path)
    .then(function() {
      phantomcss.screenshot('body', path);
    });
  });
};