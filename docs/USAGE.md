# i18n-abide Usage

Adding localization to your project,
should not get in the way of your developers from a day to day perspective.

You will add this module, but if you don't have any localization files,
it is okay and there won't be any errors.

## Development

Any copy, label, or error message that will be shown to users **should** be
wrapped in a gettext function.

These strings must be evaluated in the scope of a request,
so we know which locale the user has.

In JavaScript or EJS templates use `gettext`.
If you need to do string interpolation, use the
[format](../lib/i18n.js) function,
which is kind of like node.js' util.format, except crappier.

Using `_` is more idiomatic,
but conflicts with `underscore.js` on the client side JS and EJS files.

Technically, you can alias gettext to _ and use util.format in node.js code...
but for development consistency,
Mozilla codebases should keep EJS templates looking similar,
regardless of if they are evaluated client or server-side.
So we don't use `_` which can be confused with `underscore.js`.

## Variables

The request object and the response's template context have the following variables:

 * lang - User's preferred language
 * lang_dir - rtl or ltr (BIDI language support)
 * locale - OS level locale code
 * gettext - Gettext function
 * format - for string interpolation

## Debugging

If code is evaluated in node.js (server-side) then translation is provided from
the `i18n/{locale}/messages.json` file which contains the translation.
These JSON files come from the `message.po` PO files.

If code is evaluated on the client-side, then `static/gettext.js` is *in
the house*...
strings are from the `i18n/{locale}/client.js` files.

If code is evaluated in your head, then clearly we are post-singularity. Why are you
still using gettext?

You can change `i18n` in the above to examples by setting the
`translation_directory` in your options to i18n-abide.
If you do server side and client side strings,
it is recommended that you put your translation_directory under a web
accessible directory like `static`.

Of course you can integrate gettext.js and client.js via your existing
JavaScript build to compress, minify, etc.

See [API.md](API.md) for more advanced uses of `i18n-abide`.