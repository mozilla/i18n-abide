/* Parse and normalize i18n-abide configuration parameters
 *
 * Each parameter can be passed as underscore_name or camelCase.
 * In cases of conflict, underscore_case wins
 */

function Option(name, alias, defaultValue) {
  this.name = name;
  if (defaultValue) { this.defaultValue = defaultValue; }
  if (alias) { this.alias = alias; }
  return this;
}

module.exports = function (args) {
  var options = [
    new Option('gettext_alias',         'gettextAlias',         'gettext'),
    new Option('supported_languages',   'supportedLanguages',   ['en-us']),
    new Option('default_lang',          'defaultLang',          'en-US'  ),
    new Option('debug_lang',            'debugLang',            'it-CH'  ),
    new Option('disable_locale_check',  'disableLocaleCheck',   false    ),
    new Option('translation_directory', 'translationDirectory', 'i18n/'  ),
    new Option('logger',                 undefined,             console  )
  ];

  var result = {};
  options.forEach(function(option) {
    var name = option.name;
    var alias = option.alias;

    if (name in args) {
      result[name] = args[name];
    } else if (alias && alias in args) {
      result[name] = args[alias];
    } else {
      result[name] = option.defaultValue;
    }
  });

  return result;
};
