var colors    = require('colors');
var events    = require('events');
var util      = require('util');
var failures  = [];
var successes = [];

/**
 * Segment event handler, log a new line and test file name.
 *
 * @param {String} file: test file name
 */
function _segment(file) {
  console.log();
  process.stdout.write(util.format('%s ', file));
}

/**
 * Success event handler, displays a green dot and register success.
 *
 * @param {Object} test: test expectation (exitcode, output)
 * @param {Object} result: command execution result (exitcode, output)
 */
function _success(test, result) {
  process.stdout.write('.'.green);
  successes.push({ test: test, result: result });
}

/**
 * Failure event handler, displays a red dot and register failure.
 *
 * @param {Array} check errors
 * @param {Object} test: test expectation (exitcode, output)
 * @param {Object} result: command execution result (exitcode, output)
 */
function _failure(errors, test, result) {
  process.stdout.write('.'.red);
  failures.push({ errors: errors, test: test, result: result });
}

/**
 * End event handler, displays test summary and optional debug message.
 *
 * @param {Boolean} debug: if true, displays result output and exit code
 */
function _end(debug) {

  const DEBUG_FIELDS = ['exitcode', 'output', 'stdout', 'stderr'];

  var summary = util.format(
    '%d test%s, %d success%s, %d failure%s',
    successes.length + failures.length,
    (successes.length + failures.length > 1) ? 's' : '',
    successes.length,
    (successes.length > 1) ? 'es' : '',
    failures.length,
    (failures.length > 1) ? 's' : ''
  );

  console.log('');

  if (failures.length === 0) {
    console.log(summary.green);

  } else {

    failures.forEach(function (failure) {
      console.error(util.format('' +
          '\n----------------' +
          '\n%s%s' +
          '\n%s',
        failure.test.description ? failure.test.description + '\n' : '',
        failure.test.file.cyan,
        failure.test.command));

      failure.errors.forEach(function (error) {
        console.error(error.red);
      });

      if (debug) {
        console.error('exec dir: %s\n'.grey, failure.test.dir);

        DEBUG_FIELDS.forEach(function (field) {
          if (failure.test[field]) {
            console.error('%s: %s\n'.grey, field, failure.result[field]);
          }
        });
      }
    });

    console.error(summary.red);
  }

}

/**
 * Dir event handler, displays directory on debug
 *
 * @param {Boolean} debug: if true, displays result output and exit code
 * @param {String} dir: directory name to display
 */
function _dir(debug, dir) {
  if (debug) {
    console.log('Using directory: %s'.grey, dir);
  }
}

/**
 * class Reporter
 * An event emitter handling segment, success, failure, and end events.
 */
function Reporter() {
}
util.inherits(Reporter, events.EventEmitter);

var reporter = new Reporter();
reporter.on('segment', _segment);
reporter.on('success', _success);
reporter.on('failure', _failure);
reporter.on('end', _end);
reporter.on('dir', _dir);
reporter.successes = successes;
reporter.failures  = failures;

module.exports = reporter;