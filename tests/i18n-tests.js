#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert'),
      vows = require('vows'),
      path = require('path'),
      i18n = require('../lib/i18n');

var suite = vows.describe('i18n');

suite.addBatch({
  "format a string with place values": {
    topic: function() {
      return i18n.format("%s %s!", ["Hello", "World"]);
    },
    "was interpolated": function(err, str) {
      assert.equal(str, "Hello World!");
    }
  }
});

suite.addBatch({
  "format a string with named values": {
    topic: function() {
      var params = { salutation: "Hello", place: "World" };
      return i18n.format("%(salutation)s %(place)s!", params, true);
    },
    "was interpolated": function(err, str) {
      assert.equal(str, "Hello World!");
    }
  },
  "named values can have spaces": {
    topic: function() {
      var params = { salutation: "Hello", place: "World" };
      return i18n.format("%( salutation )s %(  place    )s!", params, true);
    },
    "was interpolated": function(err, str) {
      assert.equal(str, "Hello World!");
    }
  }
});

suite.addBatch({
  "format a string without interpolation": {
    topic: function() {
      return i18n.format("Hello World!");
    },
    "was interpolated": function(err, str) {
      assert.equal(str, "Hello World!");
    }
  },
  "format a null": {
    topic: function() {
      return i18n.format(null);
    },
    "was interpolated": function(err, str) {
      assert.equal(str, "");
    }
  }
});

suite.addBatch({
  "We find exact language match": {
    topic: function() {
      var accept = 'pa,sv;q=0.8,fi;q=0.7,it-ch;q=0.5,en-us;q=0.3,en;q=0.2';
      var supported = ['af', 'en-US', 'pa'];
      var def = 'en-US';
      return i18n.bestLanguage(
          i18n.parseAcceptLanguage(accept),
          supported, def);
    },
    "For Punjabi": function(err, locale) {
      assert.equal(locale, "pa");
    }
  },
  "Issue#1128 We find best locale even if region doesn't match": {
    topic: function() {
      var accept = 'pa-it,sv;q=0.8,fi;q=0.7,it-ch;q=0.5,en-us;q=0.3,en;q=0.2';
      var supported = ['af', 'en-US', 'pa'];
      var def = 'en-US';
      return i18n.bestLanguage(
          i18n.parseAcceptLanguage(accept),
          supported, def);
    },
    "For Punjabi (India) serve Punjabi": function(err, locale) {
      assert.equal(locale, "pa");
    }
  },
  "We don't extend into a region, unless we have an exact match": {
    topic: function() {
      var accept = 'pa,sv;q=0.8,fi;q=0.7,it-ch;q=0.5,en-us;q=0.3,en;q=0.2';
      var supported = ['af', 'en-US', 'pa-IT'];
      var def = 'en-US';
      return i18n.bestLanguage(
          i18n.parseAcceptLanguage(accept),
          supported, def);
    },
    "Don't choose Punjabi (India)": function(err, locale) {
      assert.equal(locale, "en-us");
    }
  },
  "Issue#806649 Don't match Finnish to Ligurian": {
    topic: function() {
      var accept = 'fil-PH,fil;q=0.97,en-US;q=0.94,en;q=0.91,en-ph;' +
        'q=0.89,en-gb;q=0.86,hu-HU;q=0.83,hu;q=0.8,en-AU;q=0.77,en-nl;' +
        'q=0.74,nl-en;q=0.71,nl;q=0.69,en-HK;q=0.66,en-sg;q=0.63,en-th;' +
        'q=0.6,pl-PL;q=0.57,pl;q=0.54,fr-FR;q=0.51,fr;q=0.49,en-AE;' +
        'q=0.46,zh-CN;q=0.43,zh;q=0.4,ja-JP;q=0.37,ja;q=0.34,id-ID;' +
        'q=0.31,id;q=0.29,ru-RU;q=0.26,ru;q=0.23,de-DE;q=0.2,de;' +
        'q=0.17,ko-KR;q=0.14,ko;q=0.11,es-ES;q=0.09,es;q=0.06,en-AP;q=0.0';
      var supported = ['en-US', 'fi'];
      var def = 'en-US';
      return i18n.bestLanguage(
          i18n.parseAcceptLanguage(accept),
          supported, def);
    },
    "Don't choose fi (Finnish)": function(err, locale) {
      assert.equal(locale, "en-US");
    }
  },
  "Do support Ligurian": {
    topic: function() {
      var accept = 'fil-PH,fil;q=0.97,en-US;q=0.94,en;q=0.91,en-ph;' +
        'q=0.89,en-gb;q=0.86,hu-HU;q=0.83,hu;q=0.8,en-AU;q=0.77,en-nl;' +
        'q=0.74,nl-en;q=0.71,nl;q=0.69,en-HK;q=0.66,en-sg;q=0.63,en-th;' +
        'q=0.6,pl-PL;q=0.57,pl;q=0.54,fr-FR;q=0.51,fr;q=0.49,en-AE;' +
        'q=0.46,zh-CN;q=0.43,zh;q=0.4,ja-JP;q=0.37,ja;q=0.34,id-ID;' +
        'q=0.31,id;q=0.29,ru-RU;q=0.26,ru;q=0.23,de-DE;q=0.2,de;' +
        'q=0.17,ko-KR;q=0.14,ko;q=0.11,es-ES;q=0.09,es;q=0.06,en-AP;q=0.0';
      var supported = ['en-US', 'fi', 'fil-PH'];
      var def = 'en-US';
      return i18n.bestLanguage(
          i18n.parseAcceptLanguage(accept),
          supported, def);
    },
    "Matches full locale": function(err, locale) {
      assert.equal(locale, "fil-PH");
    }
  },
  "Do support Ligurian without region": {
    topic: function() {
      var accept = 'fil-PH,fil;q=0.97,en-US;q=0.94,en;q=0.91,en-ph;' +
        'q=0.89,en-gb;q=0.86,hu-HU;q=0.83,hu;q=0.8,en-AU;q=0.77,en-nl;' +
        'q=0.74,nl-en;q=0.71,nl;q=0.69,en-HK;q=0.66,en-sg;q=0.63,en-th;' +
        'q=0.6,pl-PL;q=0.57,pl;q=0.54,fr-FR;q=0.51,fr;q=0.49,en-AE;' +
        'q=0.46,zh-CN;q=0.43,zh;q=0.4,ja-JP;q=0.37,ja;q=0.34,id-ID;' +
        'q=0.31,id;q=0.29,ru-RU;q=0.26,ru;q=0.23,de-DE;q=0.2,de;' +
        'q=0.17,ko-KR;q=0.14,ko;q=0.11,es-ES;q=0.09,es;q=0.06,en-AP;q=0.0';
      var supported = ['en-US', 'fi', 'fil'];
      var def = 'en-US';
      return i18n.bestLanguage(
          i18n.parseAcceptLanguage(accept),
          supported, def);
    },
    "Matches partial locale": function(err, locale) {
      assert.equal(locale, "fil");
    }
  }
});


