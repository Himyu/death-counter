import tmi from 'tmi.js';
import express from 'express';
import http from 'http';
import { Server, Socket } from "socket.io";
import fs from 'fs';
import path from 'path';
import io from '@pm2/io';

const dataPath = path.join(__dirname, '..', 'data', 'counter.json')
const dataFile = fs.readFileSync(dataPath)
const data = JSON.parse(dataFile.toString()) as Array<[string, number]>

const app = express()
const server = http.createServer(app);
const ioServer = new Server(server);

const connectedSockets : Socket[] = []

const allowedUsers = [ 'Scoraluna', 'himyu' ]
const allowedTypes = [ 'mod', 'admin' ]

const counter : Map<string, number> = new Map()
let currentGame = ""

for (const [key, value] of data) {
  counter.set(key, value)
  currentGame = key
}

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
	channels: [ 'scoraluna' ]
});

client.connect().catch(console.error);

client.on('message', (channel, tags, message, self) => {
  if (self) return
  if(!message.startsWith('!')) return;

  if (!allowedTypes.includes(tags['user-type']!) && !allowedUsers.includes(tags['display-name'] as string)) return

  const args = message.split(' ');
	const command = args.shift()!.toLowerCase();

	if(command === '!f') {
    counter.set(currentGame, counter.get(currentGame)!+1)
    
    if (counter.get(currentGame) === 100) {
      client.say(channel, `Loons died ${counter.get(currentGame)} times, in ${currentGame}! give her some love and hugs in the chat scoralHeart `);
    } else {
      client.say(channel, `Loons died ${counter.get(currentGame)} times, in ${currentGame}!`);
    }

    sendCounter()
	}

  if (command === '!fcount') {
      client.say(channel, `Loons died ${counter.get(currentGame)} times, in ${currentGame}!`);
	}

  if (command === '!freset') {
    counter.set(currentGame, Number(args[0] || "0") )
    client.say(channel, `The counter was reset to ${counter.get(currentGame)} times, for ${currentGame}`);
    sendCounter()
  }

  if (command === '!fsetgame') {
    const game = args.join(' ')
    currentGame = game

    if (!counter.has(game)) {
      counter.set(game, 0)
    }

    client.say(channel, `The Game was set to ${currentGame}, Loons died ${counter.get(currentGame)} times already in this game`);

    sendCounter()

    fs.promises.writeFile(dataPath, JSON.stringify(Array.from(counter), null, 4))
  }

  if (command === '!fremovegame') {
    const game = args.join(' ')
    counter.delete(game)
    currentGame = [...counter.keys()][counter.size - 1]

    client.say(channel, `The Game ${game} was removed, the current game was set to ${currentGame}`);

    sendCounter()

    fs.promises.writeFile(dataPath, JSON.stringify(Array.from(counter), null, 4))
  }

  if (command === '!fall') {
    let msg = "Loons death counters: "

    for ( const [key, value] of counter.entries()) {
      msg += `${key}: ${value}! `
    }

    client.say(channel, msg);
  }
});

app.use(express.static('public'))

ioServer.on('connection', (socket) => {
  connectedSockets.push(socket)
  socket.emit('count', counter.get(currentGame))
});

function sendCounter () {
  connectedSockets.forEach(socket => {
    socket.emit('count', counter.get(currentGame))
  })
}

io.action('Current Game', (reply : (val : any) => void) => {
  reply(`Loons died ${counter.get(currentGame)} times, in ${currentGame}!`)
})

io.action('F', (reply : (val : any) => void) => {
  counter.set(currentGame, counter.get(currentGame)!+1)
  reply(`Loons died ${counter.get(currentGame)} times, in ${currentGame}!`)
  sendCounter()
})

io.action('Reset', (param : string, reply : (val : any) => void) => {
  counter.set(currentGame, Number(param))
  reply(`The counter was reset to ${counter.get(currentGame)} times, for ${currentGame}`)
  sendCounter()
})

io.action('All', (reply : (val : any) => void) => {
  reply([...counter.entries()])
})

io.action('Set Game', function(param : string, reply : (val : any) => void) {
  if (!counter.has(param)) {
    counter.set(param, 0)
  }

  sendCounter()

  reply(`The Game was set to ${currentGame}, Loons died ${counter.get(currentGame)} times already in this game`)

  fs.promises.writeFile(dataPath, JSON.stringify(Array.from(counter), null, 4))
})

io.action('Remove Game', function(param : string, reply : (val : any) => void) {
  counter.delete(param)
  currentGame = [...counter.keys()][counter.size - 1]

  reply(`The Game ${param} was removed, the current game was set to ${currentGame}`);

  sendCounter()

  fs.promises.writeFile(dataPath, JSON.stringify(Array.from(counter), null, 4))
})

server.listen(3000, () => {
  console.log('listening on *:3000');
});
