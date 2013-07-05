var url = localStorage.getItem("serverUrl") || "";
var token = localStorage.getItem("secretKey") || "";
var channelId;

var rooms = [];
var messages = {};
var updated_at = {};

function clearData(){
    rooms = [];
    messages = [];
    updated_at = {};
}

function storeMessage(message, room){
    messages[room.id] = messages[room.id] || [];
    d = new Date(message.created_at);
    message.created_at =
        "" + d.getFullYear() + "/" + d.getMonth() + "/" + d.getDay() +
        " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
    messages[room.id].push(message);
    updated_at[room.id] = room.updated_at;
    return message;
}

function getNewMessages(room){
    var _messages = messages[room.id] || [];
    var data = {
        api_key: token,
        room_id: room.id,
    };

    $.get(url + "/api/v1/message/list.json", data, function(json){
        var messageNum = json.map(function(m){
            return storeMessage(m, room);
        }).length;

        if (messageNum > 0){
            chrome.runtime.sendMessage({
                AsakusaSatellite:"update",
                room: room,
                messages: json
            });
        }
    });
}

function getInitialMessages(){
    if (url == "" || token == "") {
        return;
    }

    var data = {api_key:token};
    $.get(url + "/api/v1/room/list.json", data, function(json){
        rooms = json;
        $.each(rooms, function(_, room){
            if (updated_at[room.id] != room.updated_at) {
                updated_at[room.id] = room.updated_at;
                getNewMessages(room);
            }
        });
    });
}

chrome.pushMessaging.onMessage.addListener(function (info) {
    var data = {api_key: token};
    $.get(url + "/api/v1/message/" + info.payload + ".json", data, function(json){
        var notification = webkitNotifications.createNotification(
            json.profile_image_url,
            json.name,
            json.body
        );
        notification.ondisplay = function(){
            setTimeout(function(){notification.cancel()}, 3000);
        };
        notification.show();

        storeMessage(json, json.room);

        chrome.runtime.sendMessage({
            AsakusaSatellite:"create",
            room: json.room,
            message: json
        });
    });
});

function sendMessage(message, room_id){
    var data = {room_id: room_id, message: message, api_key: token};
    $.post(url + "/api/v1/message.json", data);
}


chrome.pushMessaging.getChannelId(true, function(resp){channelId = resp.channelId});
chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});
getInitialMessages();
