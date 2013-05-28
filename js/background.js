var url = "http://10.5.5.83:8080"
var token = "yTzvPnmThlRBCS0udKyEliEijJ2mR"

chrome.browserAction.setBadgeBackgroundColor({color:[190, 190, 190, 230]});

var rooms = [];
var messages = {};

var data = {auth_token:token};
$.get(url + "/api/v1/room/list.json", data, function(json){
    rooms = json;
    rooms = rooms.slice(0,1);

    var counter = 0;
    $.each(rooms, function(idx, room){
        var data = $.extend(data, {room_id: room.id});
        $.get(url + "/api/v1/message/list.json", data, function(json){
console.log(json);
            messages[room.id] = json;
            counter += json.length;

            chrome.browserAction.setBadgeText({text:""+counter});

            var update = "messages['"+room.id+"']";
setInterval(function(){
            chrome.runtime.sendMessage({AsakusaSatelliteUpdate:update});
}, 3000);
        });
    });
});
