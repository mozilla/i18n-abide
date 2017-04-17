/*globals json_locale_data: true */
/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

(function() {
  "use strict";

  function Gettext(params) {
      return {
        gettext: function (msgid) {
          if (json_locale_data && json_locale_data["client"]) {
          var dict = json_locale_data["client"];
            if (dict[msgid] && dict[msgid].length >= 2 &&
                dict[msgid][1].trim() != "") {
              return dict[msgid][1];
            }
        }
        return msgid;
        },
        ngettext: function (msgid, msgid_plural, nb) {
          if (params['locale_data'] && params['locale_data'][params['domain']]) {
          var dict = params['locale_data'][params['domain']];
          var idx = nb == 1 ? 1 : 2;
            if (dict[msgid] && dict[msgid].length >= 2 &&
                dict[msgid][idx].trim() != "") {
              return dict[msgid][idx];
            }
        }
        return nb == 1 ? msgid : msgid_plural;
        },
        // See lib/i18n.js format docs
        format: function (fmt, obj, named) {
          if (! fmt) return "";
          if (! fmt.replace) {
            return fmt;
          }
          if (named) {
            return fmt.replace(/%\(\w+\)s/g, function(match){return String(obj[match.slice(2,-2)])});
          } else {
            return fmt.replace(/%s/g, function(match){return String(obj.shift())});
          }
        }
      };
  };

  var params = {
        "domain" : "client",
        "locale_data" : json_locale_data
  };
  var gt = new Gettext(params);
  window.gettext = gt.gettext.bind(gt);
  window.ngettext = gt.ngettext.bind(gt);
  window.format = gt.format.bind(gt);

}());
