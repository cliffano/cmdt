var Cmdt     = require('../lib/cmdt');
var buster   = require('buster-node');
var mkdirp   = require('mkdirp');
var ncp      = require('ncp');
var referee  = require('referee');
var rimraf   = require('rimraf');
var reporter = require('../lib/reporters/cli');
var test     = require('../lib/test');
var assert   = referee.assert;

buster.testCase('cmdt - init', {
  'should delegate to ncp ncp when initialising the project': function (done) {
    this.stub(ncp, 'ncp', function (source, dest, cb) {
      assert.isTrue(source.match(/.+\/cmdt\/examples$/).length === 1);
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
    this.mockMkdirp   = this.mock(mkdirp);
    this.mockRimraf   = this.mock(rimraf);
    this.mockReporter = this.mock(reporter);
    this.mockTest     = this.mock(test);
    this.mockTimer    = this.useFakeTimers();
  },
  'should create run directory, emit to reporter, and clean up run directory': function (done) {
    this.mockReporter.expects('emit').withArgs('dir', false, 'somebasedir/cmdt-1-' + process.pid);
    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid);
    this.mockReporter.expects('emit').withExactArgs('segment', 'x.yml');
    this.mockTest.expects('load').withArgs('x.yml').callsArgWith(1, null, []);
    this.mockReporter.expects('emit').withExactArgs('segment', 'y.yml');
    this.mockTest.expects('load').withArgs('y.yml').callsArgWith(1, null, []);
    this.mockReporter.expects('emit').withExactArgs('end', false);
    this.mockRimraf.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid);
    this.mockTimer.tick(1);
    var cmdt = new Cmdt({
      baseDir: 'somebasedir',
      debug: false
    });
    cmdt.run([ 'x.yml', 'y.yml' ], function (err, result) {
      assert.isNull(err);
      assert.defined(result.successes);
      assert.defined(result.failures);
      done();
    });
  },
  'should pass test loading error to callback': function (done) {
    this.mockReporter.expects('emit').withArgs('dir', false, 'somebasedir/cmdt-1-' + process.pid);
    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid);
    this.mockReporter.expects('emit').withExactArgs('segment', 'x.yml');
    this.mockTest.expects('load').withArgs('x.yml').callsArgWith(1, null, []);
    this.mockReporter.expects('emit').withExactArgs('segment', 'y.yml');
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
  'should not clean up run directory when debug is true': function (done) {
    this.mockReporter.expects('emit').withArgs('dir', true, 'somebasedir/cmdt-1-' + process.pid);
    this.mockMkdirp.expects('sync').withExactArgs('somebasedir/cmdt-1-' + process.pid);
    this.mockReporter.expects('emit').withExactArgs('segment', 'x.yml');
    this.mockTest.expects('load').withArgs('x.yml').callsArgWith(1, null, []);
    this.mockReporter.expects('emit').withExactArgs('segment', 'y.yml');
    this.mockTest.expects('load').withArgs('y.yml').callsArgWith(1, null, []);
    this.mockReporter.expects('emit').withExactArgs('end', true);
    this.mockTimer.tick(1);
    var cmdt = new Cmdt({
      baseDir: 'somebasedir',
      debug: true
    });
    cmdt.run([ 'x.yml', 'y.yml' ], function (err, result) {
      assert.isNull(err);
      assert.defined(result.successes);
      assert.defined(result.failures);
      done();
    });
  }
});