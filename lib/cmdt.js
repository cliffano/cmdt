var async = require('async'),
  checker = require('./checker'),
  child = require('child_process'),
  colors = require('colors'),
  fs = require('fs'),
  lazy = require('lazy'),
  mkdirp = require('mkdirp'),
  ncp = require('ncp'),
  os = require('os'),
  p = require('path'),
  reporter = require('./reporter'),
  rimraf = require('rimraf');

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
  const FIELDS = ['command', 'description', 'exitcode', 'output'];
  var runDir = p.join(this.opts.baseDir, this.runId),
    self = this;

  if (this.opts.debug) {
    console.log('Using directory: %s', runDir);
  }
  mkdirp.sync(runDir);

  function iter(file, cb) {
    var stream = fs.createReadStream(file),
      tests = [],
      test = {};

    // only add valid test, otherwise ignore (TODO: display warning???)
    function addTest(test) {
      if (test.command) {
        var temp = { file: file };
        FIELDS.forEach(function (field) {
          temp[field] = test[field];
        });
        tests.push(temp);
      }
    }

    stream.on('end', function () {
      addTest(test);
      self._exec(tests, cb);
    });

    function parse(line) {
      line = line.toString().replace(/^\s+|\s+$/g, '');

      // 0 check hack until https://github.com/pkrumins/node-lazy/issues/41 is merged
      if (line.toString() === '0' || line.toString() === '') {
        addTest(test);
        test = {};
      } else {
        FIELDS.forEach(function (field) {
          var regexp = new RegExp('^' + field + ': ');
          if (line.match(regexp)) {
            test[field] = line.replace(regexp, '');
          }
        });
      }
    }
    reporter.emit('segment', file);
    lazy(stream).lines.forEach(parse);
  }
  async.eachSeries(files, iter, function (err, results) {
    if (!err) {
      reporter.emit('end', self.opts.debug);
      if (!self.opts.debug) {
        rimraf.sync(runDir);
      }
    }
    cb(err, results);
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