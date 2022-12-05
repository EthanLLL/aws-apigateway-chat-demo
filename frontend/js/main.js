const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

// Get username and room from URL
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});
// outputRoomName(room)

const socket = new WebSocket('wss://xxxxxxxxxx.execute-api.us-west-2.amazonaws.com/production');

socket.addEventListener('open', function (event) {
    console.log("socket open")
    console.log(event)
    // Join chatroom
    socket.send(JSON.stringify({
      action: 'sendmessage',
      type: 'user_in_room',
      username: username,
      room: room
    }));
});

socket.addEventListener('message', function (event) {
  console.log(event)
  console.log('Message from server ', event.data);
  const data = JSON.parse(event.data)
  if (data.type === 'user_in_room') {
    outputRoomName(data.room);
    outputUsers(data.users);
  } else if (data.type === 'message') {
    outputMessage(JSON.parse(event.data));
  }

  // Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.addEventListener('error', function (event) {
    console.log(event)
});

socket.addEventListener('close', function (event) {
    console.log("socket close")
});


// Message submit
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Get message text
  let msg = e.target.elements.msg.value;
  console.log(msg)

  msg = msg.trim();

  if (!msg) {
    return false;
  }

  // Emit message to server
  socket.send(JSON.stringify({
    action: 'sendmessage',
    type: 'message',
    message: msg,
    username: username,
    time: Date.now(),
    room: room
  }));

  // Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message to DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Add room name to DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Add users to DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user;
    userList.appendChild(li);
  });
}
