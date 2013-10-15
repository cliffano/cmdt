var async = require('async'),
  checker = require('./checker'),
  child = require('child_process'),
  colors = require('colors'),
  fs = require('fs'),
  mkdirp = require('mkdirp'),
  ncp = require('ncp'),
  os = require('os'),
  p = require('path'),
  reporter = require('./reporter'),
  rimraf = require('rimraf'),
  yamljs = require('yaml-js');

/**
 * class Cmdt
 */
function Cmdt(opts) {
  this.opts = opts || {};
  this.opts.baseDir = this.opts.baseDir || os.tmpdir();
  this.opts.debug = this.opts.debug || false;
  this.runId = 'cmdt-' + new Date().getTime() + '-' + process.pid;
}

/**
 * Create example cmdt test files.
 *
 * @param {Function} cb: standard cb(err, result) callback
 */
Cmdt.prototype.init = function (cb) {
  ncp.ncp(p.join(__dirname, '../examples'), '.', cb);
};

/**
 * Parse .cmdt test files and run all tests.
 *
 * @param {Array} files: test files to run
 * @param {Function} cb: standard cb(err, result) callback
 */
Cmdt.prototype.run = function (files, cb) {
  var runDir = p.join(this.opts.baseDir, this.runId),
    self = this;

  reporter.emit('dir', this.opts.debug, runDir);
  mkdirp.sync(runDir);

  function iter(file, cb) {
    var tests = yamljs.load(fs.readFileSync(file).toString());

    tests.forEach(function (test) {
      test.file = file;
    });
    
    reporter.emit('segment', file);
    self._exec(tests, cb);
  }
  async.eachSeries(files, iter, function (err) {
    if (!err) {
      reporter.emit('end', self.opts.debug);
      if (!self.opts.debug) {
        rimraf.sync(runDir);
      }
    }
    cb(err, { successes: reporter.successes, failures: reporter.failures });
  });
};

/**
 * Execute command and validate output of each test.
 * Commands will be executed in a sandbox directory.
 *
 * @param {Array} tests: test settings
 * @param {Function} cb: standard cb(err, result) callback
 */
Cmdt.prototype._exec = function (tests, cb) {
  var self = this,
    exitCode;

  function iter(test, cb) {

    function _execCb(err) {
      var result = { exitcode: exitCode, output: output},
        errors = checker.check(result, test);

      if (errors.length === 0) {
        reporter.emit('success', test, result);
      } else {
        reporter.emit('failure', errors, test, result);
      }
      cb();
    }

    var output = '',
      testDir = p.join(self.opts.baseDir, self.runId, test.file.replace(/.cmdt$/, ''));

    mkdirp.sync(testDir);

    var _exec = child.exec(test.command, { cwd: testDir }, _execCb);
    _exec.on('exit', function (code) {
      exitCode = code;
    });
    _exec.stdout.on('data', function (data) {
      output += data;
    });
    _exec.stderr.on('data', function (data) {
      output += data;
    });
  }
  async.eachSeries(tests, iter, cb);
};

module.exports = Cmdt;