#!/bin/bash

echo "Extracting strings"
mkdir -p locale/templates/LC_MESSAGES
./node_modules/i18n-abide/bin/extract-pot -l ./locale .

# Create PO files
for locale in en_US es de db_LB; do
  echo "Creating ${locale} language files"
  mkdir -p locale/${locale}/LC_MESSAGES
  mkdir -p i18n/${locale}
  msginit --input=./locale/templates/LC_MESSAGES/messages.pot \
          --output-file=./locale/${locale}/LC_MESSAGES/messages.po \
          -l ${locale} --no-translator
  echo "You can translate i18n/${locale}/messages.json"
done

# Convert PO files to JSON
./node_modules/i18n-abide/bin/compile-json.sh locale i18n

# Make current version of the code happy
./node_modules/i18n-abide/bin/compile-mo.sh locale