# i18n-abide

This module **abides by the user's language preferences** and makes it
available throughout the app.

This module **abides by the Mozilla L10n way of doing things**.

**The module abides**.

# Status

This module is under development, but frozen parts of it power the [Mozilla Persona](https://github.com/mozilla/browserid) service in 40+ languages.

# Tutorial

Mozilla Hacks blog has a three part introduction.

* [Localize Your Node.js Service](https://hacks.mozilla.org/2013/04/localize-your-node-js-service-part-1-of-3-a-node-js-holiday-season-part-9/)
* [Localization community, tools & process](https://hacks.mozilla.org/2013/04/localization-community-tools-process-part-2-of-3-a-node-js-holiday-season-part-10/)
* [Localization in Action](https://hacks.mozilla.org/2013/04/localization-in-action-part-3-of-3-a-node-js-holiday-season-part-11/)

# Pre-requisites for Developers

`npm install` has got your back

# Pre-requisites for String Wranglers

You should install Gnu gettext to get msginit, xgettext, and other tools.

What is a string wrangler? A person or an automated build process that will merge and delete strings between releases.

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

This block sets up the middleware and views with gettext support. We declare
support for English, German, Spanish, and two debug locales (more on this later).

In your routes, you can use the gettext function in ``.js`` files.

    exports.homepage = function(req, resp) {
      resp.render('home', {title: req.gettext("Hey, careful, man, there's a beverage here!")});
    };

In your layout files, you can add

    <!DOCTYPE html>
    <html lang="<%= lang %>" dir="<%= lang_dir %>">
      <head>
        <meta charset="utf-8">
        ...

In your templates files, you can use the gettext function in ``.ejs`` files:

    <p><%= gettext("This will not stand, ya know, this aggression will not stand, man.") %></p>

i18n-abide also provides a ``format`` function for string interpolation.

These are both server side translations and client side translations. Server side works out of the box
and is the most common use case.

If you also want to do client-side translations,
i18n-abide provides ``lib/gettext.js`` and you can do the same in ``.js`` and ``.ejs`` files.

## Setup Gettext

    $ mkdir -p locale/templates/LC_MESSAGES
    $ ./node_modules/.bin/extract-pot --locale locale .

If you look in ``locale/templates/LC_MESSAGES/messages.pot`` you will see your strings have been extracted.
Edit this file and make sure ``charset`` is set to ``UTF-8``.

If there are certain files or directories you want to exclude, use `--exclude` one or more times. Example:

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

To create ``po`` files in bulk, do:

    $ for l in en_US de es db_LB; do
        mkdir -p locale/${l}/LC_MESSAGES/
        msginit --input=./locale/templates/LC_MESSAGES/messages.pot \
                --output-file=./locale/${l}/LC_MESSAGES/messages.po \
                -l ${l}
      done

If you look at ``locale/en_US/LC_MESSAGES/messages.po``, it will be very similar to your template messages.pot file.

This creates ``.po`` files which you can give to localizers to translate your copy.

Let's put the i18n-abide tools in our path:

    $ export PATH=$PATH:node_modules/i18n-abide/bin

And run a string merge:

    $ merge_po.sh ./locale

A merge takes strings from our ``.pot`` files and pushes them into our ``.po`` files. If you have ``podebug`` installed, it also automatically translates ``db-LB``.

# Debugging and Testing

``db-LB`` is a special
**debug** locale. To trigger it, set your Browser or Operating System language to Italian (Switzerland) which is ``it-CH``.  This fake locale ``db-LB`` will be triggered, it is David Bowie speak for the region of Labyrinth. Oh, hell ya a Dude / Bowie Mashup.
That just happened.

Example: ``locale/db_LB/LC_MESSAGES/messages.po``

    "Content-Type: text/plain; charset=UTF-8\n"
    "Content-Transfer-Encoding: 8bit\n"

    #: routes.js:81
    msgid "Hey, careful, man, there's a beverage here!"
    msgstr "‮Hǝʎ´ ɔɐɹǝɟnʅ´ ɯɐu´ ʇɥǝɹǝ,s ɐ qǝʌǝɹɐƃǝ ɥǝɹǝ¡"

    #: views/404.ejs:5
    msgid "This will not stand, ya know, this aggression will not stand, man."
    msgstr "‮⊥ɥıs ʍıʅʅ uoʇ sʇɐup´ ʎɐ ʞuoʍ´ ʇɥıs ɐƃƃɹǝssıou ʍıʅʅ uoʇ sʇɐup´ ɯɐu·"

And we will compile ``.po`` files into ``.mo`` files.

    $ compile_mo.sh locale/

Now, start up your Node server and visit a page you've wrapped strings in Gettext...

See docs/USAGE.md for full details.
