'use strict';

var fs = require('fs');
var path = require('path');
var globX = require('glob-to-regexp');
var Promise = require('bluebird');
var stat = Promise.promisify(fs.stat);
var readdir = Promise.promisify(fs.readdir);


/* Private methods */

/**
 * Test if the supplied variable is a function.
 *
 * @param {Object} value	Variable to test
 * @returns {boolean}		Is a function?
 */
function isFunction(value) {
	var getType = {};
	return value && getType.toString.call(value) === '[object Function]';
}

/**
 * Make whatever is passec to it an array.  If it isn't an array then return
 * as the first item of an array.
 *
 * @param {*} ary		The item to return as an array.
 * @returns {Array}
 */
function makeArray(ary){
	return (Array.isArray(ary) ? ary : [ary]);
}

function simpleClone(obj){
	var newObj = {};

	for(var key in obj){
		if(obj.hasOwnProperty(key)){
			newObj[key] = obj[key];
		}
	}

	return newObj;
}

/**
 * Copy own properties from one object to another, amending the 'to' object.
 * If properties are the same these are overwritten.
 *
 * @private
 * @param {Object} from		Object to take properties from.
 * @param {Object} to		Object to merge into.
 * @returns {Object}		Reference to the 'to' parameter.
 */
function _copyProperties(from, to) {
	for (var propertyName in (from || {})) {
		if (from.hasOwnProperty(propertyName)) {
			to[propertyName] = from[propertyName];
		}
	}

	return to;
}

/**
 * Generate a standard options object with all the defaults set when not
 * supplied in the given options object.
 *
 * @private
 * @param {Object} options		Supplied options.
 * @returns {Object}			Options with defaults set.
 */
function _setDefaultOptions(options) {
	options = options || {};

	return _copyProperties({
		'hideFiles': options.hideFiles || false,
		'hideEmptyDirectories': options.hideEmptyDirectories || false,
		'ignoreList': _globListToRegX(options.ignoreList),
		'includeOnly': _globListToRegX(options.includeOnly)
	}, options);
}

/**
 * Take a glob array and convert to one RegX.
 *
 * @private
 * @param {Array} globList		Array of globs.
 * @returns {RegExp}			RegExp equivilant of the glob list
 * 								(as an 'or').
 */
function _globListToRegX(globList){
	return (globList)?
			new RegExp('^(?:' + (globList || ['*']).map(function(glob){
				return globX(glob).source.slice(0,-1).slice(1);
			}).join(')|(?:') + ')') :
			null;
}

/**
 * Create an item object from given basepath and supplied properties.
 *
 * @private
 * @param {string} itemPath		The basepath to file/directory item
 * 								relates to.
 * @param {Object} item			The properties to add to the item.
 * @returns {Object}
 */
function _createItemObject(itemPath, item) {
	return _copyProperties(item, {
		path: path.dirname(path.resolve(itemPath)),
		name: path.basename(itemPath)
	});
}

/**
 * Generate a file item from the given basepath and file stats object.
 *
 * @private
 * @param {string} filePath		The file path.
 * @param {fs.Stats} stats		The stats object for the given file.
 * @returns {Object}			The item object for the file.
 */
function _getFileItem(filePath, root, stats) {
	return _createItemObject(filePath, {
		type: 'file',
		path: filePath,
		relativePath: filePath.replace(root, '').slice(1),
		'size': stats.size
	});
}

/**
 * Generate a directory item from the given basepath and directory children.
 *
 * @private
 * @param {string} dirPath		The directory path.
 * @param {Array} childItems	An array of child item objects for
 * 								this directory.
 * @returns {Object}			The item object for the directory.
 */
function _getDirectoryItem(dirPath, root, childItems) {
	return _createItemObject(dirPath, {
		type: 'directory',
		relativePath: dirPath.replace(root, '').slice(1),
		children: childItems,
		size: _getDirectorySize(childItems)
	});
}

/**
 * Get the size of a directory from child stat objects.
 *
 * @private
 * @param {Array} items		Child item objects for directory.
 * @returns {number}		The size of the directory.
 */
function _getDirectorySize(items) {
	return items.reduce(function (previous, current) {
		return previous + current.size;
	}, 0)
}

