App = Ember.Application.create();

App.Router.map(function() {
    this.resource("about");
});

App.IndexRoute = Ember.Route.extend({
});


var bg = chrome.extension.getBackgroundPage();
console.log(bg.rooms);

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.AsakusaSatelliteUpdate) {
        console.log("update "+request.AsakusaSatelliteUpdate);
        console.log(eval("bg." + request.AsakusaSatelliteUpdate));
    }
});
