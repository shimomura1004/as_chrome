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
            json = json.slice(1).map(function(m){
                d = new Date(m.created_at);
                m.created_at =
                    "" + d.getFullYear() + "/" + d.getMonth() + "/" + d.getDay() +
                    " " + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds();
                return m;
            });
            messages[room.id] = _messages.concat(json);

            if (json.length > 0){
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

chrome.pushMessaging.onMessage.addListener(function (message) {
console.log(message);
    alert("message received!: " + message.payload);
});
