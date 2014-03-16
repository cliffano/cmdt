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
    this.mockConsole.expects('log').withExactArgs('0 test, 0 success, 0 failure'.green);
    
    reporter.emit('end', false);

    // should write a green dot and add test result to successes list
    this.mockStdout.expects('write').withExactArgs('.'.green);

    reporter.emit('success', { file: 'success1.yml', command: 'successcommand1' }, { exitCode: 0 });

    assert.equals(reporter.failures.length, 0);
    assert.equals(reporter.successes.length, 1);
    assert.equals(reporter.successes[0].test.command, 'successcommand1');
    assert.equals(reporter.successes[0].result.exitCode, 0);

    // should write a red dot and add test result to failures list
    this.mockStdout.expects('write').withExactArgs('.'.red);

    reporter.emit('failure', ['someerror1' ], { description: 'failuredesc1', file: 'failure1.yml', dir: 'failuredir1', command: 'failurecommand1', output: 'expectedfailureoutput1' }, { exitcode: 10, output: 'failureoutput1' });

    assert.equals(reporter.failures.length, 1);
    assert.equals(reporter.failures[0].errors, ['someerror1']);
    assert.equals(reporter.failures[0].test.command, 'failurecommand1');
    assert.equals(reporter.failures[0].result.exitcode, 10);

    // should log summary in red text when there is failure, and debug output and exitcode
    this.mockConsole.expects('log').withExactArgs('');
    this.mockConsole.expects('error').withExactArgs('2 tests, 1 success, 1 failure'.red);
    this.mockConsole.expects('error').withExactArgs('\n----------------\nfailuredesc1\n' + 'failure1.yml'.cyan + '\nfailurecommand1');
    this.mockConsole.expects('error').withExactArgs('someerror1'.red);
    this.mockConsole.expects('error').withExactArgs('exec dir: %s\n'.grey, 'failuredir1');
    this.mockConsole.expects('error').withExactArgs('%s: %s\n'.grey, 'output', 'failureoutput1');

    reporter.emit('end', true);

    // emit another success event
    this.mockStdout.expects('write').withExactArgs('.'.green);

    reporter.emit('success', { file: 'success2.yml', command: 'successcommand2' }, { exitcode: 0 });

    assert.equals(reporter.failures.length, 1);
    assert.equals(reporter.successes.length, 2);
    assert.equals(reporter.successes[1].test.command, 'successcommand2');
    assert.equals(reporter.successes[1].result.exitcode, 0);

    // emit another failure event, but this time without test description
    this.mockStdout.expects('write').withExactArgs('.'.red);

    reporter.emit('failure', ['someerror2' ], { file: 'failure2.yml', dir: 'failuredir2', command: 'failurecommand2' }, { exitcode: 10 });

    assert.equals(reporter.failures.length, 2);
    assert.equals(reporter.failures[1].errors, ['someerror2']);
    assert.equals(reporter.failures[1].test.command, 'failurecommand2');
    assert.equals(reporter.failures[1].result.exitcode, 10);

    // emit another end event, should not display description
    this.mockConsole.expects('log').withExactArgs('');
    this.mockConsole.expects('error').withExactArgs('4 tests, 2 successes, 2 failures'.red);
    this.mockConsole.expects('error').withExactArgs('\n----------------\nfailuredesc1\n' + 'failure1.yml'.cyan + '\nfailurecommand1');
    this.mockConsole.expects('error').withExactArgs('someerror1'.red);
    this.mockConsole.expects('error').withExactArgs('\n----------------\n' + 'failure2.yml'.cyan + '\nfailurecommand2');
    this.mockConsole.expects('error').withExactArgs('someerror2'.red);

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