var makeResp = function(_locals) {
  return {
    locals: function(args, orValue) {
      if ('string' === typeof args) {
        _locals[args] = orValue;
      } else {
        Object.keys(args).forEach(function(key) {
          _locals[key] = args[key];
        });
      }
    }
  };
};
suite.addBatch({
  "i18n.abide middleware is setup": {
    topic: function(){
      var middleware = i18n.abide({});
      var that = this;
      var _locals = {};
      var req = {
        headers: {
          'accept-language': "pl,fr-FR;q=0.3,en-US;q=0.1"
        }
      };
      middleware(req, makeResp(_locals), function() {

        // The request and response objects both get
        // references to i18n related variables and fn
        // Example: req.lang as well as _locals.lang
        [req, _locals].forEach(function(obj){
          assert.equal(obj.lang, 'en-US');
          assert.equal(obj.locale, 'en_US');
          assert.ok(obj.format);
          assert.equal(typeof obj.format, 'function');
          assert.ok(obj.setLocale);
          assert.equal(typeof obj.setLocale, 'function');
          assert.ok(obj.gettext);
          assert.equal(typeof obj.gettext, 'function');
        });

        that.callback();
      });
    },
    'gets a callback': function(err) {
      assert.ok(! err);
    }
  }
});

suite.addBatch({
  "i18n.abide middleware detects format conflict": {
    topic: function(){
      var middleware = i18n.abide({});
      var that = this;
      var _locals = {};
      var req = {
        headers: {
          'accept-language': "pl,fr-FR;q=0.3,en-US;q=0.1"
        },
        // format from express-resource
        format: function() {

        }
      };
      _locals.format = req.format;
      try {
        console.log('== calling middleware');
        middleware(req, makeResp(_locals), function() {
          console.log('== calling  assert fail');
          that.callback(new Error('We should have failed'));
        });
      } catch (e) {
        this.callback();
      }
    },
    'gets a callback': function(err) {
      assert.ok(! err);
    }
  }
});

