var fs = require('fs');
var path = require('path');


function directoryTree(basepath, myOptions) {
  myOptions = myOptions || {};

  var options = {
    'hideFiles': myOptions.hideFiles || false,
    'hideEmptyDirectories': myOptions.hideEmptyDirectories || false,
    'ignoreList': myOptions.ignoreList || [],
    'fileExtensions': myOptions.fileExtensions || []
  };

  var stats = fs.statSync(basepath);

  var item = {
    path: path.relative(basepath, basepath),
    name: path.basename(basepath)
  };

  if (options.hideFiles && stats.isFile()) {
    return null;
  }

  if (options.ignoreList.length > 0) {
    var ignore = false;
    options.ignoreList.forEach(function (value) {
      if (basepath.indexOf(value) > -1) {
        ignore = true;
      }
    });
    if (ignore) {
      return null;
    }
  }

  if (stats.isFile()) {
    if (options.fileExtensions.length > 0 &&
            options.fileExtensions.indexOf(path.extname(basepath).toLowerCase()) === -1) {
      return null;
    }
    item.type = 'file';
    item.size = stats.size;
  } else {
    item.type = 'directory';
    item.children = fs.readdirSync(basepath).map(function (child) {
      return directoryTree(path.join(basepath, child), options);
    }).filter(function (e) {
      return e !== null;
    });
    item.size = item.children.reduce(function (previous, current) {
      return previous + current.size;
    }, 0);

    if (options.hideEmptyDirectories && item.children.length === 0) {
      return null;
    }
  }

  return item;
};


exports.directoryTree = directoryTree;
