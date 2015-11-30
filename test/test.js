var expect = require('chai').expect;
var dirtree = require('../lib/');
var fs = require('fs');

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
        'ignoreList': ['.DS_Store', '.gitkeep']
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
        'ignoreList': ['test/test_data/some_dir_2', 'file_a.txt']
      });
      expect(tree.children.length).to.equal(2);
    });
  });

  describe('Tests for fileExtensions', function () {

    it('should get only files with certain extensions', function () {
      var tree = dirtree.directoryTree('./test/test_data/some_dir', {
        'fileExtensions': ['.png']
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
    dirtree.directoryTreeAsync('./test/test_data').then(function(tree){
      expect(tree).to.be.an('object');
      done();
    });
  });

  it('should display the size of a directory (summing up the children)', function (done) {
    dirtree.directoryTreeAsync('./test/test_data', ['.DS_Store', '.gitkeep']).then(function(tree){
      expect(tree.size).to.equal(11424);
      done();
    });
  });

  describe('Tests for listing files', function () {
    it('should list the children in a directory [default]', function (done) {
      dirtree.directoryTreeAsync('./test/test_data').then(function(tree){
        expect(tree.children.length).to.equal(4);
        done();
      });
    });

    it('should list the children in a directory', function (done) {
      dirtree.directoryTreeAsync('./test/test_data', {
        'hideFiles': false
      }).then(function(tree){
        expect(tree.children.length).to.equal(4);
        done();
      });
    });

    it('should hide files in a d' +
        'irectory listing', function (done) {
      dirtree.directoryTreeAsync('./test/test_data', {
        'hideFiles': true
      }).then(function(tree){
        expect(tree.children.length).to.equal(2);
        done();
      });
    });
  });

  describe('Tests for ignoring files and / or directories', function (done) {

    it('should ignore files', function (done) {
      dirtree.directoryTreeAsync('./test/test_data/some_dir_2', {
        'ignoreList': ['.DS_Store', '.gitkeep']
      }).then(function(tree){
        expect(tree.children.length).to.equal(0);
        done();
      });
    });

    it('should ignore directories', function (done) {
      dirtree.directoryTreeAsync('./test/test_data', {
        'ignoreList': ['test/test_data/some_dir_2']
      }).then(function(tree){
        expect(tree.children.length).to.equal(3);
        done();
      });
    });

    it('should ignore files and directories', function (done) {
      var tree = dirtree.directoryTreeAsync('./test/test_data', {
        'ignoreList': ['test/test_data/some_dir_2', 'file_a.txt']
      }).then(function(tree){
        expect(tree.children.length).to.equal(2);
        done();
      });
    });
  });

  describe('Tests for fileExtensions', function (done) {

    it('should get only files with certain extensions', function (done) {
      dirtree.directoryTreeAsync('./test/test_data/some_dir', {
        'fileExtensions': ['.png']
      }).then(function(tree){
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
      dirtree.directoryTreeAsync('./test/test_data/some_dir_2').then(function(tree){
        expect(tree.children.length).to.equal(2);
        done();
      });
    });

    it('should show empty directories', function (done) {
      dirtree.directoryTreeAsync('./test/test_data/some_dir_2', {
        'hideEmptyDirectories': false
      }).then(function(tree){
        expect(tree.children.length).to.equal(2);
        done();
      });
    });

    it('should hide empty directories', function (done) {
      dirtree.directoryTreeAsync('./test/test_data/some_dir_2', {
        'hideEmptyDirectories': true
      }).then(function(tree){
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
      dirtree.directoryTreeAsync('./test/test_data', {}, function(err, tree){
        if(!err){
          expect(tree).to.be.an('object');
          done();
        }
      });
    });

    it('should return an Object when callback is second parametre and no options', function (done) {
      dirtree.directoryTreeAsync('./test/test_data', function(err, tree){
        if(!err){
          expect(tree).to.be.an('object');
          done();
        }
      });
    });
  });

});
