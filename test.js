'use strict'
var path = require('path')
var helpers = require('yeoman-generator').test
var assert = require('yeoman-assert')

describe('generator', function() {
  beforeEach(function(done) {
    var deps = ['../app']

    helpers.testDirectory(path.join(__dirname, 'temp'), function(err) {
      if (err) {
        done(err)
        return
      }

      this.generator = helpers.createGenerator('sketch-plugin:app', deps, null, {skipInstall: true})
      done()
    }.bind(this))
  })

  it('generates expected files', function(done) {
    var expected = [
      '.editorconfig',
      '.gitattributes',
      'LICENSE',
      'README.md',
      'package.json',
      'tasks/manifest-update.js',
      'My awesome plugin.sketchplugin/Contents/Sketch/manifest.json',
      'My awesome plugin.sketchplugin/Contents/Sketch/script.cocoascript'
    ]

    helpers.mockPrompt(this.generator, {
      pluginName: 'My awesome plugin',
      githubUsername: 'test',
      pluginDescription: 'Is a test',
      githubAccount: 'test',
      pluginShortcut: 'cmd a'
    })

    this.generator.run(function() {
      assert.file(expected)
      done()
    })
  })
})
