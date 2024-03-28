# cz-translated-changelog-zh-cn

> [!TIP]
> cz-conventional-changelog 的简体中文翻译

[![npm version](https://img.shields.io/npm/v/@cz-translated-changelog/zh-cn.svg?style=flat-square)](https://www.npmjs.com/package/@cz-translated-changelog/zh-cn) [![npm downloads](https://img.shields.io/npm/dm/@cz-translated-changelog/zh-cn.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@cz-translated-changelog/zh-cn&from=2024-03-16)

## 规范

参考：[约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/)

使用英文 `!`标记破坏性更新，使用中文 `：`

## 演示

![演示](https://raw.githubusercontent.com/polarove/cz-translated-changelog/master/assets/zh-cn/prompt-demo.gif)

## 新增功能

🚀 一个确认提交消息的窗口期

![新功能](https://raw.githubusercontent.com/polarove/cz-translated-changelog/master/assets/zh-cn/confirm-prompt.png)

✨ 在 commit message 中使用 `!` 来标记破坏性更新

![新功能](https://raw.githubusercontent.com/polarove/cz-translated-changelog/master/assets/zh-cn/exclamation-mark.png)

## 立刻上手

> [!NOTE]
> 安装前，请确认你已经安装了 [commitizen](https://github.com/commitizen/cz-cli)

**安装为项目开发依赖**

```sh
npm i @cz-translated-changelog/zh-cn -D
```

修改项目的 `package.json` 文件，将下面的 config 键复制进去

```json
{
  "config": {
    "commitizen": {
      "showConfirmPrompt": true,
      "path": "node_modules/@cz-translated-changelog/zh-cn"
    }
  }
}
```

**或者全局使用**

```sh [npm]
commitizen init @cz-translated-changelog/zh-cn --save-dev --save-exact
```

修改项目的 `package.json` 文件，将下面的 config 键复制进去

```json
{
  "config": {
    "commitizen": {
      "showConfirmPrompt": true,
      "path": "@cz-translated-changelog/zh-cn"
    }
  }
}
```

`showConfirmPrompt` 控制是否弹出确认提交消息，以便你检查提交消息

## 环境变量

以下环境变量可用于覆盖任何默认配置，包括 `package.json`的配置

- CZ_TYPE = defaultType
- CZ_SCOPE = defaultScope
- CZ_SUBJECT = defaultSubject
- CZ_BODY = defaultBody
- CZ_MAX_HEADER_WIDTH = maxHeaderWidth
- CZ_MAX_LINE_WIDTH = maxLineWidth

## Commitlint

如果使用[commitlint](https://github.com/conventional-changelog/commitlint) js 库, “maxHeaderWidth”配置属性将默认为“header-max-length”规则的配置，而不是硬编码的值 100。这可以通过在`package.json`中设置“maxHeaderWidth”，或添加 CZ_MAX_HEADER_WIDTH 环境变量。
