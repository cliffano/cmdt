var util = require('util');

/**
 * Check result exit code against expectated exit code.
 *
 * @param {Object} result: command execution result
 * @param {Object} test: test expectation
 * @return {Object} error if actual exit code doesn't equal expected exit code
 */
function _checkExitCode(result, test) {

  var actual = result.exitcode;
  var expect = test.exitcode;
  var error;

  if (typeof expect === 'string') {
    expect = parseInt(expect, 10);
  }

  if (expect !== undefined && expect !== actual) {
    error = util.format('Exit code %d does not match expected %d', actual, expect);
  }

  return error;
}

/**
 * Check result output against expectated output.
 *
 * @param {Object} result: command execution result
 * @param {Object} test: test expectation
 * @return {Object} error if actual output doesn't match expected regexp pattern
 */
function _checkOutput(result, test) {
  return __checkRegExp(result, test, 'output', 'Output');
}

/**
 * Check result stdout against expectated stdout.
 *
 * @param {Object} result: command execution result
 * @param {Object} test: test expectation
 * @return {Object} error if actual stdout doesn't match expected regexp pattern
 */
function _checkStdout(result, test) {
  return __checkRegExp(result, test, 'stdout', 'Stdout');
}

/**
 * Check result stderr against expectated stderr.
 *
 * @param {Object} result: command execution result
 * @param {Object} test: test expectation
 * @return {Object} error if actual stderr doesn't match expected regexp pattern
 */
function _checkStderr(result, test) {
  return __checkRegExp(result, test, 'stderr', 'Stderr');
}

function __checkRegExp(result, test, field, label) {

  var actual = result[field];
  var expect = test[field];
  var error;

  if (expect !== undefined && !actual.match(new RegExp(expect))) {
    error = util.format('%s: \'%s\' does not match expected regexp \'%s\'', label, actual, expect);
  }

  return error;
}

/**
 * Check command execution result with test expectation against a set of check functions.
 *
 * @param {Object} result: command execution result
 * @param {Object} test: test expectation
 * @return {Array} check errors
 */
function check(result, test) {

  const CHECKERS = [ _checkExitCode, _checkOutput, _checkStdout, _checkStderr ];
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
