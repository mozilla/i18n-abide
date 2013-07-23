# API

The following APIs compliment the core API shown in the [README](../README.md):

## Setting Language via URL
You can control which locale is used, by putting language codes in the URL.
This is enabled via the option `locale_on_url` option during setup:

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

## setLocale

Another way to override locale settings is directly via the API.

You can set locale in the scope of a single request.
The following example shows how to set the locale of the request to `zh_TW`
(Traditional Chinese):

    exports.homepage = function(req, resp) {
      req.setLocale('zh_TW');
      resp.render('home', {title: "my title"});
    };

Perhaps `zh-TW` came from the session or user preferences, for example.

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

The `translation_type` option will cause `i18n-abide` to look for files named
`messages.plist` in locale directories beneath your `translation_directory` root.
For example, the `es` language listed above should be located at
`i18n/es/messages.plist`.

## format_fn_name Option

For compatibility with `express-resource` and other apps,
you may use the `format_fn_name` option to rename the `format` function.

Example:

    app.use(i18n.abide({format_fn_name: 'i18nformat'}));

    app.get('/foo', function(req, res) {
      res.render('bar', {
        greeting: req.i18nformat("%s %s!", ["Hello", "World"]);
      });
    });

    # in bar.ejs
    <p><%= i18nformat(gettext("Please see %s"), ["https://example.com"]) %></p>