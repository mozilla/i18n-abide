# Pre-requisites for String Wranglers

You should install Gnu gettext to get msginit, xgettext, and other tools.

What is a string wrangler?
A person or an automated build process that will merge and delete strings
between releases.

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

## New Locales

To add a new language, and thus a new locale to BrowserID, do the following:
Assuming you want to add eo for Esperanto support...

    mkdir -p locale/eo/LC_MESSAGES

    msginit --input=./locale/templates/LC_MESSAGES/messages.pot \
            --output-file=./locale/eo/LC_MESSAGES/messages.po \
            -l eo

    msginit --input=./locale/templates/LC_MESSAGES/client.pot \
            --output-file=./locale/eo/LC_MESSAGES/client.po \
            -l eo