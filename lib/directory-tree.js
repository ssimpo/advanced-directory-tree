'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var stat = Promise.promisify(fs.stat);
var readdir  = Promise.promisify(fs.readdir);


function _copyProperties(from, to){
  for(var propertyName in (from || {})){
    if(from.hasOwnProperty(propertyName)){
      to[propertyName] = from[propertyName];
    }
  }

  return to;
}

function _setDefaultOptions(myOptions) {
  myOptions = myOptions || {};

  return {
    'hideFiles': myOptions.hideFiles || false,
    'hideEmptyDirectories': myOptions.hideEmptyDirectories || false,
    'ignoreList': myOptions.ignoreList || [],
    'fileExtensions': myOptions.fileExtensions || []
  };
}

function _createItemObject(basepath, propertiesToAdd) {
  return _copyProperties(propertiesToAdd, {
    path: path.relative(basepath, basepath),
    name: path.basename(basepath)
  });
}

function _getFileItem(basepath, stats){
  return _createItemObject(basepath, {
    type: 'file',
    'size': stats.size
  });
}

function _getDirectoryItem(basepath, children){
  return _createItemObject(basepath, {
    type: 'directory',
    children: children,
    size: children.reduce(function (previous, current) {
      return previous + current.size;
    }, 0)
  });
}

function _isIgnoringSelf(basepath, options) {
  if (options.ignoreList.length > 0) {
    var ignore = false;
    options.ignoreList.forEach(function (value) {
      if (basepath.indexOf(value) > -1) {
        ignore = true;
      }
    });
    if (ignore) {
      return true;
    }
  }

  return false;
}

function _getChildren(readerFunc, basepath, options){
  return readerFunc(basepath).map(function (child) {
    return directoryTree(path.join(basepath, child), options);
  }).filter(function (e) {
    return e !== null;
  });
}

function _isFileExtensionMatch(basepath, fileExtensions){
  return (
    (fileExtensions.length > 0) &&
    (fileExtensions.indexOf(path.extname(basepath).toLowerCase()) === -1)
  );
}


function directoryTree(basepath, options) {
  options = _setDefaultOptions(options);

  if (_isIgnoringSelf(basepath, options)) return null;
  var stats = fs.statSync(basepath);
  if (options.hideFiles && stats.isFile()) return null;

  if (stats.isFile()) {
    return ((_isFileExtensionMatch(basepath, options.fileExtensions))? null: _getFileItem(basepath, stats));
  } else {
    var item = _getDirectoryItem(basepath, _getChildren(fs.readdirSync, basepath, options));
    return ((options.hideEmptyDirectories && item.children.length === 0)?null:item);
  }
}

function directoryTreeAsync (basepath, options, callback) {
  options = _setDefaultOptions(options);

  if (_isIgnoringSelf(basepath, options)) return null;

  return stat(basepath).then(function(stats){
    if (options.hideFiles && stats.isFile()) return null;

    if (stats.isFile()) {
      return ((_isFileExtensionMatch(basepath, options.fileExtensions))? null: _getFileItem(basepath, stats));
    } else {
      return _getChildren(readdir, basepath, options).then(function(children){
        var item = _getDirectoryItem(basepath, children);
        return ((options.hideEmptyDirectories && item.children.length === 0)?null:item);
      });
    }
  });
}


exports.directoryTree = directoryTree;
exports.directoryTreeAsync = directoryTreeAsync;
