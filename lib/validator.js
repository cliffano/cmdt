var util = require('util');

function _code(expect, result) {
  var error;
  if (typeof expect === 'string') {
    expect = parseInt(expect, 10);
  }
  if (expect && expect !== result) {
    error = util.format('Exit code %d does not match expected %d', result, expect);
  }
  return error;
}

function _out(expect, result) {
  var error;
  if (expect && !result.match(new RegExp(expect))) {
    error = util.format('Output does not match expected regexp \'%s\'', expect);
  }
  return error;
}

function validate(test, result) {
  const TESTS = { code: _code, out: _out };
  var errors = [];

  Object.keys(TESTS).forEach(function (key) {
    var error = TESTS[key](test[key], result[key]);
    if (error) {
      errors.push(error);
    }
  });
  return errors;
}

exports.validate = validate;