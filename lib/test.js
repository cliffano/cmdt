var _      = require('lodash');
var async  = require('async');
var fs     = require('fs');
var jazz   = require('jazz');
var yamljs = require('yaml-js');

/**
 * Load a test YAML file.
 *
 * @param {String} file: test file
 * @param {Function} cb: standard cb(err, result) callback
 */
function load(file, cb) {

  var params   = { _env: process.env };
  var fixtures = [];
  var tests    = [];

  var data = yamljs.load(fs.readFileSync(file).toString()) || [];
  data.forEach(function (item) {
    if (item.params) {
      params = _.extend(params, item.params);
    } else if (item.fixtures) {
      fixtures = fixtures.concat(item.fixtures);
    } else {
      tests.push(item);
    }
  });

  function iter(test, cb) {

    test.file = file;

    jazz.compile(test.command).process(params, function (data) {
      test.command = data;
      cb();
    });
  }

  async.each(tests, iter, function (err, results) {
    cb(err, tests, fixtures);
  });
}

exports.load = load;