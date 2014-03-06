var buster  = require('buster-node');
var fs      = require('fs');
var referee = require('referee');
var test    = require('../lib/test');
var yamljs  = require('yaml-js');
var assert  = referee.assert;

buster.testCase('test - load', {
  setUp: function () {
    this.mockFs     = this.mock(fs);
    this.mockYamljs = this.mock(yamljs);

    this.mockFs.expects('readFileSync').withExactArgs('somefile').returns('sometext');
  },
  'should add file info to test': function (done) {
    var data = [{ command: 'whoami', description: 'somedesc' }];
    this.mockYamljs.expects('load').withExactArgs('sometext').returns(data);
    test.load('somefile', function (err, tests) {
      assert.isNull(err);
      assert.equals(tests.length, 1);
      assert.equals(tests[0].file, 'somefile');
      done();
    });
  },
  'should merge parameters into command': function (done) {
    var data = [
      { params: { message: 'some message' }},
      { command: 'echo "{message}"', description: 'somedesc' }
    ];
    this.mockYamljs.expects('load').withExactArgs('sometext').returns(data);
    test.load('somefile', function (err, tests) {
      assert.isNull(err);
      assert.equals(tests.length, 1);
      assert.equals(tests[0].command, 'echo "some message"');
      done();
    });
  },
  'should replace parameter with blank when there is no associated parameter': function (done) {
    var data = [
      { command: 'echo "{message}"', description: 'somedesc' }
    ];
    this.mockYamljs.expects('load').withExactArgs('sometext').returns(data);
    test.load('somefile', function (err, tests) {
      assert.isNull(err);
      assert.equals(tests.length, 1);
      assert.equals(tests[0].command, 'echo ""');
      done();
    });
  }
});