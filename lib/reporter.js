var colors = require('colors'),
  events = require('events'),
  util = require('util'),
  failures = [],
  successes = [];

function _segment(file) {
  console.log();
  process.stdout.write(util.format('%s ', file));
}

function _success(test, result) {
  process.stdout.write('.'.green);
  successes.push({ test: test, result: result });
}

function _failure(errors, test, result) {
  process.stdout.write('.'.red);
  failures.push({ errors: errors, test: test, result: result });
}

function _end(debug) {

  var summary = util.format(
    '%d tests, %d success%s, %d failure%s',
    successes.length + failures.length,
    successes.length,
    (successes.length > 1) ? 'es' : '',
    failures.length,
    (failures.length > 1) ? 's' : '');

  console.log('');
  if (failures.length === 0) {
    console.log(summary.green);
  } else {
    console.error(summary.red);
    failures.forEach(function (failure) {
      console.log('');
      console.log(util.format('%s> %s', failure.test.file, failure.test.cmd));
      failure.errors.forEach(function (error) {
        console.error(error.red);
        if (debug) {
          console.error('output:\n%s'.grey, failure.result.out);
          console.error('exit code: %d'.grey, failure.result.code);
        }
      });
    });
  }

}

function Reporter() {
}
util.inherits(Reporter, events.EventEmitter);

var reporter = new Reporter();
reporter.on('segment', _segment);
reporter.on('success', _success);
reporter.on('failure', _failure);
reporter.on('end', _end);

module.exports = reporter;