var async = require('async'),
  child = require('child_process'),
  colors = require('colors'),
  fs = require('fs'),
  lazy = require('lazy'),
  reporter = require('./reporter'),
  validator = require('./validator');

/**
 * class Cmdt
 */
function Cmdt(opts) {
  this.opts = opts || { debug: false };
}

/**
 * Parse .cmdt test files and run all tests.
 *
 * @param {Array} files: test files to run
 * @param {Function} cb: standard cb(err, result) callback
 */
Cmdt.prototype.run = function (files, cb) {
  const PREFIXES = ['cmd', 'code', 'out'];
  var self = this;

  function iter(file, cb) {
    var stream = fs.createReadStream(file),
      tests = [],
      test = {};

    stream.on('end', function () {
      tests.push(test);
      self._exec(tests, cb);
    });

    function parse(line) {
      line = line.toString().replace(/^\s+|\s+$/g, '');

      // 0 check hack until https://github.com/pkrumins/node-lazy/issues/41 is merged
      if (line.toString() === '0' || line.toString() === '') {
        tests.push(test);
        test = {};
      } else {
        PREFIXES.forEach(function (prefix) {
          var regexp = new RegExp('^' + prefix + ': ');
          if (line.match(regexp)) {
            test[prefix] = line.replace(regexp, '');
          }
        });
        test.file = file;
      }
    }
    reporter.emit('segment', file);
    lazy(stream).lines.forEach(parse);
  }
  async.eachSeries(files, iter, function (err, results) {
    reporter.emit('end', self.opts.debug);
    cb(err, results);
  });
};

/**
 * Execute command and validate output of each test.
 *
 * @param {Array} tests: test settings
 * @param {Function} cb: standard cb(err, result) callback
 */
Cmdt.prototype._exec = function (tests, cb) {
  var self = this,
    exitCode;

  function iter(test, cb) {
    var output = '',
      _exec = child.exec(test.cmd, function (err, result) {
        var errors = validator.validate(test, { code: exitCode, out: result});
        if (errors.length === 0) {
          reporter.emit('success', test, output);
        } else {
          reporter.emit('failure', errors, test, output);
        }
        cb(null, result);
      });

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