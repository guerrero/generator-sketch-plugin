'use strict'

var generators = require('yeoman-generator')
var _s = require('underscore.string')
var path = require('path')
var merge = require('lodash').merge

module.exports = generators.Base.extend({
  constructor: function() {
    generators.Base.apply(this, arguments)
  },
  initializing: function() {
    this.props = {
      authorName: this.user.git.name(),
      authorEmail: this.user.git.email(),
      dotfiles: [
        'editorconfig',
        'gitattributes'
      ]
    }
  },
  prompting: function() {
    var done = this.async()

    var promptQuestions = [{
      name: 'pluginName',
      message: 'Plugin\'s name'
    }, {
      name: 'pluginDescription',
      message: 'Plugin\'s description',
      default: ''
    }, {
      name: 'pluginShortcut',
      message: 'What shortcut do you want to use for this plugin?',
      default: '',
      validate: validateShortcut
    }, {
      name: 'githubAccount',
      message: 'What is your GitHub username?',
      store: true,
      validate: validateGithubAccount
    }, {
      name: 'authorName',
      message: 'Author\'s name',
      store: true,
      when: !this.props.authorName
    }, {
      name: 'authorEmail',
      message: 'Author\'s email',
      store: true,
      when: !this.props.authorEmail
    }]

    this.prompt(promptQuestions, function(props) {
      this.props = merge(this.props, props)

      this.props.compactedPluginName = _s.slugify(this.props.pluginName).replace(/\-/g, '')
      this.props.pluginIdentifier =
        'com.' +
        this.props.githubAccount +
        '.sketch.' +
        this.props.compactedPluginName

      done()
    }.bind(this))
  },
  writing: function() {
    var done = this.async()
    var self = this

    this.fs.copyTpl(this.templatePath('*'), this.destinationPath(), this.props)
    this.fs.copyTpl(this.templatePath('plugin.sketchplugin'), this.destinationPath(this.props.pluginName + '.sketchplugin'), this.props)
    this.fs.copyTpl(this.templatePath('tasks/**'), this.destinationPath('tasks/'), this.props)

    prefixDotfiles(this.props.dotfiles, self)

    done()
  }
})

function prefixDotfiles(files, context) {
  files.forEach(function(file) {
    var filePath = context.destinationPath(file)
    var dirname = path.dirname(filePath)
    var basename = path.basename(filePath)

    context.fs.move(path.join(dirname, basename), path.join(dirname, '.' + basename))
  })
}

function validateGithubAccount(value) {
  return value.length > 0 ? true : 'You have to provide a username'
}

function validateShortcut(value) {
  var shortcutRegExp = /^(?:(?!(?:.*ctrl){2})(?!(?:.*cmd){2})(?!(?:.*shift){2})(ctrl|cmd|shift)\s)*[a-z0-9]$/
  return shortcutRegExp.test(value) ? true : 'You have to provide a valid shortcut. Example: cmd a'
}
