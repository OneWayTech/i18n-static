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
