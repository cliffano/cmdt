var buster  = require('buster-node');
var fs      = require('fs');
var referee = require('referee');
var test    = require('../lib/test');
var yamljs  = require('yaml-js');
var assert  = referee.assert;

buster.testCase('test - load', {
  setUp: function () {
    this.mockFs      = this.mock(fs);
    this.mockYamljs  = this.mock(yamljs);

    this.mockFs.expects('readFileSync').withExactArgs('somefile').returns('sometext');
  },
  'should add file info to test': function (done) {
    var data = [{ command: 'whoami', description: 'somedesc' }];
    this.mockYamljs.expects('load').withExactArgs('sometext').returns(data);
    test.load('somefile', function (err, tests, fixtures) {
      assert.equals(err, null);
      assert.equals(tests.length, 1);
      assert.equals(tests[0].file, 'somefile');
      assert.equals(fixtures, []);
      done();
    });
  },
  'should pass fixtures to callback if specified in test file': function (done) {
    var data = [{ fixtures: ['somefixturedir1', 'somefixturedir2'] }, { command: 'whoami', description: 'somedesc' }];
    this.mockYamljs.expects('load').withExactArgs('sometext').returns(data);
    test.load('somefile', function (err, tests, fixtures) {
      assert.equals(err, null);
      assert.equals(tests.length, 1);
      assert.equals(tests[0].file, 'somefile');
      assert.equals(fixtures, ['somefixturedir1', 'somefixturedir2']);
      done();
    });
  },
  'should pass empty tests array when test file is empty': function (done) {
    var data = [{ command: 'whoami', description: 'somedesc' }];
    this.mockYamljs.expects('load').withExactArgs('sometext').returns(null);
    test.load('somefile', function (err, tests, fixtures) {
      assert.equals(err, null);
      assert.equals(tests.length, 0);
      assert.equals(fixtures, []);
      done();
    });
  },
  'should merge parameters into command': function (done) {
    var data = [
      { params: { message: 'some message' }},
      { command: 'echo "{message}"', description: 'somedesc' }
    ];
    this.mockYamljs.expects('load').withExactArgs('sometext').returns(data);
    test.load('somefile', function (err, tests, fixtures) {
      assert.equals(err, null);
      assert.equals(tests.length, 1);
      assert.equals(tests[0].command, 'echo "some message"');
      assert.equals(fixtures, []);
      done();
    });
  },
  'should merge environment variable parameters into command': function (done) {
    var data = [
      { params: { message: 'some message' }},
      { command: 'echo "{_env.foo}"', description: 'somedesc' }
    ];
    this.stub(process, 'env', { foo: 'bar' });
    this.mockYamljs.expects('load').withExactArgs('sometext').returns(data);
    test.load('somefile', function (err, tests, fixtures) {
      assert.equals(err, null);
      assert.equals(tests.length, 1);
      assert.equals(tests[0].command, 'echo "bar"');
      assert.equals(fixtures, []);
      done();
    });
  },
  'should replace parameter with blank when there is no associated parameter': function (done) {
    var data = [
      { command: 'echo "{message}"', description: 'somedesc' }
    ];
    this.mockYamljs.expects('load').withExactArgs('sometext').returns(data);
    test.load('somefile', function (err, tests, fixtures) {
      assert.equals(err, null);
      assert.equals(tests.length, 1);
      assert.equals(tests[0].command, 'echo ""');
      assert.equals(fixtures, []);
      done();
    });
  }
});
