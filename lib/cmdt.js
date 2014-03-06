var async    = require('async');
var checker  = require('./checker');
var child    = require('child_process');
var colors   = require('colors');
var mkdirp   = require('mkdirp');
var ncp      = require('ncp');
var os       = require('os');
var p        = require('path');
var reporter = require('./reporters/cli');
var rimraf   = require('rimraf');
var test     = require('./test');

/**
 * class Cmdt
 */
function Cmdt(opts) {

  this.opts         = opts || {};
  this.opts.baseDir = this.opts.baseDir || os.tmpdir();
  this.opts.debug   = this.opts.debug || false;
  this.runId        = 'cmdt-' + new Date().getTime() + '-' + process.pid;
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

  var runDir = p.join(this.opts.baseDir, this.runId);
  var self   = this;

  reporter.emit('dir', this.opts.debug, runDir);
  mkdirp.sync(runDir);

  function iter(file, cb) {
    reporter.emit('segment', file);
    test.load(file, function (err, tests) {
      if (err) {
        cb(err);
      } else {
        self._exec(tests, cb);
      }
    });
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

  var self = this;
  var exitCode;

  function iter(test, cb) {

    function _execCb(err) {
      var result = { exitcode: exitCode, output: output};
      var errors = checker.check(result, test);

      if (errors.length === 0) {
        reporter.emit('success', test, result);
      } else {
        reporter.emit('failure', errors, test, result);
      }
      cb();
    }

    var output  = '';
    var testDir = p.join(self.opts.baseDir, self.runId, test.file.replace(/.cmdt$/, ''));

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