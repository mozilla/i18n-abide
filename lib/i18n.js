/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/*
 * i18n-abide
 *
 * This module abides by the user's language preferences and makes it
 * available throughout the app.
 *
 * This module abides by the Mozilla L10n way of doing things.
 *
 * The module abides.
 *
 * See docs/I18N.md for details.
 */

var fs = require('fs'),
    gobbledygook = require('gobbledygook'),
    path = require('path'),
    util = require('util'),
    plist = require('plist');

const DAVID_B_LABYRN = 'db-LB';
const BIDI_RTL_LANGS = ['ar', DAVID_B_LABYRN, 'fa', 'he'];

// Number of characters before and after valid JSON in messages.json files
const JS_PRE_LEN = 24;
const JS_POST_LEN = 3;

var translations = {};
var logger;

// forward references
var localeFrom, parseAcceptLanguage, bestLanguage, format, languageFrom;

/**
 * Connect middleware which is i18n aware.
 *
 * Usage:
  app.use(i18n.abide({
    supported_languages: ['en-US', 'fr', 'pl'],
    default_lang: 'en-US',
    translation_directory: 'locale'
  }));
 *
 * Other valid options: gettext_alias, debug_lang, disable_locale_check,
 * translation_type, locale_on_url, or logger
 */
exports.abide = function(options) {
  options = options || {};

  if (! options.gettext_alias)         options.gettext_alias = 'gettext';
  if (! options.supported_languages)   options.supported_languages = ['en-US'];
  if (! options.default_lang)          options.default_lang = 'en-US';
  if (! options.debug_lang)            options.debug_lang = 'it-CH';
  if (! options.disable_locale_check)  options.disable_locale_check = false;
  if (! options.translation_directory) options.translation_directory = 'l18n/';
  if (! options.logger)                options.logger = console;

  // We expect to use PO->json files, unless configured to use another format.
  options.translation_type = options.translation_type || 'po';
  // Only check URL for locale if told to do so.
  options.locale_on_url = options.locale_on_url === true;

  logger = options.logger;

  function messages_file_path(locale) {
    // check if the option is 'key-value-json' if so the file format would be 'json' instead
    var file_format = options.translation_type == 'plist' ? 'plist' : 'json';
    var filename = 'messages.' + file_format;
    return path.resolve(path.join(__dirname, '..', '..', '..'),
                        options.translation_directory,
                        path.join(locale, filename));
  }

  function parse_messages_file(locale) {
    var filepath = messages_file_path(locale);

    if (options.translation_type === 'plist') {
      return plist.parseFileSync(filepath);
    }
    else if (options.translation_type === 'key-value-json') {
      return require(filepath);
    }
    // PO->json file
    else {
      var rawMessages = fs.readFileSync(filepath).toString();
      return JSON.parse(rawMessages).messages;
    }
  }

  options.supported_languages.forEach(function(lang) {
    var l = localeFrom(lang);

    // populate the in-memory translation cache with client.json, which contains
    // strings relevant on the server
    try {
      translations[l] = parse_messages_file(l);
    } catch (e) {
      // an exception here means that there was a problem with the translation
      // files for this locale!
      if (options.default_lang === lang || options.debug_lang === lang) return;

      var msg = util.format(
        'Bad locale=[%s] missing .%s files in [%s]. See locale/README (%s)',
        l, options.translation_type, messages_file_path(l), e);
      if (!options.disable_locale_check) {
        logger.warn(msg);
      } else {
        logger.error(msg);
        throw msg;
      }
    }
  });

  function checkUrlLocale(req) {
    if (!options.locale_on_url) {
      return;
    }

    // Given a URL, http://foo.com/ab/xyz/, we check to see if the first directory
    // is actually a locale we know about, and if so, we strip it out of the URL
    // (i.e., URL becomes http://foo.com/xyz/) and store that locale info on the
    // request's accept-header.
    var matches = req.url.match(/^\/([^\/]+)(\/|$)/);
    if (!(matches && matches[1])) {
      return;
    }

    // Look for a lang we know about, and if found, strip it off the URL so routes
    // continue to work. If we don't find it (i.e., comes back "unknown") then bail.
    // We do this so that we don't falsely consume more of the URL than we should
    // and stip things that aren't actually locales we know about.
    var lang = bestLanguage(parseAcceptLanguage(matches[1]),
                            options.supported_languages,
                            "unknown");
    if (lang === "unknown") {
      return;
    }

    req.url = req.url.replace(matches[0], '/');
    req.headers['accept-language'] = lang;
  }

  return function(req, resp, next) {
    checkUrlLocale(req);

    var langs = parseAcceptLanguage(req.headers['accept-language']),
        lang_dir,
        lang = bestLanguage(langs, options.supported_languages,
                            options.default_lang),
        debug_lang = options.debug_lang.toLowerCase(),
        locale,
        locals = {},
        gt;

    if (lang && lang.toLowerCase && lang.toLowerCase() === debug_lang) {
      // What? http://www.youtube.com/watch?v=rJLnGjhPT1Q
      lang = DAVID_B_LABYRN;
    }
    // Express 2 support
    if (!! resp.local) {
      resp.locals = function(args, orValue) {
        if ('string' === typeof args) {
          resp.local(args, orValue);
        } else {
          Object.keys(args).forEach(function(key) {
            resp.local(key, args[key]);
          });
        }
      };
    }

    locals.lang = lang;

    // BIDI support, which direction does text flow?
    lang_dir = BIDI_RTL_LANGS.indexOf(lang) >= 0 ? 'rtl' : 'ltr';
    locals.lang_dir = lang_dir;
    req.lang = lang;

    locale = localeFrom(lang);

    locals.locale = locale;
    req.locale = locale;

    var formatFnName = 'format';
    if (!! locals.format || !! req.format) {
      if (!! options.format_fn_name) {
        formatFnName = options.format_fn_name;
      } else {
        console.error("It appears you are using middleware which " +
          "already sets a variable 'format' on either the request " +
          "or reponse. Please use format_fn_name in options to " +
          "override this setting.");
        throw new Error("Bad Config - override format_fn_name");
      }

    }
    locals[formatFnName] = format;
    req[formatFnName] = format;

    locals.setLocale = function(assignedLocale) {
      if (translations[assignedLocale]) {
        locale = assignedLocale;

        var newLocals = {};

        newLocals.locale = assignedLocale;
        req.locale = assignedLocale;

        newLocals.lang = languageFrom(assignedLocale);
        req.lang = newLocals.lang;

        newLocals.lang_dir = BIDI_RTL_LANGS.indexOf(newLocals.lang) >= 0 ? 'rtl' : 'ltr';
        req.lang_dir = newLocals.lang_dir;

        resp.locals(newLocals);
      }
    };
    req.setLocale = locals.setLocale;

    if (lang.toLowerCase() === DAVID_B_LABYRN.toLowerCase()) {
      gt = gobbledygook;
      locals.lang = DAVID_B_LABYRN;
    } else if (translations[locale]) {
      gt = function(sid) {
        // The plist and PO->json files are in a slightly different format.
        if (options.translation_type === 'plist' || options.translation_type === 'key-value-json') {
          if (translations[locale][sid] && translations[locale][sid].length) {
            return translations[locale][sid];
          } else {
            // Return the default lang's string if missing in the translation.
            return (translations[options.default_lang][sid] || sid);
          }
        }
        // PO->json file
        else {
          if (translations[locale][sid] && translations[locale][sid][1].length) {
            return translations[locale][sid][1];
          }
        }
        return sid;
      };
    } else {
      // default lang in a non gettext environment... fake it
      gt = function(a) { return a; };
    }
    locals[options.gettext_alias] =  gt;
    req.gettext = gt;

    // resp.locals(string, value) doesn't seem to work with EJS
    resp.locals(locals);

    next();
  };
};

