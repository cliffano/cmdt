var Cmdt = require('./cmdt'),
  cli = require('bagofcli');

function _init() {
  console.log('Creating example test files');
  new Cmdt().init(cli.exit);
}

function _run() {

  var _arguments = arguments,
    args = [];

  Object.keys(_arguments).forEach(function (key) {
    args.push(_arguments[key]);
  });

  var config = args[args.length - 1],
    cmdt = new Cmdt({ debug: config.debug, baseDir: config.baseDir }),
    files = cli.files(args.slice(0, args.length - 1), { match: '.+.cmdt$' });
  cmdt.run(files, cli.exit);
}

/**
 * Execute Cmdt CLI.
 */
function exec() {

  var actions = {
    commands: {
      init: { action: _init },
      run: { action: _run }
    }
  };

  cli.command(__dirname, actions);
}

exports.exec = exec;
