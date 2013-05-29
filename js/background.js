var url = "http://10.5.5.83:8080"
var token = "yTzvPnmThlRBCS0udKyEliEijJ2mR"

chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});

var rooms = [];
var messages = [];

var data = {auth_token:token};
$.get(url + "/api/v1/room/list.json", data, function(json){
    rooms = json;

    var counter = 0;
    $.each(rooms, function(idx, room){
        var data = $.extend(data, {room_id: room.id});
        $.get(url + "/api/v1/message/list.json", data, function(json){
            //room.messages = json;
            $.map(json, function(message, idx){
                message.room = message.room.id;
            });
            messages = messages.concat(json);
            
            counter += json.length;

            chrome.browserAction.setBadgeText({text:""+counter});

            var update = "messages";
            chrome.runtime.sendMessage({AsakusaSatelliteUpdate:update});
        });
    });
});
