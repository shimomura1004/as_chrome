var App = Ember.Application.create();
var bg = chrome.extension.getBackgroundPage();

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
    setupController: function(controller, model){
        var rooms = [];
        bg.rooms.sort(function(r1,r2){
            return Date.parse(r1.updated_at) > Date.parse(r2.updated_at);
        }).map(function(room){
            rooms.unshift(room);
        });
        controller.set('content', rooms);

        App.title.set("title", "AsakusaSatellite");
    },
});

App.RoomRoute = Ember.Route.extend({
    setupController: function(controller, roomModel){
        var model = {};
        model.room = roomModel;
        model.messages = [];
        if (bg.messages[roomModel.id]) {
            bg.messages[roomModel.id].map(function(m){
                model.messages.unshift(m);
            });
        }
        controller.set('content', model);
        App.title.set("title", roomModel.name);
    }
});

App.MessageTextArea = Ember.TextArea.extend({
    valueBinding: "App.message.body",
    keyDown: function(e) {
        if (e.keyCode == 13 && !e.shiftKey) { // enter
            e.preventDefault();
            var room_id = this.get("content").get("model").room.id;
            bg.sendMessage(App.message.get("body"), room_id);
            App.message.set("body", "");
        }
    },
});
App.message = Ember.Object.create({});


App.ServerUrlTextField = Ember.TextField.extend({
    valueBinding: "App.setting.serverUrl",
});
App.SecretKeyTextField = Ember.TextField.extend({
    valueBinding: "App.setting.secretKey",
});

App.setting = Ember.Object.create({
    serverUrl: bg.localStorage.getItem("serverUrl") || "",
    secretKey: bg.localStorage.getItem("secretKey") || "",
});
App.setting.addObserver("serverUrl", function(){
    bg.localStorage.setItem("serverUrl", App.setting.get("serverUrl"));
    restart();
});
App.setting.addObserver("secretKey", function(){
    bg.localStorage.setItem("secretKey", App.setting.get("secretKey"));
    restart();
});

App.title = Ember.Object.create({title: "AsakusaSatellite"});

//------------------------------------------------------------
// communicate with background page
//------------------------------------------------------------
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if(request.AsakusaSatelliteUpdate) {
        console.log("update "+request.AsakusaSatelliteUpdate);
//        console.log(eval("bg." + request.AsakusaSatelliteUpdate));
    }
});

function restart(){
    bg.url = App.setting.get("serverUrl");
    bg.token = App.setting.get("secretKey");
    bg.clearData();
    bg.getNewMessages();
}
