#!/bin/bash

# syntax:
# compile-mo.sh locale-dir/

function usage() {
    echo "syntax:"
    echo "compile.sh locale-dir/"
    exit 1
}

# check if file and dir are there
if [[ ($# -ne 1) || (! -d "$1") ]]; then usage; fi

for lang in `find $1 -type f -name "*.po"`; do
    dir=`dirname $lang`
    stem=`basename $lang .po`
    msgmerge -o ${dir}/${stem}.po.tmp ${dir}/${stem}.po $1/templates/LC_MESSAGES/${stem}.pot
    mv ${dir}/${stem}.po.tmp ${dir}/${stem}.po
done