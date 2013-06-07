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

App.SettingRoute = Ember.Route.extend({
    setupController: function(controller, model){
        controller.set("content", model);
        App.state.set("title", "AsakusaSatellite");
        App.state.set("room", undefined);
    },
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

        App.state.set("title", "AsakusaSatellite");
        App.state.set("room", undefined);
    },
});

App.RoomRoute = Ember.Route.extend({
    setupController: function(controller, model){
        var messages = [];
        if (bg.messages[model.id]) {
            bg.messages[model.id].map(function(m){
                messages.unshift(m);
            });
        }
        App.messagesController.set("content", messages);
        controller.set("content", model);
        App.state.set("title", model.name);
        App.state.set("room", model);
    }
});

App.MessageTextArea = Ember.TextArea.extend({
    valueBinding: "App.message.body",
    keyDown: function(e) {
        if (e.keyCode == 13 && !e.shiftKey) { // enter
            e.preventDefault();
            var room_id = this.get("content").get("model").id;
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
    useGCM: bg.localStorage.getItem('useGCM') == "true",
});
App.setting.addObserver("serverUrl", function(){
    bg.localStorage.setItem("serverUrl", App.setting.get("serverUrl"));
    restart();
});
App.setting.addObserver("secretKey", function(){
    bg.localStorage.setItem("secretKey", App.setting.get("secretKey"));
    restart();
});
App.setting.addObserver("useGCM", function(){
    var useGCM = App.setting.get("useGCM");
    bg.localStorage.setItem("useGCM", useGCM);

    if (App.setting.useGCM) {
        var url = App.setting.get("serverUrl") + "/chrome_notification/register"
        var data = {
            api_key: App.setting.get("secretKey"),
            channel_id: bg.channelId,
        };
        $.get(url, data, function(json){ console.log(json) });
    }
});

App.state = Ember.Object.create({
    title: "Asakusasatellite",
    room: undefined,
});

App.MessageView = Ember.View.extend({
    templateName: "message",
});
App.messagesController = Ember.ArrayController.create({
    content: [],
    addToTop: function(messages){
        this.get("content").unshiftObjects(messages);
    },
    addToBottom: function(messages){
        this.get("content").pushObjects(messages);
    },
});

//------------------------------------------------------------
// communicate with background page
//------------------------------------------------------------
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    switch(request.AsakusaSatellite) {
    case "update":
        if (App.state.room && (App.state.room.id == request.room.id)) {
            App.messagesController.addToTop(request.messages.reverse());
        }
        break;
    }
});

function restart(){
    bg.url = App.setting.get("serverUrl");
    bg.token = App.setting.get("secretKey");
    bg.clearData();
    bg.getNewMessages();
}
