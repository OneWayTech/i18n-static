# 通用的国际化方案

## 灵感来源
Vux-loader

## 快速体验

见 `example/src/vendor/vendor1.js`：

```
// <i18n>{ '你好': { 'en': 'Hello', 'jp': 'こんにちは', 'fr': 'Bonjour' } }</i18n>
console.log('_#你好#_');

// <i18n>{ '热爱': { 'en': 'Love', 'jp': '熱愛', 'fr': 'Aimer' } }</i18n>
console.log('_#热爱#_');
```

定界符 `_#` 与 `#_` 包裹的 `XXX` 为待翻译内容  
而 `<i18n>` 标签内容 `{ 'XXX': { 'en': 'XXX-en', 'jp': 'XXX-jp', 'fr': 'XXX-fr' } }` 为其对应的翻译  
我们把源码中这些零散的翻译内容收集汇聚成翻译表，使用该翻译表来对**编译后**的静态资源进行整体的“翻译”，亦即：  
根据翻译表对待翻译内容进行替换，替换的结果根据翻译表的键（`en` / `jp` / `fr`）分目录进行存放

使用注释形式，在源码旁直接备注其对应的翻译。通过这样的方式来实现国际化，最大的好处是：  
自维护，毋须单独维护庞大的翻译表。任何修改都可以在上下文中一目了然，避免源码与翻译表两头兼顾的困扰  

而且，这种方式与所使用的技术栈无关，前后端通用，侵入性极小，灵活度极高
  
举一个实例说明：
```
console.log('_#每页显示#_' + num + '_#条记录#_');
/*<i18n>
{
  '每页显示': 'Show ',
  '条记录': ' items per pages'
}
</i18n>*/
```

如此灵活的翻译方式，相信您会喜欢的


## 流程

我们使用 `example/` 下的这个简单的例子来说明本国际化方案的流程  

首先我们来分析一下 `package.json` 里面的 npm scripts：
```
"scripts": {
  # 清理原有的 build 目录
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
* `buildDir`，构建工具将源码编译后，所生成静态文件的存放目录  
* `distDir`，我们的 `i18n` 工具将 `buildDir` 内所有静态资源翻译后所生成文件的存放处

还有就是 `sourceLang` 与 `defaultLang` 的区别：
* `sourceLang`，源语言，即 `_#XXX#_` 直接生成 `XXX`，无需翻译
* `defaultLang`，默认翻译语言，即 `<i18n>{ 'XXX': 'XXX-default' }</i18n>` 等同于 `<i18n>{ 'XXX': { [defaultLang]: 'XXX-default' } }</i18n>`（应用见 `example/src/main/main1.js`）

> `defaultLang` 适用于仅提供两种语言版本的应用场景

最后就是 `saveLocalesTo`，即翻译表的保存路径，用于人工核对翻译，且有利于提高处理效率  
皆因我们的 `i18n` 工具的调用方式实际上为 `i18n(<config>, <locales?>)`，其中 `locales` 参数可选  
若提供该参数，则直接使用该翻译表而非重新遍历 `srcDir` 提取  
对于待翻译内容不常更改的项目而言，此举可减少一些编译耗时

在这里，`npm run i18n` 后的第一步就是从 `srcDir` 中提取出所有 `<i18n>` 标签的内容并合并：
```
"i18nContent": {
  "欢迎": {
    "en": "Welcome",
    "jp": "歓迎",
    "fr": "Bienvenue"
  },
  "语言 - 中文": {
    "en": "Language - English",
    "jp": "言語 - 日本語",
    "fr": "Langue - Français"
  },
  "好的": {
    "en": "Well"
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
  "中国": {
    "en": "China",
    "jp": "中国",
    "fr": "Chine"
  },
  "苹果": {
    "en": "Apple",
    "jp": "リンゴ",
    "fr": "Pommes"
  },
  "国际": {
    "en": "International",
    "jp": "国際",
    "fr": "International"
  }
}
```

随后将上述内容转换成翻译表：
```
"locales": {
  "en": {
    "欢迎": "Welcome",
    "语言 - 中文": "Language - English",
    "好的": "Well",
    "你好": "Hello",
    "热爱": "Love",
    "中国": "China",
    "苹果": "Apple",
    "国际": "International"
  },
  "jp": {
    "欢迎": "歓迎",
    "语言 - 中文": "言語 - 日本語",
    "你好": "こんにちは",
    "热爱": "熱愛",
    "中国": "中国",
    "苹果": "リンゴ",
    "国际": "国際"
  },
  "fr": {
    "欢迎": "Bienvenue",
    "语言 - 中文": "Langue - Français",
    "你好": "Bonjour",
    "热爱": "Aimer",
    "中国": "Chine",
    "苹果": "Pommes",
    "国际": "International"
  },
  "zh-cn": {}
}
```
由于 `sourceLang` 设置为 `zh-cn`，因此 `locales[zh-cn]` 为空，表示不翻译  
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

为什么需要定界符？因为很重要

ES6 模板字符串压缩后变成...
