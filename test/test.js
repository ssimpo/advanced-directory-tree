'use strict';

var fs = require('fs');
var mock = require('mock-fs');
var expect = require('chai').expect;
var dirtree = require('../lib/');


mock(createMockFileSystem());

function createMockFileSystem(){
	var fileAContents = "Hello world\n";
	var fileBContents = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam ultrices ligula at metus iaculis accumsan. Donec at aliquam justo. Phasellus eu orci gravida, rutrum eros eget, ultrices lacus. Mauris lacinia tortor eu vestibulum vestibulum. Sed eleifend nec ex vel egestas. Donec viverra nibh eu neque gravida, in tincidunt nisi ultricies. Praesent dictum molestie magna mollis accumsan. Proin sed egestas quam. Mauris luctus ante ipsum, non porta ex ultrices eu. Quisque gravida lectus ut diam porta, ut tempus magna fermentum. In hac habitasse platea dictumst. Phasellus sollicitudin tempor feugiat. Nullam imperdiet cursus arcu, sit amet interdum enim feugiat eget. Ut elit metus, semper in turpis luctus, aliquam pharetra libero. Morbi eget lectus vel enim suscipit tempus eget et ipsum.\n\nCurabitur imperdiet tortor turpis. Ut eu faucibus sem, ut suscipit tellus. Quisque vitae nunc et felis pretium pellentesque sed in mi. Fusce eu eros nulla. Integer sagittis a ligula non vehicula. Pellentesque consequat lacinia justo ac tempor. Cras accumsan nibh dictum eros blandit, nec tempor ante egestas. Proin vitae augue vitae lorem eleifend faucibus cursus a eros. Maecenas quam velit, tincidunt nec quam quis, cursus finibus eros. Suspendisse dignissim tempus tortor, vel imperdiet mi gravida sed. Nam placerat sapien vel quam efficitur mattis. Mauris vehicula dolor id lacus viverra, eu vehicula arcu suscipit.\n\nNunc finibus, erat at hendrerit scelerisque, massa mi cursus mauris, eget suscipit est neque non elit. Suspendisse potenti. Quisque a fermentum ligula, eget luctus felis. Aliquam et lorem risus. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla scelerisque lectus ut lorem molestie accumsan. Etiam pulvinar volutpat augue id maximus. Curabitur dapibus augue magna, in ullamcorper urna lobortis id. Curabitur molestie accumsan sapien quis vestibulum. Sed quis nisi condimentum, fringilla nulla sed, aliquet elit. Donec non turpis odio. Donec sodales volutpat lectus, in rutrum erat tempor vel. Nullam auctor erat a turpis dignissim imperdiet. Fusce in tellus nec mi mattis bibendum id nec metus.\n\nNullam efficitur, risus eu ornare pretium, sapien dui rhoncus est, non vulputate purus ipsum non sem. Proin a sem id lectus porttitor auctor ut eget sem. Nullam sodales odio enim, at tincidunt libero tempor vulputate. Nulla facilisi. Maecenas semper tincidunt congue. Phasellus dictum nisi nec nunc finibus finibus. Pellentesque lacinia ante pulvinar justo fermentum tristique. Praesent sit amet arcu lacus. Sed in pharetra nisl. Nunc iaculis ipsum id diam rutrum, eu feugiat lectus euismod. Aenean nunc nunc, lacinia in elementum sed, sagittis at nulla. Curabitur ut posuere urna. Nulla augue ex, cursus eu arcu eu, suscipit ultrices risus.\n\nPhasellus varius tincidunt est, accumsan hendrerit justo feugiat non. Proin hendrerit, nibh lobortis auctor suscipit, felis nibh malesuada erat, at venenatis ex risus id enim. Nulla rutrum velit ut rhoncus molestie. Quisque ac accumsan risus. Sed non nisi non libero volutpat lobortis. Aliquam viverra felis non lacus efficitur rutrum. Ut sagittis metus dolor, non efficitur turpis porta eget. Praesent ullamcorper, lacus congue suscipit accumsan, leo magna rhoncus nisl, vitae rhoncus dolor odio in odio. Nam neque odio, auctor et lacinia id, posuere sed enim. Etiam sit amet purus viverra, ultrices nisl sit amet, porttitor leo. Ut imperdiet congue pretium. Cras quis neque et lorem scelerisque malesuada. Maecenas et vestibulum erat. Cras faucibus tristique purus at dapibus. Phasellus auctor justo ante, vel feugiat arcu lobortis eu. Sed arcu diam, tincidunt vel leo ac, iaculis vehicula lacus.";
	var fileCContents = new Buffer([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52, 0x00, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x01, 0x08, 0x06, 0x00, 0x00, 0x00, 0x1F, 0x15, 0xC4, 0x89, 0x00, 0x00, 0x00, 0x01, 0x73, 0x52, 0x47, 0x42, 0x00, 0xAE, 0xCE, 0x1C, 0xE9, 0x00, 0x00, 0x00, 0x04, 0x67, 0x41, 0x4D, 0x41, 0x00, 0x00, 0xB1, 0x8F, 0x0B, 0xFC, 0x61, 0x05, 0x00, 0x00, 0x00, 0x09, 0x70, 0x48, 0x59, 0x73, 0x00, 0x00, 0x0E, 0xC2, 0x00, 0x00, 0x0E, 0xC2, 0x01, 0x15, 0x28, 0x4A, 0x80, 0x00, 0x00, 0x00, 0x0D, 0x49, 0x44, 0x41, 0x54, 0x18, 0x57, 0x63, 0xF8, 0xFF, 0xFF, 0xFF, 0x7F, 0x00, 0x09, 0xFB, 0x03, 0xFD, 0x05, 0x43, 0x45, 0xCA, 0x00, 0x00, 0x00, 0x00, 0x49, 0x45, 0x4E, 0x44, 0xAE, 0x42, 0x60, 0x82]);

	var files = {};
	files[process.cwd() + '/test'] = {
		'test_data': {
			'some_dir': {
				'another_dir': {
					'file_a.txt': fileAContents,
					'file_b.txt': fileBContents
				},
				'file_a.txt': fileAContents,
				'file_b.txt': fileBContents,
				'test.png': fileCContents
			},
			'some_dir_2': {
				'.gitkeep': ''
			},
			'file_a.txt': fileAContents,
			'file_b.txt': fileBContents
		}
	};

	return files;
}

