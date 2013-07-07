App.MessageTextAreaView = Ember.TextArea.extend({
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
