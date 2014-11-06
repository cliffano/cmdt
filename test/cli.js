var bag   = require('bagofcli'),
  buster  = require('buster-node'),
  cli     = require('../lib/cli'),
  Cmdt    = require('../lib/cmdt'),
  referee = require('referee'),
  assert  = referee.assert;

buster.testCase('cli - exec', {
  'should contain commands with actions': function (done) {
    var mockCommand = function (base, actions) {
      assert.defined(base);
      assert.defined(actions.commands.init.action);
      assert.defined(actions.commands.run.action);
      done();
    };
    this.mock({});
    this.stub(bag, 'command', mockCommand);
    cli.exec();
  }
});

buster.testCase('cli - init', {
  setUp: function () {
    this.mockConsole = this.mock(console);
  },
  'should contain init command and delegate to breaker init when exec is called': function (done) {
    this.mockConsole.expects('log').once().withExactArgs('Creating sample test files');
    this.stub(bag, 'command', function (base, actions) {
      actions.commands.init.action();
    });
    this.stub(Cmdt.prototype, 'init', function (cb) {
      assert.equals(typeof cb, 'function');
      done();
    });
    cli.exec();
  }
});

buster.testCase('cli - run', {
  setUp: function () {
    this.mockBag     = this.mock(bag);
    this.mockProcess = this.mock(process);
  },
  'should execute test files and use number of failures as exit code': function () {
    // _run exit with test failures as exit code
    this.mockProcess.expects('exit').once().withExactArgs(1);
    // bagofcli exit because _run exit is mocked in this test and hence it doesn't exit immediately and fallback to bagofcli exit
    this.mockProcess.expects('exit').once().withExactArgs(0);
    this.stub(bag, 'command', function (base, actions) {
      actions.commands.run.action('sometest.yml', 'somedir');
    });
    this.mockBag.expects('files').returns(['sometest.yml', 'somedir/someothertest.yml']);
    this.stub(Cmdt.prototype, 'run', function (files, cb) {
      assert.equals(files.length, 2);
      assert.equals(files[0], 'sometest.yml');
      assert.equals(files[1], 'somedir/someothertest.yml');
      cb(null, { failures: [{ foo: 'somefakefailure' }]});
    });
    cli.exec();
  }
});