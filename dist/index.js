"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const tmi_js_1 = __importDefault(require("tmi.js"));
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = express_1.default();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server);
let connectedSockets = [];
let count = 96;
const allowedUsers = ['scoraluna', 'himyu'];
const client = new tmi_js_1.default.Client({
    options: { debug: true, messagesLogLevel: "info" },
    connection: {
        reconnect: true,
        secure: true
    },
    identity: {
        username: 'himyu',
        password: process.env.PASSWORD
    },
    channels: ['scoraluna', 'himyu']
});
client.connect().catch(console.error);
client.on('message', (channel, tags, message, self) => {
    if (!message.startsWith('!'))
        return;
    if (!tags.mod && !allowedUsers.includes(tags['display-name']))
        return;
    const args = message.split(' ');
    const command = args.shift().toLowerCase();
    if (command === '!f') {
        count++;
        if (count === 100) {
            client.say(channel, `Loons died ${count} times! give her some love and hugs in the chat scoralHeart `);
        }
        else {
            client.say(channel, `Loons died ${count} times!`);
        }
        sendCounter();
    }
    if (command === '!fcount') {
        client.say(channel, `Loons died ${count} times!`);
        sendCounter();
    }
    if (command === '!freset') {
        count = Number(args[0] || "0");
        client.say(channel, `The counter was reset to ${count} times`);
        sendCounter();
    }
});
app.use(express_1.default.static('public'));
io.on('connection', (socket) => {
    connectedSockets.push(socket);
    socket.emit('count', count);
});
function sendCounter() {
    connectedSockets.forEach(socket => {
        socket.emit('count', count);
    });
}
server.listen(3000, () => {
    console.log('listening on *:3000');
});
//# sourceMappingURL=index.js.map