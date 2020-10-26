var child    = require('child_process');
var Cmdt     = require('../lib/cmdt');
var buster   = require('buster-node');
var fs       = require('fs');
var fsx      = require('fs-extra');
var mkdirp   = require('mkdirp');
var ncp      = require('ncp');
var referee  = require('referee');
var rimraf   = require('rimraf');
var reporter = require('../lib/reporters/console');
var test     = require('../lib/test');
var assert   = referee.assert;

buster.testCase('cmdt - init', {
  setUp: function () {
    this.mock({});
  },
  'should delegate to ncp ncp when initialising the project': function (done) {
    this.stub(ncp, 'ncp', function (source, dest, cb) {
      assert.isTrue(source.match(/.+\/examples$/).length === 1);
      assert.equals(dest, '.');
      cb();
    });
    var cmdt = new Cmdt();
    cmdt.init(function (err, result) {
      done();
    });
  }
});

buster.testCase('cmdt - run', {
  setUp: function () {
    this.mockFs       = this.mock(fs);
    this.mockFsx      = this.mock(fsx);
    this.mockMkdirp   = this.mock(mkdirp);
    this.mockNcp      = this.mock(ncp);
    this.mockRimraf   = this.mock(rimraf);
    this.mockReporter = this.mock(reporter);
    this.mockTest     = this.mock(test);
    this.mockTimer    = this.useFakeTimers();
  },
  'should create run directory, test directory with fixtures, emit to reporter, and clean up run directory': function (done) {

    this.mockReporter.expects('emit').withArgs('dir', false, 'somebasedir/cmdt-1-' + process.pid);
    this.mockReporter.expects('emit').withExactArgs('segment', 'x.yml');
    this.mockReporter.expects('emit').withExactArgs('segment', 'y.yml');
    this.mockReporter.expects('emit').withExactArgs('end', false);

    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid);
    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid + '/x.yml');
    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid + '/y.yml');
    this.mockRimraf.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid);

    this.mockTest.expects('load').withArgs('x.yml').callsArgWith(1, null, [], ['fixturedir1', 'fixturedir2', 'fixturefile1']);
    this.mockTest.expects('load').withArgs('y.yml').callsArgWith(1, null, [], []);
    
    var mockStatIsDir = {
      isDirectory: function () {
        return true;
      }
    };
    var mockStatIsFile = {
      isDirectory: function () {
        return false;
      }
    };
    this.mockFs.expects('lstatSync').withExactArgs('fixturedir1').returns(mockStatIsDir);
    this.mockFs.expects('lstatSync').withExactArgs('fixturedir2').returns(mockStatIsDir);
    this.mockFs.expects('lstatSync').withExactArgs('fixturefile1').returns(mockStatIsFile);
    this.mockFsx.expects('copy').withArgs('fixturedir1', 'somebasedir/cmdt-1-' + process.pid + '/x.yml').callsArgWith(2);
    this.mockFsx.expects('copy').withArgs('fixturedir2', 'somebasedir/cmdt-1-' + process.pid + '/x.yml').callsArgWith(2);
    this.mockFsx.expects('copy').withArgs('fixturefile1', 'somebasedir/cmdt-1-' + process.pid + '/x.yml/fixturefile1').callsArgWith(2);

    this.mockTimer.tick(1);

    var cmdt = new Cmdt({
      baseDir: 'somebasedir',
      debug: false
    });

    cmdt.run([ 'x.yml', 'y.yml' ], function (err, result) {
      assert.equals(err, null);
      assert.defined(result.successes);
      assert.defined(result.failures);
      done();
    });
  },
  'should pass test loading error to callback': function (done) {
    
    this.mockReporter.expects('emit').withArgs('dir', false, 'somebasedir/cmdt-1-' + process.pid);
    this.mockReporter.expects('emit').withExactArgs('segment', 'x.yml');
    this.mockReporter.expects('emit').withExactArgs('segment', 'y.yml');

    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid);
    
    this.mockTest.expects('load').withArgs('x.yml').callsArgWith(1, null, [], []);
    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid + '/x.yml');
    this.mockTest.expects('load').withArgs('y.yml').callsArgWith(1, new Error('some error'));

    this.mockTimer.tick(1);

    var cmdt = new Cmdt({
      baseDir: 'somebasedir',
      debug: false
    });

    cmdt.run([ 'x.yml', 'y.yml' ], function (err, result) {
      assert.equals(err.message, 'some error');
      done();
    });
  },
  'should pass error to callback on fixtures dir copying': function (done) {

    this.mockReporter.expects('emit').withArgs('dir', false, 'somebasedir/cmdt-1-' + process.pid);
    this.mockReporter.expects('emit').withExactArgs('segment', 'x.yml');

    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid);
    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid + '/x.yml');

    this.mockTest.expects('load').withArgs('x.yml').callsArgWith(1, null, [], ['fixturedir1', 'fixturedir2']);

    var mockStat = {
      isDirectory: function () {
        return true;
      }
    };
    this.mockFs.expects('lstatSync').withExactArgs('fixturedir1').returns(mockStat);
    this.mockFs.expects('lstatSync').withExactArgs('fixturedir2').returns(mockStat);
    this.mockFsx.expects('copy').withArgs('fixturedir1', 'somebasedir/cmdt-1-' + process.pid + '/x.yml').callsArgWith(2);
    this.mockFsx.expects('copy').withArgs('fixturedir2', 'somebasedir/cmdt-1-' + process.pid + '/x.yml').callsArgWith(2, new Error('some error'));

    this.mockTimer.tick(1);

    var cmdt = new Cmdt({
      baseDir: 'somebasedir',
      debug: false
    });

    cmdt.run([ 'x.yml', 'y.yml' ], function (err, result) {
      assert.equals(err.message, 'some error');
      done();
    });
  },
  'should not clean up run directory when debug is true': function (done) {

    this.mockReporter.expects('emit').withArgs('dir', true, 'somebasedir/cmdt-1-' + process.pid);
    this.mockReporter.expects('emit').withExactArgs('segment', 'x.yml');
    this.mockReporter.expects('emit').withExactArgs('segment', 'y.yml');
    this.mockReporter.expects('emit').withExactArgs('end', true);

    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid);
    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid + '/x.yml');
    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid + '/y.yml');

    this.mockTest.expects('load').withArgs('x.yml').callsArgWith(1, null, [], []);
    this.mockTest.expects('load').withArgs('y.yml').callsArgWith(1, null, [], []);

    this.mockTimer.tick(1);
    
    var cmdt = new Cmdt({
      baseDir: 'somebasedir',
      debug: true
    });

    cmdt.run([ 'x.yml', 'y.yml' ], function (err, result) {
      assert.equals(err, null);
      assert.defined(result.successes);
      assert.defined(result.failures);
      done();
    });
  }
});

