Ember.Handlebars.helper('safestring', function(value, options) {
    console.log(value);
  return new Handlebars.SafeString(value);
});