/**
 * Test function to see if current path is in the ignore list.
 *
 * @private
 * @private
 * @param {string} filePath		The file/directory path
 * @param {RegExp} ignoreList	The ignore RegExp.
 * @returns {boolean}			Ignore this file or directory?
 */
function _shouldIgnoreThisPath(filePath, ignoreList) {
	//console.log(filePath, ignoreList, ignoreList ? ignoreList.test(filePath) : false);
	return ignoreList ? ignoreList.test(filePath) : false;
}

/**
 * Get the child items of a directory
 *
 * @private
 * @param {function} readDirFunc	The function used to read the directory.
 * @param {string} dirPath			The directory path.
 * @param {Object} options			The options being used.
 * @returns {Array}					Child items array.
 */
function _getChildren(readDirFunc, dirPath, options) {
	return readDirFunc(dirPath).map(function (child) {
		return options.directoryTree(path.join(dirPath, child), options);
	}).filter(function (e) {
		return (e !== null);
	});
}

/**
 * Test function to see if a path can matched against an array of extensions.
 *
 * @private
 * @param {string} filePath			Path to match against.
 * @param {RegExp} includeOnly	Extensions to test against.
 * @returns {boolean}				Is there a match?
 */
function _isFileExtensionMatch(filePath, includeOnly) {
	return (includeOnly) ?
			includeOnly.test(filePath) :
			true;
}

/**
 * Test a file item (with given stats object) agains the file includes/excludes
 * in given options object.  Return a file item object or null based on stats
 * and options.
 *
 * @note This function assumes the given file path is an actual file and
 * not a directory.  This should be tested before calling this function.
 *
 * @private
 * @param {string} filepath		The file path.
 * @param {Object} options		The options to test against.
 * @param {Object} stats		Result of file stating.
 * @returns {Object|null}		File item object or null.
 */
function _testAndGetFileItem(filepath, options, stats){
	if (options.hideFiles) return null;

	return (
		(_isFileExtensionMatch(filepath, options.includeOnly)) ?
			_getFileItem(filepath, options.root, stats) :
			null
	);
}

/**
 * Test a given directory path against the given options object, return a
 * directory object or null.
 *
 * @note his function assumes that the given path is an actual directory path
 * and not afile.  This should be tested before calling this function.
 *
 * @param {string} dirpath		The drectory path.
 * @param {Array} children		Array of drectory children.
 * @param {Object} options		The options to test against.
 * @returns {Object|null}		The directory item object or null.
 * @private
 */
function _testAndGetDirectoryItem(dirpath, children, options){
	var dirItem = _getDirectoryItem(dirpath, options.root, children);
	return (
		(options.hideEmptyDirectories && dirItem.children.length === 0) ?
			null :
			dirItem
	);
}

/**
 * Marge two directory trees together.  Source overwrites items in dest (where
 * they exist in both).
 *
 * @param {Object} dest			Destination to merge source into.
 * @param {Object} source		Tree to merge into dest.
 * @private
 */
function _mergeTrees(dest, source){
	source.children.forEach(function(sourceItem, ns){
		var found = false;
		dest.children = dest.children || [];
		dest.children.forEach(function(destItem, nd){
			if((destItem.name === sourceItem.name) && (destItem.type === sourceItem.type)){
				found = true;
				if(destItem.type === 'directory'){
					_mergeTrees(dest.children[nd], source.children[ns])
				}else{
					destItem.path = sourceItem.path;
				}
			}
		});
		if(!found){
			dest.children.push(sourceItem);
		}
	});
}

function getRelativePath(basepath, options){
	var relativePath = basepath.replace(options.root, '');
	return ((relativePath.charAt(0) === '/')? relativePath.slice(1) : relativePath);
}

/**
 * Generate a directory tree for the given base path.  This perform the tree
 * creation synchronously.
 *
 * @public
 * @param {string} basepath		The path to(s) generate a tree for.
 * @param {Object} [options]	Options to define how the tree is
 * 								generated and what is added.
 * @returns {Object}			The directory tree object for given base path.
 */