buster.testCase('cmdt - _exec', {
  setUp: function () {
    this.mockChild   = this.mock(child);
    this.mockMkdirp  = this.mock(mkdirp);
    this.mockTimer   = this.useFakeTimers();
  },
  'should register exit and stdout+stderr data event listeners': function (done) {

    var mockExec = {
      on: function (event, cb) {
        assert.equals(event, 'exit');
        cb(0);
      },
      stdout: {
        on: function (event, cb) {
          assert.equals(event, 'data');
          cb('somestdoutdata');
        }
      },
      stderr: {
        on: function (event, cb) {
          assert.equals(event, 'data');
          cb('somestderrdata');
        }
      }
    };

    this.mockChild.expects('exec')
      .withArgs('whoami', { cwd: 'sometestdir' })
      .returns(mockExec);

    this.mockTimer.tick(1);
    
    var cmdt = new Cmdt({
      baseDir: 'somebasedir',
      runId: 'somerunid'
    });

    var tests = [
      { command: 'whoami', file: 'file1.yml', exitcode: 111 }
    ];
    cmdt._exec(tests, 'sometestdir');
    assert.equals(cmdt._execData['0-file1.yml'].output, 'somestdoutdatasomestderrdata');
    assert.equals(cmdt._execData['0-file1.yml'].stdout, 'somestdoutdata');
    assert.equals(cmdt._execData['0-file1.yml'].stderr, 'somestderrdata');
    done();
  }
});

buster.testCase('cmdt - _testCb', {
  setUp: function () {
    this.mockReporter = this.mock(reporter);
  },
  'should emit success to reporter when there is no error': function (done) {
    this.mockReporter.expects('emit').withExactArgs('success', { execId: '222-somefile1.yml', exitcode: 0, file: 'somefile1.yml', output: 'someoutput' }, { exitcode: 0, output: 'someoutput' });

    var test = { execId: '222-somefile1.yml', file: 'somefile1.yml', exitcode: 0, output: 'someoutput' };

    var cmdt = new Cmdt();
    cmdt._execData['222-somefile1.yml'] = {
      exitcode: 0,
      output  : 'someoutput'
    };
    cmdt._testCb(test, done)();
  },
  'should emit failure to reporter when there is an error': function (done) {
    this.mockReporter.expects('emit').withExactArgs('failure', ['Output: \'someoutput\' does not match expected regexp \'someotheroutput\''], { execId: '333-somefile2.yml', exitcode: 0, file: 'somefile2.yml', output: 'someotheroutput' }, { exitcode: 0, output: 'someoutput' });

    var test = { execId: '333-somefile2.yml', file: 'somefile2.yml', exitcode: 0, output: 'someotheroutput' };

    var cmdt = new Cmdt();
    cmdt._execData['333-somefile2.yml'] = {
      exitcode: 0,
      output  : 'someoutput'
    };
    cmdt._testCb(test, done)();
  }
});
