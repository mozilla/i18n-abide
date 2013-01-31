#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert'),
      vows = require('vows'),
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

// run or export the suite.
if (process.argv[1] === __filename) suite.run();
else suite.export(module);
