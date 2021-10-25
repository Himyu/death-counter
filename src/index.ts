import tmi from 'tmi.js';
import express from 'express';
import http from 'http';
import { Server, Socket } from "socket.io";

const app = express()
const server = http.createServer(app);
const io = new Server(server);

let connectedSockets : Socket[] = []

let count = 96
const allowedUsers = [ 'scoraluna', 'himyu' ]

const client = new tmi.Client({
	options: { debug: true, messagesLogLevel: "info" },
	connection: {
		reconnect: true,
		secure: true
	},
	identity: {
		username: 'Sir_Purrcival_Bonk',
		password: process.env.PASSWORD
	},
	channels: [ 'scoraluna', 'himyu' ]
});

client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
  if(!message.startsWith('!')) return;

  if (!tags.mod && !allowedUsers.includes(tags['display-name'] as string)) return

  const args = message.split(' ');
	const command = args.shift()!.toLowerCase();

	if(command === '!f') {
    count++
    
    if (count === 100) {
      client.say(channel, `Loons died ${count} times! give her some love and hugs in the chat scoralHeart `);
    } else {
      client.say(channel, `Loons died ${count} times!`);
    }

    sendCounter()
	}

  if (command === '!fcount') {
      client.say(channel, `Loons died ${count} times!`);
      sendCounter()
	}

  if (command === '!freset') {
    count = Number(args[0] || "0") 
    client.say(channel, `The counter was reset to ${count} times`);
    sendCounter()
  }
});

app.use(express.static('public'))

io.on('connection', (socket) => {
  connectedSockets.push(socket)
  socket.emit('count', count)
});

function sendCounter () {
  connectedSockets.forEach(socket => {
    socket.emit('count', count)
  })
}
 
server.listen(3000, () => {
  console.log('listening on *:3000');
});