var buster  = require('buster-node');
var checker = require('../lib/checker');
var referee = require('referee');
var assert  = referee.assert;

buster.testCase('checker - _checkExitCode', {
  'should return error when test result exit code does not match expected exit code': function () {
    var result = { exitcode: 1 };
    var test   = { exitcode: 0 };
    var errors = checker.check(result, test);
    assert.equals(errors.length, 1);
    assert.equals(errors[0], 'Exit code 1 does not match expected 0');
  },
  'should return no error when there is no expectation': function () {
    var result = { exitcode: 1 };
    var test   = {};
    var errors = checker.check(result, test);
    assert.equals(errors.length, 0);
  },
  'should return no error when test result exit code matches expected exit code': function () {
    var result = { exitcode: 1 };
    var test   = { exitcode: '1' };
    var errors = checker.check(result, test);
    assert.equals(errors.length, 0);
  }
});

buster.testCase('checker - _checkOutput', {
  'should return error when test result output does not match expected output': function () {
    var result = { output: 'Hello world' };
    var test   = { output: 'Foo Bar' };
    var errors = checker.check(result, test);
    assert.equals(errors.length, 1);
    assert.equals(errors[0], 'Output does not match expected regexp \'Foo Bar\'');
  },
  'should return no error when there is no expectation': function () {
    var result = { output: 'Hello world' };
    var test   = {};
    var errors = checker.check(result, test);
    assert.equals(errors.length, 0);
  },
  'should return no error when test result output exactly matches expected output': function () {
    var result = { output: 'Hello world' };
    var test   = { output: 'Hello world' };
    var errors = checker.check(result, test);
    assert.equals(errors.length, 0);
  },
  'should return no error when test result output matches expected output regular expression': function () {
    var result = { output: 'Hello world' };
    var test   = { output: '^Hello w.+' };
    var errors = checker.check(result, test);
    assert.equals(errors.length, 0);
  }
});