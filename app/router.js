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
