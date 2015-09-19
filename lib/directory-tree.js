'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var stat = Promise.promisify(fs.stat);
var readdir  = Promise.promisify(fs.readdir);


function _setDefaultOptions(myOptions) {
  myOptions = myOptions || {};

  return {
    'hideFiles': myOptions.hideFiles || false,
    'hideEmptyDirectories': myOptions.hideEmptyDirectories || false,
    'ignoreList': myOptions.ignoreList || [],
    'fileExtensions': myOptions.fileExtensions || []
  };
}

function createItemObject(basepath) {
  return {
    path: path.relative(basepath, basepath),
    name: path.basename(basepath)
  };
}

function isIgnoringSelf(basepath, options) {
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

function getFileItem(basepath, stats){
  var item = createItemObject(basepath);

  item.type = 'file';
  item.size = stats.size;

  return item;
}

function getDirectoryItem(basepath, children){
  var item = createItemObject(basepath);

  item.type = 'directory';
  item.children = children;
  item.size = item.children.reduce(function (previous, current) {
    return previous + current.size;
  }, 0);

  return item;
}

function getChildren(readerFunc, basepath, options){
  return readerFunc(basepath).map(function (child) {
    return directoryTree(path.join(basepath, child), options);
  }).filter(function (e) {
    return e !== null;
  });
}

function directoryTree(basepath, options) {
  options = _setDefaultOptions(options);

  if(isIgnoringSelf(basepath, options)) return null;
  var stats = fs.statSync(basepath);
  if (options.hideFiles && stats.isFile()) return null;

  if (stats.isFile()) {
    if (options.fileExtensions.length > 0 &&
            options.fileExtensions.indexOf(path.extname(basepath).toLowerCase()) === -1) {
      return null;
    }else{
      return getFileItem(basepath, stats);
    }
  } else {
    var item = getDirectoryItem(basepath, getChildren(fs.readdirSync, basepath, options));
    if (options.hideEmptyDirectories && item.children.length === 0) return null;
    return item;
  }
}

function directoryTreeAsync (basepath, options, callback) {
  options = _setDefaultOptions(options);

  if(isIgnoringSelf(basepath, options)) return null;

  return stat(basepath).then(function(stats){
    if (options.hideFiles && stats.isFile()) return null;

    if (stats.isFile()) {
      if (options.fileExtensions.length > 0 &&
          options.fileExtensions.indexOf(path.extname(basepath).toLowerCase()) === -1) {
        return null;
      }else{
        return getFileItem(basepath, stats);
      }
    } else {
      return getChildren(readdir, basepath, options).then(function(children){
        var item = getDirectoryItem(basepath, children);
        if (options.hideEmptyDirectories && item.children.length === 0) return null;
        return item;
      });
    }
  });
}


exports.directoryTree = directoryTree;
exports.directoryTreeAsync = directoryTreeAsync;
