'format cjs';

var wrap = require('word-wrap');
var map = require('lodash.map');
var longest = require('longest');
var chalk = require('chalk');
const { writeFileSync } = require('fs');
const { resolve } = require('path');

var filter = function (array) {
  return array.filter(function (x) {
    return x;
  });
};

var headerLength = function (answers) {
  return (
    answers.type.length + 2 + (answers.scope ? answers.scope.length + 2 : 0)
  );
};

var maxSummaryLength = function (options, answers) {
  return options.maxHeaderWidth - headerLength(answers);
};

var filterSubject = function (subject, disableSubjectLowerCase) {
  subject = subject.trim();
  if (
    !disableSubjectLowerCase &&
    subject.charAt(0).toLowerCase() !== subject.charAt(0)
  ) {
    subject =
      subject.charAt(0).toLowerCase() + subject.slice(1, subject.length);
  }
  while (subject.endsWith('.')) {
    subject = subject.slice(0, subject.length - 1);
  }
  return subject;
};

// This can be any kind of SystemJS compatible module.
// We use Commonjs here, but ES6 or AMD would do just
// fine.
module.exports = function (options) {
  var types = options.types;
  var length = longest(Object.keys(types)).length + 1;
  writeFileSync(
    resolve(__dirname, './src/shared-config.json'),
    JSON.stringify(options),
    { encoding: 'utf-8' }
  );
  var choices = map(types, function (type) {
    return {
      name: (type.title + ':').padEnd(length) + ' ' + type.description,
      value: type.title
    };
  });
  return {
    // When a user runs `git cz`, prompter will
    // be executed. We pass you cz, which currently
    // is just an instance of inquirer.js. Using
    // this you can ask questions and get answers.
    //
    // The commit callback should be executed when
    // you're ready to send back a commit template
    // to git.
    //
    // By default, we'll de-indent your commit
    // template and will keep empty lines.
    prompter: function (cz, commit) {
      // Let's ask some questions of the user
      // so that we can populate our commit
      // template.
      //
      // See inquirer.js docs for specifics.
      // You can also opt to use another input
      // collection library if you prefer.
      cz.prompt([
        {
          type: 'list',
          name: 'type',
          message: chalk.blue('本次提交在哪方面做出变动?'),
          choices: choices,
          default: options.defaultType
        },
        {
          type: 'input',
          name: 'scope',
          message: '本次提交的变更的范围是?（按回车跳过）',
          default: options.defaultScope,
          filter: function (value) {
            return options.disableScopeLowerCase
              ? value.trim()
              : value.trim().toLowerCase();
          }
        },
        {
          type: 'input',
          name: 'subject',
          message: function (answers) {
            return (
              '编写简要的变更描述（最多 ' +
              maxSummaryLength(options, answers) +
              ' 字符）：\n'
            );
          },
          default: options.defaultSubject,
          validate: function (subject, answers) {
            var filteredSubject = filterSubject(
              subject,
              options.disableSubjectLowerCase
            );
            return filteredSubject.length == 0
              ? '必须填写简要描述'
              : filteredSubject.length <= maxSummaryLength(options, answers)
              ? true
              : '简要描述的长度必须小于等于 ' +
                maxSummaryLength(options, answers) +
                ' 字符，当前长度为 ' +
                filteredSubject.length +
                ' 字符。';
          },
          transformer: function (subject, answers) {
            var filteredSubject = filterSubject(
              subject,
              options.disableSubjectLowerCase
            );
            var color =
              filteredSubject.length <= maxSummaryLength(options, answers)
                ? chalk.green
                : chalk.red;
            return color('(' + filteredSubject.length + ') ' + subject);
          },
          filter: function (subject) {
            return filterSubject(subject, options.disableSubjectLowerCase);
          }
        },
        {
          type: 'input',
          name: 'body',
          message: '提供更详细的变更描述正文：（按回车跳过）',
          default: options.defaultBody
        },
        {
          type: 'list',
          name: 'isBreaking',
          message: chalk.red('是否存在破坏性变更？'),
          choices: ['否', '是'],
          filter: function (input) {
            return input.includes('是') ? true : false;
          }
        },
        {
          type: 'input',
          name: 'breakingBody',
          default: '-',
          message: '破坏性变更的提交需要提供更详细的描述正文：\n',
          when: function (answers) {
            return answers.isBreaking && !answers.body;
          },
          validate: function (breakingBody) {
            return (
              breakingBody.trim().length > 0 ||
              chalk.red('必须填写破坏性变更的描述正文')
            );
          }
        },
        {
          type: 'input',
          name: 'breaking',
          message: '请描述破坏性变更的内容:\n',
          when: function (answers) {
            return answers.isBreaking;
          }
        },
        {
          type: 'list',
          name: 'isIssueAffected',
          message: '本次变更是否影响到未关闭的问题(issue)?',
          default: options.defaultIssues ? true : false,
          choices: ['否', '是'],
          filter: function (input) {
            return input === '是' ? true : false;
          }
        },
        {
          type: 'input',
          name: 'issuesBody',
          default: '-',
          message:
            '如果问题(issue)已关闭，则本次提交需要提供更详细的描述正文：\n',
          when: function (answers) {
            return (
              answers.isIssueAffected && !answers.body && !answers.breakingBody
            );
          }
        },
        {
          type: 'input',
          name: 'issues',
          message: '添加对问题(issue)的引用（例如“fix #123”或“re #123”）：\n',
          when: function (answers) {
            return answers.isIssueAffected;
          },
          default: options.defaultIssues ? options.defaultIssues : undefined
        }
      ]).then(function (answers) {
        var wrapOptions = {
          trim: true,
          cut: false,
          newline: '\n',
          indent: '',
          width: options.maxLineWidth
        };

        // parentheses are only needed when a scope is present
        var scope = answers.scope ? '(' + answers.scope + ')' : '';

        // Add a expolaration mark if this commit has marked as BREAKING CHANGE
        var colon = answers.isBreaking ? '!：' : '：';

        // Hard limit this line in the validate
        var head = answers.type + scope + colon + answers.subject;

        // Wrap these lines at options.maxLineWidth characters.
        // Also, fill the body with breakingBody only if the body is missing.
        var body = answers.body
          ? wrap(answers.body, wrapOptions)
          : wrap(answers.breakingBody, wrapOptions);

        // Apply breaking change prefix, removing it if already present
        var breaking = answers.breaking ? answers.breaking.trim() : '';
        breaking = breaking
          ? '破坏性更新：' + breaking.replace(/^破坏性更新：/, '')
          : '';

        breaking = breaking ? wrap(breaking, wrapOptions) : false;

        var issues = answers.issues ? wrap(answers.issues, wrapOptions) : false;

        if (options.showConfirmPrompt)
          confirmPrompt({ head, body, breaking, issues }, cz, commit);
        else commit(filter([head, body, breaking, issues]).join('\n\n'));
      });
      function confirmPrompt(parts, cz, commit) {
        const { head, body, breaking, issues } = parts;
        const message = filter([head, body, breaking, issues]).join('\n\n');
        const TITLE = ' 提交消息如下 👇 ';

        const header = insertStr(
          divider(message.length),
          message.length / 2,
          TITLE
        );
        const footer = divider(message.length + TITLE.length + 6);
        console.clear();
        console.log(chalk.green(header));
        newLine();
        console.log(`${message}`);
        newLine();
        console.log(chalk.green(footer));

        cz.prompt([
          {
            type: 'list',
            name: 'continue',
            message: chalk.yellow('确认提交本次更改？'),
            choices: ['是', '否'],
            filter: (input) => (input === '是' ? true : false)
          }
        ])
          .then((answer) => {
            if (answer.continue) return commit(message);
            else return process.exit(1);
          })
          .catch(() => {
            console.warn(
              chalk.yellow('[cz-translated-changelog-zh-cn]：取消提交')
            );
            process.exit(1);
          });
      }

      function divider(length, str = '') {
        if (str.length < length) return divider(length, str.concat('-'));
        else return str;
      }

      function insertStr(source, at, plugin) {
        return source.slice(0, at).concat(plugin).concat(source.slice(at));
      }

      function newLine() {
        return console.log('\n');
      }
    }
  };
};
