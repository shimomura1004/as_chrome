App.messagesController = Ember.ArrayController.create({
    content: [],
    addToTop: function(messages){
        this.get("content").unshiftObjects(messages);
    },
    addToBottom: function(messages){
        this.get("content").pushObjects(messages);
    },
});
