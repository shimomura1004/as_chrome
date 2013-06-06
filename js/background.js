var url = localStorage.getItem("serverUrl") || "";
var token = localStorage.getItem("secretKey") || "";

var interval = 10 * 1000;

chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});

var rooms = [];
var messages = {};
var updated_at = {};
var counter = 0;

function clearData(){
    rooms = [];
    messages = [];
    updated_at = {};
    counter = 0;
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

function getNewMessages(){
    function getNewMessageInRoom(room){
        var _messages =  messages[room.id] || [];
        var data = {
            api_key: token,
            room_id: room.id,
        };
        if (_messages && _messages.length > 0) {
            data["since_id"] = _messages[_messages.length - 1].id;
        }

        $.get(url + "/api/v1/message/list.json", data, function(json){
            var messageNum = json.slice(1).map(function(m){
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

    if (url == "" || token == "") {
        return;
    }

    var data = {api_key:token};
    $.get(url + "/api/v1/room/list.json", data, function(json){
        rooms = json;
        $.each(rooms, function(idx, room){
            if (updated_at[room.id] != room.updated_at) {
                updated_at[room.id] = room.updated_at;
                getNewMessageInRoom(room);
            }
        });
    });
}

getNewMessages();
setInterval(getNewMessages, interval);


// sending message
function sendMessage(message, room_id){
    var data = {room_id: room_id, message: message, api_key: token};
    $.post(url + "/api/v1/message.json", data);
}


// google cloud messaing for chrome
chrome.pushMessaging.getChannelId(true, function(resp){
    console.log(resp.channelId);
});

/*
{channelId:'',
'subchannelId': '0',
'payload': '51b03cc1fb2f2e0f5500004c'
}
*/
chrome.pushMessaging.onMessage.addListener(function (info) {
    console.log(info);

    var data = {api_key: token};
    $.get(url + "/api/v1/message/" + info.payload + ".json", data, function(json){
        console.log(json);

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
    });
});
