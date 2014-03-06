var Cmdt = require('./cmdt');
var cli = require('bagofcli');

function _init() {
  console.log('Creating sample test files');
  new Cmdt().init(cli.exit);
}

function _run() {

  var _arguments = arguments;
  var args       = [];

  Object.keys(_arguments).forEach(function (key) {
    args.push(_arguments[key]);
  });

  var config = args[args.length - 1];
  var cmdt   = new Cmdt({ debug: config.debug, baseDir: config.baseDir });
  var files  = cli.files(args.slice(0, args.length - 1), { match: '.+.yml$' });

  cmdt.run(files, cli.exitCb(null, function (results) {
    process.exit(results.failures.length);
  }));
}

/**
 * Execute Cmdt CLI.
 */
function exec() {

  var actions = {
    commands: {
      init: { action: _init },
      run : { action: _run }
    }
  };

  cli.command(__dirname, actions);
}

exports.exec = exec;