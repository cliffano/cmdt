var _      = require('lodash');
var async  = require('async');
var fs     = require('fs');
var jazz   = require('jazz');
var yamljs = require('yaml-js');

function load(file, cb) {

  var params = {};
  var tests  = [];

  var data = yamljs.load(fs.readFileSync(file).toString());
  data.forEach(function (item) {
    if (item.params) {
      params = _.extend(params, item.params);
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
    cb(err, tests);
  });
}

exports.load = load;