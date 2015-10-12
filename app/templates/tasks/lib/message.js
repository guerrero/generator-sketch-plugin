var path = require('path')

var messages = function messages(taskFile) {
  var taskName = path.parse(taskFile).name

  return function _messages(type, msg, insertNewLine) {
    var insertNewLine = insertNewLine !== undefined ? insertNewLine : true
    var taskNameLabel = '[🎨  ' + taskName + ']'
    var prefix
    var suffix
    switch (type) {
      case 'INFO':
        prefix = '\0\u001b[36m' + taskNameLabel + '\u001b[39m '
        break;
      case 'SUCCESS':
        prefix = '\0\u001b[32m' + taskNameLabel + '\u001b[39m '
        break;
      case 'WARNING':
        prefix = '\0\u001b[33m' + taskNameLabel + ' WARNING: ' + '\u001b[39m'
        break;
      case 'ERROR':
        prefix = '\0\u001b[31m' + taskNameLabel + ' ERROR: ' + '\u001b[39m'
        break;
      default:
        throw new Error('Type should be one of the following strings: "INFO", "SUCCESS", "WARNING" or "ERROR".')
        break;
    }

    var formatedMessage = insertNewLine ? prefix + msg + '\n' : prefix + msg
    process.stdout.write(formatedMessage)
  }
}

module.exports = messages
