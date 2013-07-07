App.SecretKeyTextFieldView = Ember.TextField.extend({
    valueBinding: "App.setting.secretKey",
    focusOut: function(e){
        bg.localStorage.setItem("secretKey", App.setting.get("secretKey"));
        restart();
    }
});
