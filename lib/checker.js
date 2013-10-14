var util = require('util');

/**
 * Check result exit code against expectated exit code.
 *
 * @param {Object} result: command execution result (exitcode, output)
 * @param {Object} test: test expectation (exitcode, output)
 * @return {Object} error if actual exit code doesn't equal expected exit code
 */
function _checkExitCode(result, test) {
  var actual = result.exitcode,
    expect = test.exitcode,
    error;
  if (typeof expect === 'string') {
    expect = parseInt(expect, 10);
  }
  if (expect && expect !== actual) {
    error = util.format('Exit code %d does not match expected %d', actual, expect);
  }
  return error;
}

/**
 * Check result output against expectated output.
 *
 * @param {Object} result: command execution result (exitcode, output)
 * @param {Object} test: test expectation (exitcode, output)
 * @return {Object} error if actual exit code doesn't match expected regexp pattern
 */
function _checkOutput(result, test) {
  var actual = result.output,
    expect = test.output,
    error;
  if (expect && !actual.match(new RegExp(expect))) {
    error = util.format('Output does not match expected regexp \'%s\'', expect);
  }
  return error;
}

/**
 * Check command execution result with test expectation against a set of check functions.
 *
 * @param {Object} result: command execution result (exitcode, output)
 * @param {Object} test: test expectation (exitcode, output)
 * @return {Array} check errors
 */
function check(result, test) {
  const CHECKERS = [ _checkExitCode, _checkOutput ];
  var errors = [];

  CHECKERS.forEach(function (checker) {
    var error = checker(result, test);
    if (error) {
      errors.push(error);
    }
  });
  return errors;
}

exports.check = check;