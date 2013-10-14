<img align="right" src="https://raw.github.com/cliffano/cmdt/master/avatar.jpg" alt="Avatar"/>

[![Build Status](https://secure.travis-ci.org/cliffano/cmdt.png?branch=master)](http://travis-ci.org/cliffano/cmdt)
[![Dependencies Status](https://david-dm.org/cliffano/cmdt.png)](http://david-dm.org/cliffano/cmdt)
[![Published Version](https://badge.fury.io/js/cmdt.png)](http://badge.fury.io/js/cmdt)
<br/>
[![npm Badge](https://nodei.co/npm/cmdt.png)](http://npmjs.org/package/cmdt)

Cmdt
----

Cmdt is a command-line tool for testing command-line tools.

This is handy for testing a command execution result by checking its exit code and output.

Installation
------------

    npm install -g cmdt

Usage
-----

Run tests on specified .cmdt files:

    cmdt run <file1>.cmdt <file2>.cmdt

Run all .cmdt test files contained in a directory:

    cmdt run <dir>

Debug exit code and output of failing tests:

    cmdt run --debug <file>.cmdt <dir>

Configuration
-------------

Specify test command, expected exit code and/or output regular expression in a .cmdt file:

    command: whoami
    exitcode: 0
    output: someuser

    command: time
    exitcode: 0
    output: real.+user.+sys.+

    command: unknowncommand
    exitcode: 1
    output: ^some error$