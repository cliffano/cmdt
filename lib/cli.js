var Cmdt = require('./cmdt'),
  cli = require('bagofcli');

function _run() {

  var _arguments = arguments,
    args = [];

  Object.keys(_arguments).forEach(function (key) {
    args.push(_arguments[key]);
  });

  var cmdt = new Cmdt({ debug: args[args.length - 1].debug });
  cmdt.run(args.slice(0, args.length - 1), cli.exit);
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
