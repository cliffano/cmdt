var async    = require('async');
var checker  = require('./checker');
var child    = require('child_process');
var colors   = require('colors');
var mkdirp   = require('mkdirp');
var ncp      = require('ncp');
var os       = require('os');
var p        = require('path');
var reporter = require('./reporters/console');
var rimraf   = require('rimraf');
var test     = require('./test');
var util     = require('util');

/**
 * class Cmdt
 */
function Cmdt(opts) {

  this.opts         = opts || {};
  this.opts.baseDir = this.opts.baseDir || os.tmpdir();
  this.opts.debug   = this.opts.debug || false;
  this.runId        = 'cmdt-' + new Date().getTime() + '-' + process.pid;
  this._execData    = {};
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

  function copyFixtures(testDir) {
    return function (fixtureDir, cb) {
      ncp.ncp(fixtureDir, testDir, cb);
    };
  }

  function execTests(tests, testDir, cb) {
    return function (err) {
      if (err) {
        cb(err);
      } else {
        self._exec(tests, testDir, cb);
      }
    };
  }

  function iter(file, cb) {

    reporter.emit('segment', file);
    
    test.load(file, function (err, tests, fixtures) {

      if (err) {
        cb(err);

      } else {
        var testDir = p.join(self.opts.baseDir, self.runId, file);
        mkdirp.sync(testDir);
        async.each(fixtures, copyFixtures(testDir), execTests(tests, testDir, cb));
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
 * Execute test command and validate output of each test.
 * Commands will be executed in a sandbox directory.
 *
 * @param {Array} tests: test settings
 * @param {String} testDir: test execution directory
 * @param {Function} cb: standard cb(err, result) callback
 */
Cmdt.prototype._exec = function (tests, testDir, cb) {

  this._execData = {};

  var self   = this;
  var testId = 0; // unique ID for each test within the file

  function processTest(test, cb) {

    test.dir    = testDir;
    test.execId = util.format('%d-%s', testId++, test.file);

    self._execData[test.execId] = {
      exitcode: undefined,
      output  : '',
      stdout  : '',
      stderr  : ''
    };

    var _exec = child.exec(test.command, { cwd: test.dir }, self._testCb(test, cb));

    _exec.on('exit', function (code) {
      self._execData[test.execId].exitcode = code;
    });
    _exec.stdout.on('data', function (data) {
      self._execData[test.execId].output += data;
      self._execData[test.execId].stdout += data;
    });
    _exec.stderr.on('data', function (data) {
      self._execData[test.execId].output += data;
      self._execData[test.execId].stderr += data;
    });
  }
  
  async.eachSeries(tests, processTest, cb);
};

/**
 * Create a callback function for processing each test.
 * This callback emits event to reporter depending on the existence of check error(s) .
 *
 * @param {Object} test: test setting
 * @param {Function} cb: standard cb(err, result) callback
 */
Cmdt.prototype._testCb = function (test, cb) {

  var self = this;

  return function (err) {

    var result = self._execData[test.execId];
    var errors = checker.check(result, test);

    if (errors.length === 0) {
      reporter.emit('success', test, result);
    } else {
      reporter.emit('failure', errors, test, result);
    }
    cb();
  };
};

module.exports = Cmdt;