suite.addBatch({
  "i18n.abide middleware allows re-naming the format fn": {
    topic: function(){
      var middleware = i18n.abide({
        format_fn_name: 'i18nFormat'
      });
      var that = this;
      var _locals = {};
      var req = {
        headers: {
          'accept-language': "pl,fr-FR;q=0.3,en-US;q=0.1"
        },
        // format from express-resource
        format: function(v) {
          this.formatCalled = v;
        }
      };
      _locals.format = req.format;
      middleware(req, makeResp(_locals), function() {
        // The request and response objects both get
        // references to i18n related variables and fn
        // Example: req.lang as well as _locals.lang

        [req, _locals].forEach(function(obj){

          assert.ok(obj.format);
          assert.equal(typeof obj.format, 'function');

          // Existing format is callable and functional
          obj.format('foo');
          assert.ok(obj.formatCalled, 'foo');

          // Our renamed i18n.format is callable and functional
          assert.ok(obj.i18nFormat);
          assert.equal(typeof obj.i18nFormat, 'function');
          var h = obj.i18nFormat("%s %s!", ["Hello", "World"]);
          assert.equal(h, 'Hello World!');
        });

        that.callback();
      });
    },
    'gets a callback': function(err) {
      assert.ok(! err);
    }
  }
});

suite.addBatch({
  "i18n.abide middleware correctly strips known langs from URLs": {
    topic: function(){
      var middleware = i18n.abide({
        supported_languages: [ 'en', 'fr', 'de' ],
        default_lang: 'en',
        translation_type: 'key-value-json',
        translation_directory: path.join(__dirname, 'locale'),
        locale_on_url: true
      });
      var that = this;
      var _locals = {};
      var req = {
        url: '/fr/',
        headers: {}
      };
      middleware(req, makeResp(_locals), function() {
        assert.equal(req.url, "/");
        assert.equal(req.lang, "fr");
        assert.equal(req.locale, "fr");
        assert.equal(_locals.lang, "fr");
        assert.equal(_locals.lang_dir, "ltr");
        that.callback();
      });
    },
    'gets a callback': function(err) {
      assert.ok(! err);
    }
  }
});

suite.addBatch({
  "i18n.abide middleware correctly leaves unknown langs on URLs": {
    topic: function(){
      var middleware = i18n.abide({
        supported_languages: [ 'en', 'fr', 'de' ],
        default_lang: 'en',
        translation_type: 'key-value-json',
        translation_directory: path.join(__dirname, 'locale'),
        locale_on_url: true
      });
      var that = this;
      var _locals = {};
      var req = {
        url: '/ru/',
        headers: {}
      };
      middleware(req, makeResp(_locals), function() {
        assert.equal(req.url, "/ru/");
        assert.equal(req.lang, "en");
        assert.equal(req.locale, "en");
        assert.equal(_locals.lang, "en");
        assert.equal(_locals.lang_dir, "ltr");
        that.callback();
      });
    },
    'gets a callback': function(err) {
      assert.ok(! err);
    }
  }
});

suite.addBatch({
  "i18n.abide middleware does the right thing with accept-language when locale_on_url is used": {
    topic: function(){
      var middleware = i18n.abide({
        supported_languages: [ 'en', 'fr', 'de' ],
        default_lang: 'en',
        translation_type: 'key-value-json',
        translation_directory: path.join(__dirname, 'locale'),
        locale_on_url: true
      });
      var that = this;
      var _locals = {};
      var req = {
        url: '/',
        headers: {
          'accept-language': 'ru;q=0.1'
        }
      };
      middleware(req, makeResp(_locals), function() {
        assert.equal(req.lang, "en");
        assert.equal(req.locale, "en");
        assert.equal(_locals.lang, "en");
        assert.equal(_locals.lang_dir, "ltr");
        that.callback();
      });
    },
    'gets a callback': function(err) {
      assert.ok(! err);
    }
  }
});

// run or export the suite.
if (process.argv[1] === __filename) suite.run();
else suite.export(module);
