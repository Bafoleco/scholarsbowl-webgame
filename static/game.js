var socket = io();
var qdisplay = document.getElementById('qdisplay');
socket.emit('new player');
socket.on('qstate', function (qtext) {
  qdisplay.innerHTML = qtext; 
  console.log("Received qstate");
});
