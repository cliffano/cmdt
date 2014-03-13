var colors   = require('colors');
var buster   = require('buster-node');
var referee  = require('referee');
var reporter = require('../../lib/reporters/console');
var assert   = referee.assert;

buster.testCase('console - _segment', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.mockStdout  = this.mock(process.stdout);
  },
  'should write new line and test file name': function () {
    this.mockConsole.expects('log').withExactArgs();
    this.mockStdout.expects('write').withExactArgs('somefile.yml ');
    reporter.emit('segment', 'somefile.yml');
  }
});

buster.testCase('console - _success _failure _end', {
  setUp: function () {
    this.mockConsole = this.mock(console);
    this.mockStdout  = this.mock(process.stdout);
  },
  'display summary on end and handle success and failure accordingly': function () {

    // should log summary in green text when there is no failure
    this.mockConsole.expects('log').withExactArgs('');
    this.mockConsole.expects('log').withExactArgs('0 tests, 0 success, 0 failure'.green);
    
    reporter.emit('end', false);

    // should write a green dot and add test result to successes list
    this.mockStdout.expects('write').withExactArgs('.'.green);

    reporter.emit('success', { file: 'somefile1.yml', command: 'whoami' }, { exitCode: 0 });

    assert.equals(reporter.failures.length, 0);
    assert.equals(reporter.successes.length, 1);
    assert.equals(reporter.successes[0].test.command, 'whoami');
    assert.equals(reporter.successes[0].result.exitCode, 0);

    // should log summary in green text when there is no failure
    this.mockConsole.expects('log').withExactArgs('');
    this.mockConsole.expects('log').withExactArgs('1 tests, 1 success, 0 failure'.green);
    
    reporter.emit('end', false);

    // should write a red dot and add test result to failures list
    this.mockStdout.expects('write').withExactArgs('.'.red);

    reporter.emit('failure', ['someerror1' ], { description: 'somedesc', file: 'somefile2.yml', command: 'whoami' }, { exitCode: 0 });

    assert.equals(reporter.failures.length, 1);
    assert.equals(reporter.failures[0].errors, ['someerror1']);
    assert.equals(reporter.failures[0].test.command, 'whoami');
    assert.equals(reporter.failures[0].result.exitCode, 0);

    // should log summary in red text when there is failure
    this.mockConsole.expects('log').withExactArgs('');
    this.mockConsole.expects('error').withExactArgs('2 tests, 1 success, 1 failure'.red);
    this.mockConsole.expects('log').withExactArgs('\n---\nsomedesc\n' + 'somefile2.yml'.cyan + '> whoami');
    this.mockConsole.expects('error').withExactArgs('someerror1'.red);

    reporter.emit('end', false);

  }
});

buster.testCase('console - _dir', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should log directory when debug is enabled': function () {
    this.mockConsole.expects('log').withExactArgs('Using directory: %s'.grey, 'somedir');
    reporter.emit('dir', true, 'somedir');
  },
  'should not log directory when debug is disabled': function () {
    reporter.emit('dir', false, 'somedir');
  }
});