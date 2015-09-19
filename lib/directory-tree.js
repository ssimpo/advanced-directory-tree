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
 * @param {Object} myOptions    Supplied options.
 * @returns {Object}            Options with defaults set.
 */
function _setDefaultOptions(myOptions) {
  myOptions = myOptions || {};

  return {
    'hideFiles': myOptions.hideFiles || false,
    'hideEmptyDirectories': myOptions.hideEmptyDirectories || false,
    'ignoreList': myOptions.ignoreList || [],
    'fileExtensions': myOptions.fileExtensions || []
  };
}

/**
 * Create an item object from given basepath and supplied properties.
 *
 * @private
 * @param {string} basepath      The basepath to file/directory item relates to.
 * @param {Object} properties    The properties to add to the item.
 * @returns {Object}
 */
function _createItemObject(basepath, properties) {
  return _copyProperties(properties, {
    path: path.relative(basepath, basepath),
    name: path.basename(basepath)
  });
}

/**
 * Generate a file item from the given basepath and file stats object.
 *
 * @private
 * @param {string} basepath     The file path.
 * @param {fs.Stats} stats      The stats object for the given file.
 * @returns {Object}            The item object for the file.
 */
function _getFileItem(basepath, stats){
  return _createItemObject(basepath, {
    type: 'file',
    'size': stats.size
  });
}

/**
 * Generate a directory item from the given basepath and directory children.
 *
 * @private
 * @param {string} basepath     The directory path.
 * @param {Array} children      An array of child item objects for this directory.
 * @returns {Object}            The item object for the directory.
 */
function _getDirectoryItem(basepath, children){
  return _createItemObject(basepath, {
    type: 'directory',
    children: children,
    size: _getDirectorySize(children)
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
 * @param {string} basepath   The file/directory path
 * @param {Object} options    The current options.
 * @returns {boolean}         Ignore this file or directory?
 */
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

/**
 * Get the child items of a directory
 *
 * @private
 * @param {function} readerFunc     The function used to read the directory.
 * @param {string} basepath         The directory path.
 * @param {Object} options          The options being used.
 * @returns {Array}                 Child items array.
 */
function _getChildren(readerFunc, basepath, options){
  return readerFunc(basepath).map(function (child) {
    return directoryTree(path.join(basepath, child), options);
  }).filter(function (e) {
    return e !== null;
  });
}

/**
 * Test function to see if a path can matched against an array of extensions.
 *
 * @private
 * @param {string} basepath         Path to match against.
 * @param {Array} fileExtensions    Extensions to test against.
 * @returns {boolean}               Is there a match?
 */
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
