#!/usr/bin/env node

/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const assert = require('assert'),
      vows = require('vows'),
      config = require('../lib/configuration');

const camelConfig = {
  gettextAlias: 'gta',
  supportedLanguages: ['en-US', 'db-LB'],
  defaultLang: 'en-US',
  debugLang: 'db-LB',
  disableLocaleCheck: true,
  translationDirectory: 'i36n/',
  logger: console
};

const under_config = {
  gettext_alias: 'gta',
  supported_languages: ['en-US', 'db-LB'],
  default_lang: 'en-US',
  debug_lang: 'db-LB',
  disable_locale_check: true,
  translation_directory: 'i36n/',
  logger: console
};

var suite = vows.describe('configuration');

suite.addBatch({
  'accepts camelCase keys': function () {
    assert.deepEqual(config(camelConfig), under_config);
  },
  'camelCase options': {
    topic: config({disable_locale_check: false, disableLocaleCheck: true}),
    'get overriden by under_words options': function (topic) {
      assert.strictEqual(topic.disable_locale_check, false);
    },
    'do not appear in the returned object': function (topic) {
      assert.strictEqual(topic.disableLocaleCheck, undefined);
    }
  }
});

// run or export the suite.
if (process.argv[1] === __filename) {
  suite.run();
} else {
  suite.export(module);
}