describe('directoryTree', function () {

	it('should return an Object', function () {
		var tree = dirtree.directoryTree('./test/test_data');
		expect(tree).to.be.an('object');
	});

	it('should display the size of a directory (summing up the children)', function () {
		var tree = dirtree.directoryTree('./test/test_data', ['.DS_Store', '.gitkeep']);
		expect(tree.size).to.equal(11424);
	});

	describe('Tests for listing files', function () {
		it('should list the children in a directory [default]', function () {
			var tree = dirtree.directoryTree('./test/test_data');
			expect(tree.children.length).to.equal(4);
		});

		it('should list the children in a directory', function () {
			var tree = dirtree.directoryTree('./test/test_data', {'hideFiles': false});
			expect(tree.children.length).to.equal(4);
		});

		it('should hide files in a directory listing', function () {
			var tree = dirtree.directoryTree('./test/test_data', {'hideFiles': true});
			expect(tree.children.length).to.equal(2);
		});
	});

	describe('Tests for ignoring files and / or directories', function () {

		it('should ignore files', function () {
			var tree = dirtree.directoryTree('./test/test_data/some_dir_2', {
				'ignoreList': ['*/.DS_Store', '*/.gitkeep']
			});
			expect(tree.children.length).to.equal(0);
		});

		it('should ignore directories', function () {
			var tree = dirtree.directoryTree('./test/test_data', {
				'ignoreList': ['test/test_data/some_dir_2']
			});
			expect(tree.children.length).to.equal(3);
		});

		it('should ignore files and directories', function () {
			var tree = dirtree.directoryTree('./test/test_data', {
				'ignoreList': ['test/test_data/some_dir_2', '*/file_a.txt']
			});
			expect(tree.children.length).to.equal(2);
		});
	});

	describe('Tests for fileExtensions', function () {

		it('should get only files with certain extensions', function () {
			var tree = dirtree.directoryTree('./test/test_data/some_dir', {
				'fileExtensions': ['*.png']
			});
			expect(tree.children.length).to.equal(2);
		});

	});

	/*
	 *  Tests for empty directories
	 */
	describe('Tests for empty directories', function () {
		beforeEach(function (done) {
			fs.mkdir('./test/test_data/some_dir_2/test-dir', function () {
				done();
			});
		});

		it('should show empty directories [default]', function () {
			var tree = dirtree.directoryTree('./test/test_data/some_dir_2');
			expect(tree.children.length).to.equal(2);
		});

		it('should show empty directories', function () {
			var tree = dirtree.directoryTree('./test/test_data/some_dir_2', {'hideEmptyDirectories': false});
			expect(tree.children.length).to.equal(2);
		});

		it('should hide empty directories', function () {
			var tree = dirtree.directoryTree('./test/test_data/some_dir_2', {'hideEmptyDirectories': true});
			expect(tree.children.length).to.equal(1);
		});

		afterEach(function (done) {
			fs.rmdir('./test/test_data/some_dir_2/test-dir', function () {
				done();
			});
		});
	});

});

