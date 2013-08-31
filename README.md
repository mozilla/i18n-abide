# i18n-abide

This module **abides by the user's language preferences** and makes it available
throughout the app.

This module **abides by the Mozilla L10n way of doing things**.

**The module abides**.

# Status

Used in production systems, such as the
[Mozilla Persona](https://github.com/mozilla/browserid) service in 40+
languages.

Also used on other websites including:
* Mozilla Webmaker

# Supported Localization Technologies

This module supports several localization backends:
* Gettext PO files (default and documented below)
* Plist files
* Transifex key-value-JSON files

This module supports client side as well as server side localization.

# Usage

    npm install i18n-abide

In this README, we'll use express and EJS templates, but other
integrations are possible.

In your app where you setup express:

    var i18n = require('i18n-abide');

    app.use(i18n.abide({
      supported_languages: ['en-US', 'de', 'es', 'db-LB', 'it-CH'],
      default_lang: 'en-US',
      debug_lang: 'it-CH',
      translation_directory: 'i18n'
    }));

This block sets up the middleware and views with gettext support.
We declare support for English, German, Spanish, and two debug locales
(more on this later).

In your routes, you can use the gettext function in `.js` files.

    exports.homepage = function(req, resp) {
      resp.render('home', {title: req.gettext("Hey, careful, man, there's a beverage here!")});
    };

In your layout files, you can add

    <!DOCTYPE html>
    <html lang="<%= lang %>" dir="<%= lang_dir %>">
      <head>
        <meta charset="utf-8">
        ...

In your templates files, you can use the gettext function in `.ejs` files:

    <p><%= gettext("This will not stand, ya know, this aggression will not stand, man.") %></p>

i18n-abide also provides a `format` function for string interpolation.

This module provides both server side translations and client side translations.
Server side works out of the box and is the most common use case.

If you also want to do client-side translations,
i18n-abide provides `lib/gettext.js` and you can do the same in `.js` and
`.ejs` files.

## Setting Language via HTTP Header

The `i18n-abide` module uses the
[`accept-language` HTTP header](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4)
to determine which language to use.

See [API docs](./docs/API.md) for overriding this via URL or the API directly.

## Translation files

The `i18n-abide` module currently supports three file formats.

1) PO/POT files, which get transformed to JSON via provided command line tools.

2) [PLIST](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/plist.5.html) (i.e., XML)
files, which require no transformation prior to use.

3) [Transifex](http://support.transifex.com/customer/portal/articles/1223004-key-value-json-files) [JSON](https://developer.mozilla.org/en/docs/JSON)
(JavaScript Object Notation) a key-value JSON type,
which require no transformation prior to use.

### PO/POT files

This is the default and assumed for documentation in this README.

PO files can be compiled to .json or Gettext binary `.mo` files.

For use on the client side,
PO files are compiled to JavaScript for easy inclusion into your page or build
script.

NOTE: The PO/POT files are also transformed into .JSON,
but do not follow the same layout as the Transifex JSON files.

See [GETTEXT.md](docs/GETTEXT.md) for more details.

### Other file formats

See [API](docs/API.md) for configuration and details around using Plist or Transifex localization files.


# Debugging and Testing

`db-LB` is a special **debug** locale.
To trigger it, set your Browser or Operating System language to Italian
(Switzerland) which is `it-CH`.
This fake locale `db-LB` will be triggered,
it is David Bowie speak for the region of Labyrinth.

Oh, hell ya a "The Dude" / Bowie Mashup.
That just happened.

Now,
start up your Node server and visit a page you've wrapped strings in Gettext...

# Tutorial

Mozilla Hacks blog has a three part introduction.

* [Localize Your Node.js Service](https://hacks.mozilla.org/2013/04/localize-your-node-js-service-part-1-of-3-a-node-js-holiday-season-part-9/)
* [Localization community, tools & process](https://hacks.mozilla.org/2013/04/localization-community-tools-process-part-2-of-3-a-node-js-holiday-season-part-10/)
* [Localization in Action](https://hacks.mozilla.org/2013/04/localization-in-action-part-3-of-3-a-node-js-holiday-season-part-11/)

# Docs
* See [USAGE](./docs/USAGE.md) for full details.
* [API docs](./docs/API.md) has more advanced config options and APIs
* [GETTEXT](./docs/GETTEXT.md) documents how to use PO/POT files
