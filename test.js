'use strict';

var dirtree = require('./lib/');

function nicePrint(tree){
	var paths = [];
	tree.children.forEach(function(item){
		paths.push(item.path);
		if(item.type === 'directory'){
			Array.prototype.push.apply(paths, nicePrint(item));
		}
	});
	return paths;
}

dirtree.directoryTreeAsync([
	'/srv/www/amazinggrace.eu',
	'/usr/local/bolt/amazinggrace.eu',
], {
	'ignoreList': ['.git/', '.idea/']
}).then(function(tree){
	console.log(nicePrint(tree).sort().join("\n"));
});