describe('directoryTreeAsync', function () {
	it('should return an Object', function (done) {
		dirtree.directoryTreeAsync('./test/test_data').then(function (tree) {
			expect(tree).to.be.an('object');
			done();
		});
	});

	it('should display the size of a directory (summing up the children)', function (done) {
		dirtree.directoryTreeAsync('./test/test_data', ['*/.DS_Store', '*/.gitkeep']).then(function (tree) {
			expect(tree.size).to.equal(11424);
			done();
		});
	});

	describe('Tests for listing files', function () {
		it('should list the children in a directory [default]', function (done) {
			dirtree.directoryTreeAsync('./test/test_data').then(function (tree) {
				expect(tree.children.length).to.equal(4);
				done();
			});
		});

		it('should list the children in a directory', function (done) {
			dirtree.directoryTreeAsync('./test/test_data', {
				'hideFiles': false
			}).then(function (tree) {
				expect(tree.children.length).to.equal(4);
				done();
			});
		});

		it('should hide files in a directory listing', function (done) {
			dirtree.directoryTreeAsync('./test/test_data', {
				'hideFiles': true
			}).then(function (tree) {
				expect(tree.children.length).to.equal(2);
				done();
			});
		});
	});

	describe('Tests for ignoring files and / or directories', function (done) {

		it('should ignore files', function (done) {
			dirtree.directoryTreeAsync('./test/test_data/some_dir_2', {
				'ignoreList': ['*/.DS_Store', '*/.gitkeep']
			}).then(function (tree) {
				expect(tree.children.length).to.equal(0);
				done();
			});
		});

		it('should ignore directories', function (done) {
			dirtree.directoryTreeAsync('./test/test_data', {
				'ignoreList': ['test/test_data/some_dir_2']
			}).then(function (tree) {
				expect(tree.children.length).to.equal(3);
				done();
			});
		});

		it('should ignore files and directories', function (done) {
			var tree = dirtree.directoryTreeAsync('./test/test_data', {
				'ignoreList': ['test/test_data/some_dir_2', '*/file_a.txt']
			}).then(function (tree) {
				expect(tree.children.length).to.equal(2);
				done();
			});
		});
	});

	describe('Tests for fileExtensions', function (done) {

		it('should get only files with certain extensions', function (done) {
			dirtree.directoryTreeAsync('./test/test_data/some_dir', {
				'fileExtensions': ['*.png']
			}).then(function (tree) {
				expect(tree.children.length).to.equal(2);
				done();
			});
		});

	});

	/*
	 *  Tests for empty directories
	 */
	describe('Tests for empty directories', function () {
		beforeEach(function (done) {
			fs.mkdir('./test/test_data/some_dir_2/test-dir', function () {
				done();
			});
		});

		it('should show empty directories [default]', function (done) {
			dirtree.directoryTreeAsync('./test/test_data/some_dir_2').then(function (tree) {
				expect(tree.children.length).to.equal(2);
				done();
			});
		});

		it('should show empty directories', function (done) {
			dirtree.directoryTreeAsync('./test/test_data/some_dir_2', {
				'hideEmptyDirectories': false
			}).then(function (tree) {
				expect(tree.children.length).to.equal(2);
				done();
			});
		});

		it('should hide empty directories', function (done) {
			dirtree.directoryTreeAsync('./test/test_data/some_dir_2', {
				'hideEmptyDirectories': true
			}).then(function (tree) {
				expect(tree.children.length).to.equal(1);
				done();
			});
		});

		afterEach(function (done) {
			fs.rmdir('./test/test_data/some_dir_2/test-dir', function () {
				done();
			});
		});
	});

	describe('Should provide node style callback in addtion to promise', function () {
		it('should return an Object', function (done) {
			dirtree.directoryTreeAsync('./test/test_data', {}, function (err, tree) {
				if (!err) {
					expect(tree).to.be.an('object');
					done();
				}
			});
		});

		it('should return an Object when callback is second parametre and no options', function (done) {
			dirtree.directoryTreeAsync('./test/test_data', function (err, tree) {
				if (!err) {
					expect(tree).to.be.an('object');
					done();
				}
			});
		});
	});

});