function _directoryTree(basepath, options) {
	var stats = fs.statSync(basepath);

	if (stats.isFile()) {
		if (_shouldIgnoreThisPath(getRelativePath(basepath, options), options.ignoreList)) return null;
		return _testAndGetFileItem(basepath, options, stats);
	} else {
		if (_shouldIgnoreThisPath(getRelativePath(basepath, options) + '/', options.ignoreList)) return null;
		var children = _getChildren(fs.readdirSync, basepath, options);
		return _testAndGetDirectoryItem(basepath, children, options);
	}
}

/**
 * Generate a directory tree for the given base path. This performs the
 * operation asynchronously.  The return is thenable and an optional node style
 * callback can also be used.
 *
 * @private
 * @param {string} basepath			The path to generate a tree for.
 * @param {Object} options			Options to define how the tree is generated
 * 									and what is added. If function supplied
 * 									then assume this is the node
 * 									style callback.
 * @param {function} [callback]		The node async callback.
 * @returns {Promise}				The directory tree object for given base path.
 */
function _directoryTreeAsync(basepath, options, callback) {
	var treeCreationPromise = stat(basepath).then(function (stats) {
		if (stats.isFile()) {
			if (_shouldIgnoreThisPath(getRelativePath(basepath, options), options.ignoreList)) return null;
			return _testAndGetFileItem(basepath, options, stats);
		} else {
			if (_shouldIgnoreThisPath(getRelativePath(basepath, options) + "/", options.ignoreList)) return null;
			return _getChildren(readdir, basepath, options).then(function (children) {
				return _testAndGetDirectoryItem(basepath, children, options);
			});
		}
	}, function (error) {
		return null;
	});

	if (callback) {
		treeCreationPromise.nodeify(callback);
	}

	return treeCreationPromise;
}

/* End of private methods */



/* Public methods */

/**
 * Generate a directory tree for the given base path.  This perform the tree
 * creation synchronously.  If basepath is an array then  each root will
 * overwrite items in the previous root.
 *
 * @public
 * @param {string|Array} basepath		The path to generate a tree for.
 * @param {Object} [options]			Options to define how the tree is
 * 										generate and what is added.
 * @returns {Object}					The directory tree object for given
 * 										base path.
 */
function directoryTree(basepath, options) {
	options = _setDefaultOptions(options);
	options.directoryTree = _directoryTree;
	basepath = path.resolve(basepath);

	var tree;
	makeArray(basepath).reverse().forEach(function(basepath){
		var clonedOptions = simpleClone(options);
		clonedOptions.root = basepath;
		var treeSource = _directoryTree(basepath, clonedOptions);
		if(tree){
			_mergeTrees(tree,treeSource);
		}else{
			tree = treeSource;
		}
	});

	return tree;
}

/**
 * Generate a directory tree for the given base path. This performs the
 * operation asynchronously. The return is thenable and an optional node style
 * callback can also be used.  If basepath is an array then  each root will
 * overwrite items in the previous root.
 *
 * @public
 * @param {string|Array} basepath			The path(s) to generate a tree for.
 * @param {Object} [options]				Options to define how the tree is
 * 											generated and what is added. If
 * 											function supplied then assume this
 * 											is the node style callback.
 * @param {function} [callback]				The node async callback.
 * @returns {Promise}						The directory tree object for given
 * 											base path.
 */
function directoryTreeAsync(basepath, options, callback) {
	if (isFunction(options)) {
		callback = options;
		options = _setDefaultOptions();
	} else {
		options = _setDefaultOptions(options);
	}

	options.directoryTree = _directoryTreeAsync;
	basepath = path.resolve(basepath);

	var tree;
	return Promise.all(makeArray(basepath).reverse().map(function(basepath){
		var clonedOptions = simpleClone(options);
		clonedOptions.root = basepath;
		return _directoryTreeAsync(basepath, clonedOptions, callback);
	})).each(function(treeSource){
		if(tree){
			_mergeTrees(tree, treeSource);
		}else{
			tree = treeSource;
		}
	}).then(function(){
		return tree;
	});
}

/* End of public methods */


module.exports = {
	'directoryTree': directoryTree,
	'directoryTreeAsync': directoryTreeAsync
};
