# 通用的国际化方案

## 前言
试想，如果让您把公司所有的项目都支持国际化，会是一种怎么样的体验？  
这些项目新旧不一：
* 有的是 Grunt + RequireJS / Sea.js + jQuery / Zepto
* 有的是 Gulp + Browserify + Backbone / Knockout / ...
* 更多的是 Webpack `(1.x|2.x)` + React `(0.x|15.x)` / Vue.js `(0.x|1.x|2.x)` / Angular `(1.x|2.x)` / ...
* 还有的是完全没有工程化的静态页

由于技术栈极其混杂，且不可能一个一个坑去踩，因此以下这些相对主流的国际化方案都不可能采用：

* [`i18n-webpack-plugin`](https://github.com/webpack/i18n-webpack-plugin) / [`i18n-loader`](https://github.com/webpack/i18n-loader) / [`babel-plugin-i18n`](https://github.com/valscion/babel-plugin-i18n)
* [`react-intl`](https://github.com/yahoo/react-intl) / [`redux-i18n`](https://github.com/APSL/redux-i18n)
* [`vue-i18n`](https://github.com/kazupon/vue-i18n) / [`vuex-i18n`](https://github.com/dkfbasel/vuex-i18n)
* [`angular-translate`](https://github.com/angular-translate/angular-translate) / [`ng2-translate`](https://www.npmjs.com/package/ng2-translate)
* [`jquery.i18n`](https://github.com/wikimedia/jquery.i18n) / [`jquery-i18n`](https://github.com/recurser/jquery-i18n) / [`jquery-i18n-properties`](https://github.com/jquery-i18n-properties/jquery-i18n-properties)

虽说上述的所有方案都不予采用，但可以总结它们的经验，造一个更好用更通用的轮子

国际化方案大致分为两类：**编译时翻译**与**运行时翻译**，各有千秋。不过在二者的选择上，我更倾向于前者  
作为通用的国际化方案，不应受技术栈更迭的影响。**运行时翻译**强依赖于所用的框架/类库，故不符合要求

所谓的国际化，说白了就是字符串的替换，最常见的就是把整个网站所有待翻译内容都汇总起来做成翻译表：  
```
// en.json
{
  "你好": "Hello",
  "爱": "Love"
}
```

```
// jp.json
{
  "你好": "こんにちは",
  "爱": "愛"
}
```
（此处省略十几个翻译表...）

这种做法最大的缺陷在于维护困难，冗余不堪，源码中待翻译内容的任何改动都需要同步到所有的翻译表  
且由于脱离了上下文，因此校对的时候非常痛苦

***

如果没有遇见 [Vux](https://github.com/airyland/vux)（基于 Vue.js 的移动 UI 组件库） 的这个 [issue](https://github.com/airyland/vux/issues/706)，就没有本方案的诞生。它的组件国际化方案如下：

```
<i18n>
 title: 
  zh-CN: 标题
 content:
   en: content
   zh-CN: 内容
</i18n>
```
其配备的 [`vux-loader`](https://github.com/airyland/vux-loader) 可以解析 `<i18n>` 内容，来对当前组件中的待翻译内容进行替换  
这样的话就完美地解决了单独维护翻译表的问题，且由于都在同一上下文中，因此更改与校对都显得非常方便！  
`vux-loader` 之所以能这么做，主要是因为 [`vue-loader`](https://github.com/vuejs/vue-loader/) 只在乎 `<template>`、`<script>`、`<style>`，其他的都**忽略**  
这给了我很大的启发！

而且，由于前端的特殊性，线上的代码一般都需要经过压缩处理，因此我们还可以更进一步：  
** 通过注释的方式，直接在待翻译内容旁编写其译文！**

> 当然也完全可以像 `vux-loader` 那样，把一个文件中所有待翻译内容汇总到最后进行翻译

进行国际化的时候，只需要递归提取源码目录中散落的翻译表，即可获得最终的翻译表  
而且我们还能将翻译表保存下来，既满足高可维护性，又满足传统方案的整体校对需求

## 快速体验

见 `example/src/main/main1.js`：

```
/*<i18n> # YAML style
你好:
  en: Hello
  jp: こんにちは
  fr: Bonjour
</i18n>*/
console.log('_#你好#_');

// # JS object style
// <i18n>{ '热爱': { en: 'Love', jp: '熱愛', fr: 'Aimer' } }</i18n>
console.log('_#热爱#_');

/* # JSON style
<i18n>
{
  "国际": {
    "en": "International",
    "jp": "国際",
    "fr": "International"
  }
}
</i18n>*/
console.log('_#国际#_');

```

定界符 `_#` 与 `#_` 包裹的 `XXX` 为待翻译内容  
而 `<i18n>` 标签内容为其对应的翻译，可以是 YAML / JS 对象 / JSON 格式，解析出来一般是这样的：  
 `{ 'XXX': { 'en': 'XXX-en', 'jp': 'XXX-jp', 'fr': 'XXX-fr' } }`  
我们把源码中这些零散的翻译内容收集汇聚成翻译表，使用该翻译表来对**编译后**的静态资源进行整体的“翻译”，亦即：  
根据翻译表对待翻译内容进行替换，替换的结果根据翻译表的键（`en` / `jp` / `fr`）分目录进行存放

使用注释形式，在源码旁直接备注其对应的翻译。通过这样的方式来实现国际化，最大的好处是：  
自维护，毋须单独维护庞大的翻译表。任何修改都可以在上下文中一目了然，避免源码与翻译表两头兼顾的困扰  
妈妈再也不用担心我把整个语言包打包到生产环境中了

而且，这种方式与所使用的技术栈无关，前后端通用，侵入性极小，灵活度极高  
举一个实例说明：
```
function show(num) {
  console.log('_#每页显示#_' + num + '_#条记录#_');
}
/*<i18n>
每页显示: 'Show '
条记录: ' items per pages'
</i18n>*/
================================================
               Uglify + i18n ↓
================================================
function show(o){console.log("Show "+o+" items per pages")}
```

如此灵活的翻译方式，相信您会喜欢的


## 流程

我们使用 `example/` 下的这个简单的例子来说明本国际化方案的流程  

首先我们来分析一下 `package.json` 里面的 npm scripts：
```
"scripts": {
  # 删除原有的 build 目录
  "clean": "rimraf example/dist",

  # 运行 npm run build 前的预备工作
  "prebuild": "npm run clean && mkdirp example/dist/__build__",

  # 使用 html-minifier 压缩 HTML 文件，使用 Browserify 与 Uglify 合并压缩 vendor.js 与 app.js
  "build:html": "html-minifier --remove-comments --file-ext html --input-dir example/src --output-dir example/dist/__build__",
  "build:js:vendor": "browserify example/src/vendor/ -o example/dist/__build__/vendor.js",
  "build:js:app": "browserify example/src/app.js -o example/dist/__build__/app.js",
  "build": "npm run build:html && npm run build:js:vendor && npm run build:js:app",

  # 执行国际化任务
  "i18n": "node example/i18n.js",

  # 运行例子
  "example": "npm run build && npm run i18n",

  # 静态检测
  "lint": "jshint lib/"
}
```

敲下 `npm run example` 后，其实就是执行 `npm run build` 与 `npm run i18n`  

`npm run build` 是标准的构建工作流，一般是 Webpack / Grunt / Gulp 处理文件后吐出到一个目录中  
（在这里我们为了简单，仅用 npm scripts 来完成）

```
example/
  ├── dist/
  │   └── __build__/
  │       ├── app.js  ←------┐
  │       ├── index.html ←---|---┐
  │       └── vendor.js  ←---|---|---┐
  |                          |   |   |
  └── src/                   |   |   |
      ├── app.js --------┬---┘   |   |
      ├── index.html ----|-------┘   | # 打包合并压缩混淆...
      ├── main/          |           |
      │   ├── main1.js --┤           |
      │   └── main2.js --┘           |
      └── vendor/                    |
          ├── index.js ------┬-------┘
          ├── vendor1.js ----┤
          ├── vendor2.js ----┤
          └── vendor3.js ----┘
```

`npm run i18n` 就是对上述 `example/dist/__build__/` 目录下的所有静态资源进行翻译  
对应的命令是 `node example/i18n.js`，因此我们来看看 `i18n.js` 里面是什么：

```
var path = require('path'),
  i18n = require('../');

i18n({
  srcDir: path.join(__dirname, 'src'),
  buildDir: path.join(__dirname, 'dist/__build__'),
  distDir: path.join(__dirname, 'dist'),
  sourceLang: 'zh-cn',
  defaultLang: 'en',
  saveLocalesTo: path.join(__dirname, 'dist/locales.json')
});
```

这里要着重解释一下 `srcDir` / `buildDir` / `distDir` 的含义：
* `srcDir`，源码目录，用于提取翻译表
* `buildDir`，构建工具将源码**编译后**，所生成静态文件的存放目录  
* `distDir`，我们的 `i18n` 工具将 `buildDir` 内所有静态资源翻译后所生成文件的存放处

还有就是 `sourceLang` 与 `defaultLang` 的区别：
* `sourceLang`，源语言，即 `_#XXX#_` 直接生成 `XXX`，无需翻译
* `defaultLang`，默认翻译语言，即 `<i18n>{ 'XXX': 'XXX-default' }</i18n>` 等同于 `<i18n>{ 'XXX': { [defaultLang]: 'XXX-default' } }</i18n>`（应用见 `example/src/vendor/vendor1.js`）

> `defaultLang` 适用于仅提供两种语言版本的应用场景

最后就是 `saveLocalesTo`，即翻译表的保存路径，用于人工核对翻译，且有利于提高处理效率  
皆因我们的 `i18n` 工具的调用方式实际上为 `i18n(<config>, <locales?>)`，其中 `locales` 参数可选  
若提供该参数，则直接使用该翻译表而非重新遍历 `srcDir` 提取  
对于待翻译内容不常更改的项目而言，此举可减少一些编译耗时

`npm run i18n` 后的第一步就是从 `srcDir` 中提取出所有 `<i18n>` 标签的内容进行解析并合并：
```
"i18nContent": {
  "欢迎": {
    "en": "Welcom",
    "jp": "歓迎",
    "fr": "Bienvenue"
  },
  "语言 - 中文": {
    "en": "Language - English",
    "jp": "言語 - 日本語",
    "fr": "Langue - Français"
  },
  "你好": {
    "en": "Hello",
    "jp": "こんにちは",
    "fr": "Bonjour"
  },
  "热爱": {
    "en": "Love",
    "jp": "熱愛",
    "fr": "Aimer"
  },
  "国际": {
    "en": "International",
    "jp": "国際",
    "fr": "International"
  },
  "中国": {
    "en": "China,",
    "jp": "中国,",
    "fr": "Chine"
  },
  "苹果": {
    "en": "Apple",
    "jp": "リンゴ",
    "fr": "Pommes"
  },
  "好的": {
    "en": "Well"
  },
  "时间": {
    "en": "Time",
    "jp": "時間",
    "fr": "Le temps"
  }
}
```

随后将上述内容转换成翻译表：
```
"locales": {
  "en": {
    "欢迎": "Welcom",
    "语言 - 中文": "Language - English",
    "你好": "Hello",
    "热爱": "Love",
    "国际": "International",
    "中国": "China,",
    "苹果": "Apple",
    "好的": "Well",
    "时间": "Time"
  },
  "jp": {
    "欢迎": "歓迎",
    "语言 - 中文": "言語 - 日本語",
    "你好": "こんにちは",
    "热爱": "熱愛",
    "国际": "国際",
    "中国": "中国,",
    "苹果": "リンゴ",
    "时间": "時間"
  },
  "fr": {
    "欢迎": "Bienvenue",
    "语言 - 中文": "Langue - Français",
    "你好": "Bonjour",
    "热爱": "Aimer",
    "国际": "International",
    "中国": "Chine",
    "苹果": "Pommes",
    "时间": "Le temps"
  },
  "zh-cn": {}
}
```
由于 `sourceLang` 设置为 `zh-cn`，因此 `locales['zh-cn']` 为空，表示不翻译  
当然还有 `locales.jp` 与 `locales.fr` 都缺少 `好的` 的译文，因此也是不翻译

最后，就是根据翻译表对 `example/dist/__build__/` 进行翻译，最终生成：
```
example/dist/
  ├── __build__/
  │   ├── app.js
  │   ├── index.html
  │   └── vendor.js
  ├── en/            # defaultLang
  │   ├── app.js
  │   ├── index.html
  │   └── vendor.js
  ├── fr/
  │   ├── app.js
  │   ├── index.html
  │   └── vendor.js
  ├── jp/
  │   ├── app.js
  │   ├── index.html
  │   └── vendor.js
  ├── zh-cn/         # sourceLang
  |   ├── app.js
  |   ├── index.html
  |   └── vendor.js
  └── locales.json   # `saveLocalesTo` here
```

流程图：

```
        recursive-readdir-sync
srcDir ─────────────────────────┐
  |                             ↓
  |               for file in files:                  >_ npm run i18n
  |                 extract-i18n-content(file)
  |                             |
  |                             ↓        i18n-content2locales
  |                         i18nContent ──────────────────────┐
  |                                                           ↓          ┌  en   ┐
  | >_ npm run build                                        locales      |  fr   |
  └------------------------------------------→ buildDir ─────────────────┤  jp   ├→ distDir
           Webpack / Gulp / Grunt ...                     gulp-replace   └ zh-cn ┘
```

# 配置
locales 可以自己提供
兼容旧项目

Webpack 需要使用 replace-loader 来进行替换

# 注意事项

/**
 * <i18n>
 * 报错！中间的星星也算！
 * </i18n>
 */

国际化方案一般是最后才做的，而不是一开始就侵入

为什么需要定界符？因为很重要

ES6 模板字符串压缩后变成...
卖广告