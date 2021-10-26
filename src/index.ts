import tmi from 'tmi.js';
import express from 'express';
import http from 'http';
import { Server, Socket } from "socket.io";

const app = express()
const server = http.createServer(app);
const io = new Server(server);

let connectedSockets : Socket[] = []

const allowedUsers = [ 'Scoraluna', 'himyu' ]
const allowedTypes = [ 'mod', 'admin' ]

let counter : Map<string, number> = new Map()
counter.set("Limbo", 96)

let currentGame = "Limbo"

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
	channels: [ 'himyu' ]
});

client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
  if(!message.startsWith('!')) return;

  if (!allowedTypes.includes(tags['user-type']) && !allowedUsers.includes(tags['display-name'] as string)) return

  const args = message.split(' ');
	const command = args.shift()!.toLowerCase();

	if(command === '!f') {
    counter.set(currentGame, counter.get(currentGame)+1)
    
    if (counter.get(currentGame) === 100) {
      client.say(channel, `Loons died ${counter.get(currentGame)} times! give her some love and hugs in the chat scoralHeart `);
    } else {
      client.say(channel, `Loons died ${counter.get(currentGame)} times!`);
    }

    sendCounter()
	}

  if (command === '!fcount') {
      client.say(channel, `Loons died ${counter.get(currentGame)} times!`);
      sendCounter()
	}

  if (command === '!freset') {
    counter.set(currentGame, Number(args[0] || "0") )
    client.say(channel, `The counter was reset to ${counter.get(currentGame)} times`);
    sendCounter()
  }

  if (command === '!fsetgame') {
    const game = args.join(' ')
    currentGame = game

    if (!counter.has(game)) {
      counter.set(game, 0)
    }

    client.say(channel, `The Game was set to ${currentGame} Loons died in this game ${counter.get(currentGame)} already times`);
    sendCounter()
  }

  if (command === '!fall') {
    let msg = "Loons death counter: "

    for ( const [key, value] of counter.entries()) {
      msg += `${key}: ${value}! `
    }

    client.say(channel, msg);
  }
});

app.use(express.static('public'))

io.on('connection', (socket) => {
  connectedSockets.push(socket)
  socket.emit('count', counter.get(currentGame))
});

function sendCounter () {
  connectedSockets.forEach(socket => {
    socket.emit('count', counter.get(currentGame))
  })
}

server.listen(3000, () => {
  console.log('listening on *:3000');
});
