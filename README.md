# i18n-abide

This module **abides by the user's language preferences** and makes it
available throughout the app.

This module **abides by the Mozilla L10n way of doing things**.

**The module abides**.

# Status

This module is under development, currently being extracted from [BrowserID](https://github.com/mozilla/browserid).

# Pre-requisites

You should install Gnu gettext to get msginit, xgettext, and other tools.

# Usage

    npm install git://github.com/mozilla/i18n-abide.git

In your app where you setup express or connect:

    var i18n = require('i18n-abide');

    app.use(i18n.abide({
      supported_languages: ['en-US', 'de', 'es', 'db-LB', 'it-CH']],
      default_lang: 'en-US',
      debug_lang: 'it-CH',
      locale_directory: 'locale'
    }));

This block sets up the middleware and views with gettext support. We declare
support for English, German, Spanish, and two debug locales (more on this later).

In your routes, you can use the gettext function in ``.js`` files.

    exports.homepage = function (req, resp) {
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

These are both server side translations with ``node-gettext``. If you also want to do client-side translations,
i18n-abide provides ``lib/gettext.js`` and you can do the same in ``.js`` and ``.ejs`` files.

## Setup Gettext

    $ mkdir -p locale/templates/LC_MESSAGES
    # Get a local copy of extract_po.sh, and edit to to match your source code layout
    $ cp node_modules/i18n-abide/bin/extract_po.sh bin/
    $ emacs bin/extract_po.sh (or vim or whatever)
    $ ./bin/extract_po.sh

If you look in ``locale/templates/LC_MESSAGES/messages.pot`` you will see your strings have been extracted.
Edit this file and make sure ``charset`` is set to ``UTF-8``.

Example messages.pot:

    "Content-Type: text/plain; charset=UTF-8\n"
    "Content-Transfer-Encoding: 8bit\n"

    #: server/routes.js:81
    msgid "Hey, careful, man, there's a beverage here!"
    msgstr ""

    #: server/views/404.ejs:5
    msgid "This will not stand, ya know, this aggression will not stand, man."
    msgstr ""

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

``db-LB`` is a special
**debug** locale. To trigger it, set your Browser or Operating System language to Italian (Switzerland) which is ``it-CH``.  This fake locale ``db-LB`` will be triggered, it is David Bowie speak for the region of Labyrinth. Oh, hell ya a Dude / Bowie Mashup.
That just happened.

Example: ``locale/db_LB/LC_MESSAGES/messages.po``

    "Content-Type: text/plain; charset=UTF-8\n"
    "Content-Transfer-Encoding: 8bit\n"

    #: server/routes.js:81
    msgid "Hey, careful, man, there's a beverage here!"
    msgstr "‮Hǝʎ´ ɔɐɹǝɟnʅ´ ɯɐu´ ʇɥǝɹǝ,s ɐ qǝʌǝɹɐƃǝ ɥǝɹǝ¡"

    #: server/views/404.ejs:5
    msgid "This will not stand, ya know, this aggression will not stand, man."
    msgstr "‮⊥ɥıs ʍıʅʅ uoʇ sʇɐup´ ʎɐ ʞuoʍ´ ʇɥıs ɐƃƃɹǝssıou ʍıʅʅ uoʇ sʇɐup´ ɯɐu·"

And we will compile ``.po`` files into ``.mo`` files.

    $ compile_mo.sh locale/

Now, start up your Node server and visit a page you've wrapped strings in Gettext...

See docs/USAGE.md for full details.