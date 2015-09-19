'use strict';

var fs = require('fs');
var path = require('path');
var Promise = require('bluebird');
var stat = Promise.promisify(fs.stat);
var readdir  = Promise.promisify(fs.readdir);


/**
 * Copy own properties from one object to another, amending the 'to' object.  If properties are the same
 * these are overwritten.
 *
 * @private
 * @param {Object} from   Object to take properties from.
 * @param {Object} to     Object to merge into.
 * @returns {Object}      Reference to the 'to' parametre.
 */
function _copyProperties(from, to){
  for(var propertyName in (from || {})){
    if(from.hasOwnProperty(propertyName)){
      to[propertyName] = from[propertyName];
    }
  }

  return to;
}

/**
 * Generate a standard options object with all the defaults set when not supplied in the given options object.
 *
 * @private
 * @param {Object} options      Supplied options.
 * @returns {Object}            Options with defaults set.
 */
function _setDefaultOptions(options) {
  options = options || {};

  return _copyProperties({
    'hideFiles': options.hideFiles || false,
    'hideEmptyDirectories': options.hideEmptyDirectories || false,
    'ignoreList': options.ignoreList || [],
    'fileExtensions': options.fileExtensions || []
  }, options);
}

/**
 * Create an item object from given basepath and supplied properties.
 *
 * @private
 * @param {string} itemPath      The basepath to file/directory item relates to.
 * @param {Object} item          The properties to add to the item.
 * @returns {Object}
 */
function _createItemObject(itemPath, item) {
  return _copyProperties(item, {
    path: path.relative(itemPath, itemPath),
    name: path.basename(itemPath)
  });
}

/**
 * Generate a file item from the given basepath and file stats object.
 *
 * @private
 * @param {string} filePath     The file path.
 * @param {fs.Stats} stats      The stats object for the given file.
 * @returns {Object}            The item object for the file.
 */
function _getFileItem(filePath, stats){
  return _createItemObject(filePath, {
    type: 'file',
    'size': stats.size
  });
}

/**
 * Generate a directory item from the given basepath and directory children.
 *
 * @private
 * @param {string} dirPath        The directory path.
 * @param {Array} childItems      An array of child item objects for this directory.
 * @returns {Object}              The item object for the directory.
 */
function _getDirectoryItem(dirPath, childItems){
  return _createItemObject(dirPath, {
    type: 'directory',
    children: childItems,
    size: _getDirectorySize(childItems)
  });
}

/**
 * Get the size of a directory from child stat objects.
 *
 * @private
 * @param {Array} items    Child item objects for directory.
 * @returns {number}       The size of the directory.
 */
function _getDirectorySize(items){
  return items.reduce(function (previous, current) {
    return previous + current.size;
  }, 0)
}

/**
 * Test function to see if current path is in the ignore list.
 *
 * @private
 * @param {string} filePath     The file/directory path
 * @param {Array} ignoreList    The ignore list.
 * @returns {boolean}           Ignore this file or directory?
 */
function _shouldIgnoreThisPath(filePath, ignoreList) {
  if (ignoreList.length) {
    var ignore = false;
    ignoreList.forEach(function (value) {
      if (filePath.indexOf(value) > -1) {
        ignore = true;
      }
    });
    if (ignore) {
      return true;
    }
  }

  return false;
}

/**
 * Get the child items of a directory
 *
 * @private
 * @param {function} readDirFunc    The function used to read the directory.
 * @param {string} dirPath          The directory path.
 * @param {Object} options          The options being used.
 * @returns {Array}                 Child items array.
 */
function _getChildren(readDirFunc, dirPath, options){
  return readDirFunc(dirPath).map(function (child) {
    return directoryTree(path.join(dirPath, child), options);
  }).filter(function (e) {
    return (e !== null);
  });
}

/**
 * Test function to see if a path can matched against an array of extensions.
 *
 * @private
 * @param {string} filePath         Path to match against.
 * @param {Array} fileExtensions    Extensions to test against.
 * @returns {boolean}               Is there a match?
 */
function _isFileExtensionMatch(filePath, fileExtensions){
  return (
    (!fileExtensions.length) ||
    (fileExtensions.indexOf(path.extname(filePath).toLowerCase()) !== -1)
  );
}


function directoryTree(basepath, options) {
  options = _setDefaultOptions(options);

  if (_shouldIgnoreThisPath(basepath, options.ignoreList)) return null;
  var stats = fs.statSync(basepath);
  if (options.hideFiles && stats.isFile()) return null;

  if (stats.isFile()) {
    return ((_isFileExtensionMatch(basepath, options.fileExtensions))? _getFileItem(basepath, stats) : null);
  } else {
    var item = _getDirectoryItem(basepath, _getChildren(fs.readdirSync, basepath, options));
    return ((options.hideEmptyDirectories && item.children.length === 0)?null:item);
  }
}

function directoryTreeAsync (basepath, options, callback) {
  options = _setDefaultOptions(options);

  if (_shouldIgnoreThisPath(basepath, options.ignoreList)) return null;

  return stat(basepath).then(function(stats){
    if (options.hideFiles && stats.isFile()) return null;

    if (stats.isFile()) {
      return ((_isFileExtensionMatch(basepath, options.fileExtensions))? _getFileItem(basepath, stats) : null);
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
