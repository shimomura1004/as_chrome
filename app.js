var url = "http://asakusa-satellite.herokuapp.com"
var token = ""

$.get(url + "/api/v1/room/list?auth_token=" + token, function(rooms){
  $("#room-list").append( $("<ul></ul>").attr("id", "rooms") );
  var list = $("#rooms");
  $.map(rooms, function(room, idx){
    console.log(room);
    list.append( $("<li>"+room.name+"</li>") );
  });
});