function qualityCmp(a, b) {
  if (a.quality === b.quality) {
    return 0;
  } else if (a.quality < b.quality) {
    return 1;
  } else {
    return -1;
  }
}

/**
 * Parses the HTTP accept-language header and returns a
 * sorted array of objects. Example object:
 * {
 *   lang: 'pl', quality: 0.7
 * }
 */
exports.parseAcceptLanguage = parseAcceptLanguage = function(header) {
  // pl,fr-FR;q=0.3,en-US;q=0.1
  if (! header || ! header.split) {
    return [];
  }
  var raw_langs = header.split(',');
  var langs = raw_langs.map(function(raw_lang) {
    var parts = raw_lang.split(';');
    var q = 1;
    if (parts.length > 1 && parts[1].indexOf('q=') === 0) {
      var qval = parseFloat(parts[1].split('=')[1]);
      if (isNaN(qval) === false) {
        q = qval;
      }
    }
    return { lang: parts[0].trim(), quality: q };
  });
  langs.sort(qualityCmp);
  return langs;
};


 // Given the user's prefered languages and a list of currently
 // supported languages, returns the best match or a default language.
 //
 // languages must be a sorted list, the first match is returned.
exports.bestLanguage = bestLanguage = function(languages, supported_languages, defaultLanguage) {
  var lower = supported_languages.map(function(l) { return l.toLowerCase(); });
  for(var i=0; i < languages.length; i++) {
    var lq = languages[i];
    if (lower.indexOf(lq.lang.toLowerCase()) !== -1) {
      return lq.lang;
    // Issue#1128 match locale, even if region isn't supported
    } else if (lower.indexOf(lq.lang.split('-')[0].toLowerCase()) !== -1) {
      return lq.lang.split('-')[0];
    }
  }
  return defaultLanguage;
};

