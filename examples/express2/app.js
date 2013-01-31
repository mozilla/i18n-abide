
/**
 * Module dependencies.
 */

var express = require('express'),
    i18n = require('i18n-abide'),
    routes = require('./routes');

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
  app.set('views', __dirname + '/views');
  app.set('view engine', 'ejs');
  app.use(i18n.abide({
    supported_languages: ['en-US', 'de', 'es', 'db-LB', 'it-CH'],
    default_lang: 'en-US',
    debug_lang: 'it-CH',
    translation_directory: 'i18n'
  }));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Routes

app.get('/', routes.index);
app.listen(process.env.PORT || 3000, function(){
  console.log("Express server listening on port %d in %s mode", app.address().port, app.settings.env);
});
