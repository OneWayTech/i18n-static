# 通用的静态资源国际化方案

> Intellectual property of [OneWay](https://www.oneway.mobi)  
> 强烈建议 Chrome 用户安装 [Octotree](https://chrome.google.com/webstore/detail/octotree/bkhaagjahfmjljalopjnoealnfndnagc)、[Octo Mate](https://chrome.google.com/webstore/detail/octo-mate/baggcehellihkglakjnmnhpnjmkbmpkf?utm_source=chrome-app-launcher-info-dialog)、[OctoLinker](https://chrome.google.com/webstore/detail/octolinker/jlmafbaeoofdegohdhinkhilhclaklkp) 插件以提高阅读体验

## § 快速体验
定界符 `_#` 与 `#_` 包裹的 `XXX` 为**待翻译内容**，而 `<i18n>` 内容为其对应的**译文**（支持 YAML / JS 对象 / JSON 三种格式）：

```js
function show(num) {
  console.log('_#每页显示#_' + num + '_#条记录#_');
}
/*<i18n>
每页显示: 'Show '
条记录: ' items per page'
</i18n>*/
-----------------------------------------------
                 Uglify + i18n ↓
-----------------------------------------------
function show(o){console.log("Show "+o+" items per pages")}
```

> **待翻译内容** 和 **译文** 的定界符都是可配置的

## § 灵感来源
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

所谓的国际化，说白了就是字符串的替换，最常见的就是把整个网站所有待翻译内容都**汇总**起来做成翻译表：

```json
// en.json
{
  "你好": "Hello",
  "爱": "Love"
}
```

```json
// jp.json
{
  "你好": "こんにちは",
  "爱": "愛"
}
```
（此处省略十几个翻译表...）

这种做法最大的缺陷在于维护困难，冗余不堪，源码中待翻译内容的任何改动都需要**同步**到所有的翻译表  
且由于脱离了**上下文**，因此**校对**的时候非常痛苦

***

如果没有遇见 [Vux](https://github.com/airyland/vux)（基于 Vue.js 的移动 UI 组件库） 的这个 [issue](https://github.com/airyland/vux/issues/706)，就没有本方案的诞生。它的组件国际化方案如下：

```html
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
`vux-loader` 之所以能这么做，是因为 [`vue-loader`](https://github.com/vuejs/vue-loader/) 只在乎 `<template>`、`<script>`、`<style>`，其他的都**忽略**  
这给了我很大的启发！

由于前端的特殊性，线上的代码一般都需要经过压缩处理，因此我们还可以更进一步：  
**通过注释的方式，直接在待翻译内容旁编写其译文！**

> 当然也完全可以像 `vux-loader` 那样，把一个文件中所有待翻译内容集中到最后进行翻译

进行国际化的时候，只需要提取源码目录中散落的翻译表，即可获得最终的翻译表  
我们还能将翻译表保存下来，既满足高可维护性，又满足传统方案的**整体校对**需求

## § 流程详解
我们使用 [`example/`](./example) 下的这个简单的例子来说明本国际化方案的流程  

首先我们来分析一下 [`package.json`](./package.json) 里面的 `npm scripts`：

```
"scripts": {
  # 删除原有的 build 目录
  "clean": "rimraf example/dist",

  # 运行 npm run build 前的预备工作
  "prebuild": "npm run clean && mkdirp example/dist/__build__",

  # 使用 html-minifier 压缩 HTML 文件，使用 Browserify 与 Uglifyify 合并压缩 vendor.js 与 app.js
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

敲下 `npm run example` 后，其实就是执行 `npm run build` 与 **`npm run i18n`**

***

### 1. `npm run build`
标准的构建工作流，一般是 Webpack / Grunt / Gulp 等构建工具处理文件后吐出到一个目录中  
（在这里我们为了简单，仅用 `npm scripts` 来完成）

```
example/
  ├── dist/
  │   └── __build__/
  │       ├── app.js  ←------┐
  │       ├── index.html ←---|---┐
  │       └── vendor.js  ←---|---|---┐
  |                          |   |   |
  └── src/                   |   |   |
      ├── app.js --------┬---┘   |   | # 打包合并压缩混淆...
      ├── index.html ----|-------┘   | # html-minifier
      ├── main/          |           | # Browserify + UglifyJS
      │   ├── main1.js --┤           |
      │   └── main2.js --┘           |
      └── vendor/                    |
          ├── index.js ------┬-------┘
          ├── vendor1.js ----┤
          ├── vendor2.js ----┤
          └── vendor3.js ----┘
```

反正处理后的文件最终都到了 [`example/dist/__build__/`](./example/dist/__build__)  
以上并不是我们的重点，因为每个项目都有不同的构建工作流  
重点是下面，对 `example/dist/__build__/` 的所有静态资源进行国际化

***

### 2. `npm run i18n`
对应的命令是 `node example/i18n.js`，因此我们来看看 [`example/i18n.js`](./example/i18n.js) ：

```js
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
* `buildDir`，构建工具处理源码后，所生成静态文件的存放目录  
* `distDir`，我们的 `i18n` 工具将 `buildDir` 内所有静态资源翻译后所生成文件的存放处

还有就是 `sourceLang` 与 `defaultLang` 的区别：

* `sourceLang`，源语言，即 `_#XXX#_` 直接生成 `XXX`，无需翻译
* `defaultLang`，默认翻译语言，即：  
  `<i18n>{ 'XXX': 'XXX-default' }</i18n>` 等同于 `<i18n>{ 'XXX': { [defaultLang]: 'XXX-default' } }</i18n>`

> `defaultLang` 适用于仅提供两种语言版本的应用场景，应用见 [`example/src/vendor/vendor1.js`](./example/src/vendor/vendor1.js)

最后是：

* `saveLocalesTo`，即翻译表的保存路径，用于人工核对翻译，且有利于*提高处理效率*

> 为什么说可以**提高处理效率**？  
> 皆因 `i18n(conf)` 函数还能接受 `conf.locales` 配置  
> 若提供该参数，则直接使用该翻译表而非重新遍历 `srcDir` 提取  
> 对于待翻译内容不常更改的项目而言，此举可减少一些编译耗时

配置讲完了，接下来是国际化三步走：

#### ⑴ 提取
从 `srcDir` 中递归提取出所有 `<i18n>` 的内容进行解析合并（称为 `i18nContent`）：

```json
{
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

#### ⑵ 转换
将上述内容转换成翻译表（称为 `locales`）：

```json
{
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

> 由于 `sourceLang` 设置为 `zh-cn`，因此 `locales['zh-cn']` 为空，表示不翻译  
> 当然还有 `locales.jp` 与 `locales.fr` 都缺少「`好的`」的译文，因此也是不翻译

#### ⑶ 替换
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
  └── locales.json   # saveLocalesTo *here*
```

#### ※ 总流程图
```
        recursive-readdir-sync
srcDir ─────────────────────────┐
  |                             ↓                    >_ npm run i18n
  |               for each file in files:
  |            ⑴    extract-i18n-content(file)
  |                             |
  |                             ↓        i18n-content2locales
  |                         i18nContent ───────── ⑵ ────────────┐
  |                                                              ↓          ┌  en   ┐
  | >_ npm run build                                          locales       |  fr   |
  └------------------------------------------→ buildDir ─────── ⑶ ────────→┤  jp   ├→ distDir
           Webpack / Gulp / Grunt ...                       gulp-replace    └ zh-cn ┘
```

> 由上图 `⑶` 可知，我们实际上是借助 Gulp + [`gulp-replace`](https://github.com/lazd/gulp-replace) 强大的流并行处理能力来进行文本的替换

## § 使用说明
首先安装：`npm i -D i18n-static`，再引入：

```js
var i18n = require('i18n-static');
i18n(<conf>);
```

上述 `conf` 的配置项定义见 [`lib/conf/conf-def.js`](./lib/conf/conf-def.js)，如下所示：

```js
module.exports = {
  // if provided, we don't need to extract locales from srcDir any more
  locales: { type: 'string|object', default: null, required: false },

  // source code with i18n content, it's required if locales is missing
  srcDir: { type: 'string', default: null, required: '!locales' },

  // build code dir for i18n
  buildDir: { type: 'string', default: null, required: true },

  // for gulp.dest
  distDir: { type: 'string', default: null, required: true },

  // for gulp.src of buildDir (not srcDir), as it's unnecessary to translate vendor files
  glob: { type: 'string|array', default: '*', required: true },
  
  // don't forget the `g` flag
  regDelimeter: { type: 'regexp', default: /_#(.*?)#_/g, required: true },

  regI18nContent: { type: 'regexp', default: /<i18n>([\s\S]*?)<\/i18n>/g, required: true },
  
  // your mother tongue
  sourceLang: { type: 'string', default: null, required: true },
  
  // defualt language to translate into
  defaultLang: { type: 'string', default: null, required: true },

  // do not translate into these languages
  excludeLangs: { type: 'array', default: [], required: false },
  
  // set it to a falsy value if not needed
  saveI18nContentTo: { type: 'string|boolean|null|undefined', default: null, required: false },

  // if the translations do not change frequently, you can save locales to speed up i18n process
  saveLocalesTo: { type: 'string|boolean|null|undefined', default: null, required: false }
};
```

***

一般是在 Webpack / Gulp 构建完成后使用：

```js
// Webpack
webpack(<Webpack config>, function (err, stat) {
  if (err) return console.error(err);

  // show build info to console
  console.log(stats.toString({ chunks: false, color: true }));

  i18n(<i18n conf>);
});

// Gulp
gulp.task('build', function () {
  return gulp.src(...)
    .pipe(...)
    .on('end', function () {
      i18n(<i18n conf>);
    });
});
```

## § 注意事项

* 本项目并不是一个 Gulp 插件，完全可以独立使用
* `conf.locales` 可以是文件路径（支持 YAML / JS object / JSON 格式），也可以直接就是翻译表
* 自定义的 `conf.regDelimeter` 与 `conf.regI18nContent` 都需要带上 `g` 以进行全局匹配
* 以下示例会导致提取的失败，因为 `<i18n>` 与 `</i18n>` 之间的掺入了 5 个不可解析的 `*`

```js
function show(num) {
  console.log('_#每页显示#_' + num + '_#条记录#_');
}
/**
 * <i18n>
 * {
 *   '每页显示' : 'Show ',
 *   '条记录': ' items per page'
 * }
 * </i18n>
 */
```

* 不建议整体翻译**带变量**的模板字符串，因为会匹配不上原译文

```js
function show(num) {
  console.log(`_#每页显示 ${num} 条记录#_`)
}
// <i18n>每页显示 ${num} 条记录: 'Show ${num} items per page'</i18n>
-----------------------------------------------
                   Babel ↓
-----------------------------------------------
function show(num) {
  console.log("_#每页显示 " + num + " 条记录#_");
}
// <i18n>每页显示 ${num} 条记录: 'Show ${num} items per page'</i18n>
```

* Webpack 的开发需要使用 [replace-loader](https://github.com/Va1/string-replace-loader) 来去除待翻译内容的定界符（默认为 `_# #_`）：

```js
module: {
  preLoaders: [{
    test: /.*$/, // 针对所有文件
    loader: 'string-replace?search=(_#|#_)&replace=&flags=g'
    exclude: /node_modules/
  }]
}
```