/**
 * Given a language code, return a locale code the OS understands.
 *
 * language: en-US
 * locale:   en_US
 */
exports.localeFrom = localeFrom = function(language) {
  if (! language || ! language.split) {
    return "";
  }
  var parts = language.split('-');
  if (parts.length === 1) {
    return parts[0].toLowerCase();
  } else if (parts.length === 2) {
    return util.format('%s_%s', parts[0].toLowerCase(), parts[1].toUpperCase());
  } else if (parts.length === 3) {
    // sr-Cyrl-RS should be sr_RS
    return util.format('%s_%s', parts[0].toLowerCase(), parts[2].toUpperCase());
  } else {
    logger.error(
      util.format("Unable to map a local from language code [%s]", language));
    return language;
  }
};

/**
 * Given a locale code, return a language code
 */
exports.languageFrom = languageFrom = function(locale) {
  if (!locale || !locale.split) {
    return "";
  }
  var parts = locale.split('_');
  if (parts.length === 1) {
    return parts[0].toLowerCase();
  } else if (parts.length === 2) {
    return util.format('%s-%s', parts[0].toLowerCase(), parts[1].toUpperCase());
  } else if (parts.length === 3) {
    // sr_RS should be sr-RS
    return util.format('%s-%s', parts[0].toLowerCase(), parts[2].toUpperCase());
  } else {
    logger.error(
      util.format("Unable to map a language from locale code [%s]", locale));
    return locale;
  }
};

/**
 * format provides string interpolation on the client and server side.
 * It can be used with either an object for named variables, or an array
 * of values for positional replacement.
 *
 * Named Example:
 * format("%(salutation)s %(place)s", {salutation: "Hello", place: "World"}, true);
 * Positional Example:
 * format("%s %s", ["Hello", "World"]);
 */
exports.format = format = function(fmt, obj, named) {
  if (!fmt) return "";
  if (Array.isArray(obj) || named === false) {
    return fmt.replace(/%s/g, function(){return String(obj.shift());});
  } else if (typeof obj === 'object' || named === true) {
    return fmt.replace(/%\(\s*([^)]+)\s*\)s/g, function(m, v){
      return String(obj[v.trim()]);
    });
  } else {
    return fmt;
  }
};

/**
 * Returns the list of translations abide is currently configured to support.
 */
exports.getLocales = function() {
  return Object.keys(translations);
};
