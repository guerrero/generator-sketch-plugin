'use strict'

var fs = require('fs')
var path = require('path')

var rootDir = path.resolve(__dirname, '..')
var errorMessages = []
var regex = {
  pluginScript: /.cocoascript$/,
  commandHandler: /\/\*\*[\s\S]*?\*\/[\n\s]+(?:var\s+(on.*?)\s*=\s*function\(context\))/g,
  commandShortcut: /(?:@shortcut\s+)(.*?)\n/
}

var plugins = findFilesInDirByExtension(rootDir, '.sketchplugin')

plugins.forEach(function(plugin) {
  var pluginDir = path.resolve(__dirname, '../' + plugin + '/Contents/Sketch')
  var pluginFiles = fs.readdirSync(pluginDir)
  var manifest

  if (pluginFiles.indexOf('manifest.json') !== -1) {
    var manifest = getManifest(pluginDir)
    manifest.commands = []
    if (manifest.menu) {
      manifest.menu.items = []
    } else {
      manifest.menu = {
        isRoot: true,
        items: []
      }
    }

    var scripts = findFilesInDirByExtension(pluginDir, '.cocoascript')

    scripts.forEach(function(script, index) {
      var scriptMenuItem = {
        title: script.replace('.cocoascript', ''),
        items: []
      }

      fs.readFile(path.join(pluginDir, script), function(err, data) {
        if (err) {
          throw err
        }

        var match
        do {
          match = regex.commandHandler.exec(data)
          if (match) {
            var commandHandler = match[1]
            var commandName = getCommandNameFromHandler(commandHandler)
            var pluginCmd = {
              name: commandName,
              identifier: commandName.replace(/ /g, '').toLowerCase(),
              shortcut: checkForValidShortcut(match, script) || '',
              handler: commandHandler,
              script: script
            }

            manifest.commands.push(pluginCmd)
            scriptMenuItem.items.push(pluginCmd.identifier)
          }
        } while (match)

        manifest.menu.isRoot = true
        manifest.menu.items.push(scriptMenuItem)

        if (index === scripts.length - 1) {
          writeManifestFile(pluginDir, manifest)
        }
      })
    })
  } else {
    console.log('Error: no manifest message')
  }
})

function filterByRegExp(arr, regexp) {
  return arr.filter(RegExp.prototype.test.bind(regexp))
}

function errorMessage(message) {
  var errorPrefix = '\0\u001b[31mERROR: '
  var errorSuffix = '\u001b[39m'

  return errorPrefix + message + errorSuffix
}

function findFilesInDirByExtension(directory, extension) {
  var dir = path.resolve(__dirname, directory)
  var extensionRegExp = new RegExp(extension + '$')

  return filterByRegExp(fs.readdirSync(dir), extensionRegExp)
}

function getManifest(pluginDir) {
  try {
    return require(path.join(pluginDir, 'manifest.json'))
  } catch (e) {
    console.log(errorMessage(
      'Unable to parse ' +
      path.join(pluginDir, 'manifest.json') +
      '. There should be an error in its JSON syntax.'
      ))
    process.exit(1)
  }
}

function getCommandNameFromHandler(handler) {
  return handler
    .substr(2)
    .replace(/WithArguments/, '…')
    .replace(/([a-z](?=[A-Z0-9]))/g, '$1 ')
}

function reportErrorInShortcut(shortcut, handler, script) {
  var messageInfo = ['`', shortcut, '` is not a valid shortcut for `', handler, '` handler in `', script, '` file'].join('')
  var message = errorMessage(messageInfo)

  errorMessages.push(message)
}

function checkForValidShortcut(regExpMatch, script) {
  var shortcutMatch = regex.commandShortcut.exec(regExpMatch[0])

  if (shortcutMatch) {
    var shortcutValidationRegExp = /^(?:(?!(?:.*ctrl){2})(?!(?:.*cmd){2})(?!(?:.*shift){2})(ctrl|cmd|shift)\s)*[a-z0-9]$/
    var shortcut = shortcutMatch[1]

    if (shortcutValidationRegExp.test(shortcut)) {
      return shortcut
    }

    return reportErrorInShortcut(shortcut, regExpMatch[1], script)
  }
}

function writeManifestFile(directory, input) {
  var outputPath = path.join(directory, 'manifest.json')
  if (errorMessages.length === 0) {
    fs.writeFileSync(outputPath, JSON.stringify(input, null, '  '))
  } else {
    errorMessages.forEach(function(message) {
      console.log(message)
    })
  }
}
