var colors = require('colors'),
  events = require('events'),
  util = require('util'),
  failures = [],
  successes = [];

function _segment(file) {
  console.log();
  process.stdout.write(util.format('%s ', file.grey));
}

function _success(test, output) {
  process.stdout.write('.'.green);
  successes.push({ test: test, output: output });
}

function _failure(errors, test, output) {
  process.stdout.write('.'.red);
  failures.push({ errors: errors, test: test, output: output });
}

function _end(debug) {

  var summary = util.format(
    '%d tests, %d success%s, %d failure%s',
    successes.length + failures.length,
    successes.length,
    (successes.length > 1) ? 'es' : '',
    failures.length,
    (failures.length > 1) ? 's' : '')

  console.log('');
  if (failures.length === 0) {
    console.log(summary.green);
  } else {
    console.error(summary.red);
    failures.forEach(function (failure) {
      console.log('');
      console.log(util.format('%s> %s'.grey, failure.test.file, failure.test.cmd));
      failure.errors.forEach(function (error) {
        console.error(error.red);
        if (debug) {
          console.error(failure.output.red);
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