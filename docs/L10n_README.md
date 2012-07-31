These po files are scripts are for the BrowserID project and work along
with scripts from the browserid github repo under the scripts directory.

    scripts/extract-po.sh - Creates template POT file

This script examines EJS and JavaScript files for strings, extracts them, and puts them into POT files.

    scripts/merge-po.sh - Takes new or changed strings and updates PO files

Additionally, if possible, generates a db_LB language translation.

    locale/compile-mo.sh - Compiles PO to MO files
    locale/compile-json.sh - Compiles PO to JSON files

# Installation:

    git clone git://github.com/mozilla/browserid.git
    cd browserid
    svn co https://svn.mozilla.org/projects/l10n-misc/trunk/browserid/locale

BrowserID has one unique differnce than a typical Mozilla website, the
PO files are also converted into JSON files using po2json.js.

po2json.js depends on Node.js. To install Node, see node.js.org

po2json.js is compatible with po2json.pl if you'd rather use that Perl based tool.

If you don't have xgettext, msginit, or msgmerge, please install gettext also.

There is a debugging locale db-LB (David Bowie Labyrinth) which gets updated
via podebug. Optionally Install translate-toolkit to update this locale.

You should now have a complete environment for working with strings.

# After string freeze:

    git fetch upstream
    git checkout train-YYYY.MM.DD
    ./scripts/extract-po.sh
    ./scripts/merge-po.sh locale/

    ./locale/compile-json.sh locale/ resources/static/i18n/

PO files should be commited to SVN.
JSON files should be commited to git.

# During Deployment:

MO files should be distributed to, or compiled on each webhead:

    ./locale/compile-mo.sh locale/