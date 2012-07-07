var fs = require('fs'),
    i18n = require('../lib/i18n'),
    path = require('path'),
    util = require('util');

var allLocales = [],
    localeDir = path.join(__dirname, '..', 'locale');

fs.readdir(localeDir, function (err, files) {
  files.forEach(function (file, i) {
    fs.exists(path.join(localeDir, file, 'LC_MESSAGES', 'client.po'), function (c_exists) {
      if (c_exists) {
        fs.exists(path.join(localeDir, file, 'LC_MESSAGES', 'messages.po'), function (m_exists) {
          if (m_exists) {
            allLocales.push(i18n.languageFrom(file));
          } else {
            console.error(util.format('%s client.po exists, but not messages.po', file));
          }
        });
      }
    });
  });
});

process.on('exit', function () {
  allLocales.sort();
  console.log(JSON.stringify(allLocales).replace(/,"/g, ', "'));
});