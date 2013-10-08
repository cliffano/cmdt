var Cmdt = require('./cmdt'),
  cli = require('bagofcli');

function _run() {

  var cmdt = new Cmdt(),
    args = arguments,
    values = [];

  Object.keys(args).forEach(function (key) {
    values.push(args[key]);
  });
  
  cmdt.run(values.slice(0, values.length - 1), cli.exit);
}

/**
 * Execute Cmdt CLI.
 */
function exec() {

  var actions = {
    commands: {
      run: { action: _run }
    }
  };

  cli.command(__dirname, actions);
}

exports.exec = exec;
