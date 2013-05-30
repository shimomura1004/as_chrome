var App = Ember.Application.create();
var bg = chrome.extension.getBackgroundPage();

//------------------------------------------------------------
// model declaration
//------------------------------------------------------------
App.Store = DS.Store.extend({
  revision: 12,
  adapter: "DS.FixtureAdapter"
});

App.Room = DS.Model.extend({
    user: DS.belongsTo('App.User'),
    members: DS.hasMany('App.User'),
    messages: DS.hasMany('App.Message'),
    name: DS.attr('string'),
    nickname: DS.attr('string'),
    updated_at: DS.attr('date'),
});
App.User = DS.Model.extend({
    room: DS.belongsTo('App.Room'),
    name: DS.attr('string'),
    profile_image_url: DS.attr('string'),
    screen_name: DS.attr('string'),
});
App.Message = DS.Model.extend({
    room: DS.belongsTo('App.Room'),
    body: DS.attr('string'),
    created_at: DS.attr('date'),
    name: DS.attr('string'),
    profile_image_url: DS.attr('string'),
    screen_name: DS.attr('string'),
    view: DS.attr('string'),
});

// model setup
App.Room.FIXTURES = bg.rooms;
App.messages = Ember.ArrayController.create({
    content: [],
});

//------------------------------------------------------------
// routing set up
//------------------------------------------------------------
App.Router.map(function() {
    this.route("rooms", { path: "/" });
    this.resource("rooms");
    this.resource("room", {path:"/room/:room_id"});
    this.resource("setting");
});
App.RoomsRoute = Ember.Route.extend({
    model: function(){
        return App.Room.find();
    }
});
App.RoomRoute = Ember.Route.extend({
    setupController: function(controller, model){
        var newModel = {};
        newModel.room = model;
        newModel.messages = [];
        bg.messages[model.id].map(function(m){newModel.messages.push(m)});
        controller.set('content', newModel);
    }
});

//------------------------------------------------------------
// callbacks
//------------------------------------------------------------
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.AsakusaSatelliteUpdate) {
//        console.log("update "+request.AsakusaSatelliteUpdate);
//        console.log(eval("bg." + request.AsakusaSatelliteUpdate));
    }
});
