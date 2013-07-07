App.ServerUrlTextFieldView = Ember.TextField.extend({
    valueBinding: "App.setting.serverUrl",
    focusOut: function(){
        bg.localStorage.setItem("serverUrl", App.setting.get("serverUrl"));
        restart();
    }
});
