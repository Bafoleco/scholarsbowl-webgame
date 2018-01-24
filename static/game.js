var socket = io();
var qdisplay = document.getElementById('qdisplay');
var buzzer = document.getElementById('buzzer');
var input = document.getElementById('input');
socket.emit('new player');
socket.on('qstate', function (qtext) {
  qdisplay.innerHTML = qtext;
  console.log("Received qstate");
});
socket.on('rejected', function(answer) {
  window.alert('You\'ve already buzzed')
});

buzzer.onclick = function() {
  var answer = input.value;
  socket.emit('buzz', answer);
  console.log(answer)
}
