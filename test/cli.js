var buster = require('buster-node'),
  referee = require('referee'),
  assert = referee.assert;

buster.testCase('cli - exec', {
  'should foo then bar': function () {
    assert.equals(1, 1);
  }
});