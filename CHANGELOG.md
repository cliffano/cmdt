### 0.1.1-pre
* Fix fixtures directories should be copied once per test file
* Fix test result checking, test execution data is now stored per file per command

### 0.1.0
* Add parameter support for test commands
* Cmdt no longer breaks when YAML file is empty
* Fix test command execution error propagation
* Change min node engine to >= 0.10.0
* Fix failure debug should show up before summary
* Add test execution directory to debug info
* Add stdout and stderr test fields
* Add environment variables to test commands parameters
* Add test fixtures support

### 0.0.5
* Fix sample test file on README.

### 0.0.4
* Change test file format to YAML
* Command execution error no longer results in cmdt error
* Log temporary directory on debug
* Add init command
* Use the number of test failures as cmdt exit code

### 0.0.3
* Sandbox test executions to a temporary directory
* Add description field

### 0.0.2
* Fix undefined command due to incorrect command field

### 0.0.1
* Initial version
