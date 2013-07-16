# i18n-abide

This module **abides by the user's language preferences** and makes it available
throughout the app.

This module **abides by the Mozilla L10n way of doing things**.

**The module abides**.

# Status

Used in production systems, such as the 
[Mozilla Persona](https://github.com/mozilla/browserid) service in 40+
languages.

Also it is in production on other websites:
* Mozilla Webmaker

# Supported Localization technologies

This module supports several localization backends:
* Gettext PO files (default and documented below)
  * Custom JSON
* Plist
* Transflex key-value-JSON

This module supports client side as well as server side localization.

# Pre-requisites for Developers

`npm install` has got your back

# Pre-requisites for String Wranglers

You should install Gnu gettext to get msginit, xgettext, and other tools.

What is a string wrangler?
A person or an automated build process that will merge and delete strings
between releases.

# Usage

    npm install i18n-abide

In your app where you setup express or connect:

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

You can set locale in the scope of per-request instead of letting `i18n-abide`
decide the locale for you.
The following example shows how to set the locale of the request to `zh_TW`
(Traditional Chinese): 

    exports.homepage = function(req, resp) {
      req.setLocale('zh_TW');
      resp.render('home', {title: "my title"});
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

These are both server side translations and client side translations.
Server side works out of the box and is the most common use case.

If you also want to do client-side translations,
i18n-abide provides `lib/gettext.js` and you can do the same in `.js` and
`.ejs` files.

## Setting Language via HTTP Header and URL

The `i18n-abide` module uses the 
[`accept-language` HTTP header](http://www.w3.org/Protocols/rfc2616/rfc2616-sec14.html#sec14.4)
to determine which language to use.
It is also possible to have language tags parsed on the URL with an option at
setup:

```javascript
app.use(i18n.abide({
  supported_languages: ['en-US', 'de', 'es', 'db-LB', 'it-CH'],
  default_lang: 'en-US',
  debug_lang: 'it-CH',
  translation_directory: 'i18n',
  locale_on_url: true
}));
```

Here the `locale_on_url` option has been set to `true`, which causes
`i18n-abide` to perform an extra step with every request:
each time a request comes to the server, the URL is examined for an optional
language tag.
Some examples include:

* http://app.com/
* http://app.com/en-US/
* http://app.com/de/

If a URL includes a language tag for one of the supported languages specified
at setup, the request's `accept-language` header is overridden by the URL's
language.
The URL is then rewritten to no longer include this language tag,
such that routes further down in the middleware chain are unaffected.

Given the URLs listed above, the following would happen in the `i18n-abide`
middleware with `locale_on_url` set to `true`:

* http://app.com/ --> http://app.com/
* http://app.com/en-US/ --> locale is now `en-US`, url is http://app.com/
* http://app.com/de --> locale is now `de`, url is http://app.com/

The `locale_on_url` option is off by default.

## Translation files

The `i18n-abide` module currently supports three file formats.
1) PO/POT files, which get transformed to JSON via provided command line tools.
2) [PLIST](https://developer.apple.com/library/mac/documentation/Darwin/Reference/ManPages/man5/plist.5.html) (i.e., XML) files, which require no transformation prior to use.
3) [Transflex](http://support.transifex.com/customer/portal/articles/1223004-key-value-json-files) [JSON](https://developer.mozilla.org/en/docs/JSON) (JavaScript Object Notation) a key-value JSON type.

### PO/POT files

This is the default and assumed for documention in this README.

PO files can be compiled to .json or Gettext binary `.mo` files.

For use on the client side,
PO files are compiled to JavaScript for easy inclusion into your page or build
script.

NOTE: The PO/POT files are also transformed into .JSON,
but do not follow the same layout as the Transflex JSON files.

### Choosing file format
By default PO/POT files are used. This can be changed during setup:

```javascript
app.use(i18n.abide({
  supported_languages: ['en-US', 'de', 'es', 'db-LB', 'it-CH'],
  default_lang: 'en-US',
  debug_lang: 'it-CH',
  translation_directory: 'i18n',
  translation_type: 'plist'
}));
```

This will cause `i18n-abide` to look for files named `messages.plist` in locale directories beneath your `translation_directory` root. For example, the `es` language listed above should be located at `i18n/es/messages.plist`.

## Working with PO/POT files, and gettext

If using the default of PO/POT files instead of plist,
you must transform your strings such that `i18n-abide` can work with them.

### Setup Gettext

    $ mkdir -p locale/templates/LC_MESSAGES
    $ ./node_modules/.bin/extract-pot --locale locale .

If you look in `locale/templates/LC_MESSAGES/messages.pot` you will see your
strings have been extracted.
Edit this file and make sure `charset` is set to `UTF-8`.

If there are certain files or directories you want to exclude,
use `--exclude` one or more times. Example:

    $ extract-pot --locale locale . --exclude tests --exclude examples

Example messages.pot:

    "Content-Type: text/plain; charset=UTF-8\n"
    "Content-Transfer-Encoding: 8bit\n"

    #: ./routes.js:81
    msgid "Hey, careful, man, there's a beverage here!"
    msgstr ""

    #: views/404.ejs:5
    msgid "This will not stand, ya know, this aggression will not stand, man."
    msgstr ""

To create `po` files in bulk, do:

    $ for l in en_US de es db_LB; do
        mkdir -p locale/${l}/LC_MESSAGES/
        msginit --input=./locale/templates/LC_MESSAGES/messages.pot \
                --output-file=./locale/${l}/LC_MESSAGES/messages.po \
                -l ${l}
      done

If you look at `locale/en_US/LC_MESSAGES/messages.po`,
it will be very similar to your template messages.pot file.

This creates `.po` files which you can give to localizers to translate your copy.

Let's put the i18n-abide tools in our path:

    $ export PATH=$PATH:node_modules/i18n-abide/bin

And run a string merge:

    $ merge_po.sh ./locale

A merge takes strings from our `.pot` files and pushes them into our `.po` files.
If you have `podebug` installed, it also automatically translates `db-LB`.

# Debugging and Testing

`db-LB` is a special
**debug** locale. To trigger it,
set your Browser or Operating System language to Italian (Switzerland) which is
`it-CH`.
This fake locale `db-LB` will be triggered,
it is David Bowie speak for the region of Labyrinth.
Oh, hell ya a Dude / Bowie Mashup.
That just happened.

Example: `locale/db_LB/LC_MESSAGES/messages.po`

    "Content-Type: text/plain; charset=UTF-8\n"
    "Content-Transfer-Encoding: 8bit\n"

    #: routes.js:81
    msgid "Hey, careful, man, there's a beverage here!"
    msgstr "‮Hǝʎ´ ɔɐɹǝɟnʅ´ ɯɐu´ ʇɥǝɹǝ,s ɐ qǝʌǝɹɐƃǝ ɥǝɹǝ¡"

    #: views/404.ejs:5
    msgid "This will not stand, ya know, this aggression will not stand, man."
    msgstr "‮⊥ɥıs ʍıʅʅ uoʇ sʇɐup´ ʎɐ ʞuoʍ´ ʇɥıs ɐƃƃɹǝssıou ʍıʅʅ uoʇ sʇɐup´ ɯɐu·"

And we will compile `.po` files into `.mo` files.

    $ compile_mo.sh locale/

Now,
start up your Node server and visit a page you've wrapped strings in Gettext...

# Tutorial

Mozilla Hacks blog has a three part introduction.

* [Localize Your Node.js Service](https://hacks.mozilla.org/2013/04/localize-your-node-js-service-part-1-of-3-a-node-js-holiday-season-part-9/)
* [Localization community, tools & process](https://hacks.mozilla.org/2013/04/localization-community-tools-process-part-2-of-3-a-node-js-holiday-season-part-10/)
* [Localization in Action](https://hacks.mozilla.org/2013/04/localization-in-action-part-3-of-3-a-node-js-holiday-season-part-11/)


See docs/USAGE.md for full details.