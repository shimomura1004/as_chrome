var App = Ember.Application.create();
var bg = chrome.extension.getBackgroundPage();

App.message = Ember.Object.create({});

App.setting = Ember.Object.create({
    serverUrl: bg.localStorage.getItem("serverUrl") || "",
    secretKey: bg.localStorage.getItem("secretKey") || "",
    useGCM: bg.localStorage.getItem('useGCM') == "true",
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

//------------------------------------------------------------
// communicate with background page
//------------------------------------------------------------
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse){
    if (!App.state.room || (App.state.room.id != request.room.id)) {
        return;
    }

    switch(request.AsakusaSatellite) {
    case "update":
        App.messagesController.addToTop(request.messages.reverse());
        break;
    case "create":
        App.messagesController.addToTop([request.message]);
        break;
    }
});

function restart(){
    bg.url = App.setting.get("serverUrl");
    bg.token = App.setting.get("secretKey");
    bg.clearData();
    bg.getInitialMessages();
}
