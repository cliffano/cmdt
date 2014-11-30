<img align="right" src="https://raw.github.com/cliffano/cmdt/master/avatar.jpg" alt="Avatar"/>

[![Build Status](https://secure.travis-ci.org/cliffano/cmdt.png?branch=master)](http://travis-ci.org/cliffano/cmdt)
[![Dependencies Status](https://david-dm.org/cliffano/cmdt.png)](http://david-dm.org/cliffano/cmdt)
[![Coverage Status](https://coveralls.io/repos/cliffano/cmdt/badge.png?branch=master)](https://coveralls.io/r/cliffano/cmdt?branch=master)
[![Published Version](https://badge.fury.io/js/cmdt.png)](http://badge.fury.io/js/cmdt)
<br/>
[![npm Badge](https://nodei.co/npm/cmdt.png)](http://npmjs.org/package/cmdt)

Cmdt
----

Cmdt is a command-line tool for testing command-line tools.

This is handy for testing a command line execution result by checking its exit code and output. Commands will be executed in a temporary directory /tmp/cmdt-<millis>-<pid>/<filepath> , this directory will be removed after all tests are completed unless -d/--debug flag is specified.

Installation
------------

    npm install -g cmdt

Usage
-----

Run tests on specified test files:

    cmdt run <file1>.yml <file2>.yml

Run all test files contained in a directory:

    cmdt run <dir>

Debug exit code and output of failing tests, temporary directory will be logged and won't be removed at the end of the execution:

    cmdt run --debug <file>.yml <dir>

Test File
---------

Set test command, expected exit code and/or output regular expression in a .yml file:

    - description: should display user name
      command: whoami
      exitcode: 0
      output: someuser

    - command: time
      exitcode: 0
      output: real.+(\r\n?|\n)user.+
      stdout: real.+(\r\n?|\n)user.+

    - command: unknowncommand
      exitcode: 1
      stderr: ^some error$

Parameters can also be specified, and used in test command:

    - params:
        first_name: 'Theodore'
        last_name: 'Twombly'
        url: 'http://localhost'

    - command: 'echo "Hey {first_name} {last_name}!"'
      exitcode: 0
      output: 'echo "Hey Theodore Twombly!"'

    - command: 'wget {url}'
      exitcode: 0

Environment variables are available as _env parameter in test commands:

    NAME="Theodore Twombly" cmdt run <file>.yml <dir>

    - command: 'echo "Hello {_env.NAME}!"'
      exitcode: 0
      output: 'echo "Hello Theodore Twombly!"'

Test fixtures files and directories can be specified in fixtures array, which will then be copied to test execution directory:

    # assuming path/to/data_dir/foobar.txt and path/to/another_dir/barfoo.txt exist
    - fixtures:
      - path/to/data_dir
      - path/to/another_dir/barfoo.txt

    - command: 'file foobar.txt'
      exitcode: 0

    - command: 'file barfoo.txt'
      exitcode: 0

Test Fields
-----------

<table>
  <tr>
    <th>Name</th>
    <th>Description</th>
    <th>Mandatory</th>
  </tr>
  <tr>
    <td>description</td>
    <td>description of the test</td>
    <td>No</td>
  </tr>
  <tr>
    <td>command</td>
    <td>command line to be executed</td>
    <td>Yes</td>    
  </tr>
  <tr>
    <td>exitcode</td>
    <td>expected exit code</td>
    <td>No</td>
  </tr>
  <tr>
    <td>output</td>
    <td>stdout + stderr output, regexp matching</td>
    <td>No</td>
  </tr>
  <tr>
    <td>stdout</td>
    <td>stdout only output, regexp matching</td>
    <td>No</td>
  </tr>
  <tr>
    <td>stderr</td>
    <td>stderr only output, regexp matching</td>
    <td>No</td>
  </tr>
</table>

Screenshots
-----------

![Success with directory arg screenshot](../master/screenshots/success-dir.jpg?raw=true)
![Failure with file arg on debug mode screenshot](../master/screenshots/failure-file-debug.jpg?raw=true)

Colophon
--------

[Developer's Guide](http://cliffano.github.io/developers_guide.html#nodejs)

Build reports:

* [Code complexity report](http://cliffano.github.io/cmdt/bob/complexity/plato/index.html)
* [Unit tests report](http://cliffano.github.io/cmdt/bob/test/buster.out)
* [Test coverage report](http://cliffano.github.io/cmdt/bob/coverage/buster-istanbul/lcov-report/lib/index.html)
* [Integration tests report](http://cliffano.github.io/cmdt/bob/test-integration/cmdt.out)
* [API Documentation](http://cliffano.github.io/cmdt/bob/doc/dox-foundation/index.html)