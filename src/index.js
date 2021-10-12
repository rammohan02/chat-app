const path = require('path');
const http = require('http');
const express = require("express");
const socketio = require('socket.io');
const Filter = require('bad-words');
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser, removeUser, getUser, getUsersInRoom} = require('./utils/users');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname,"../public");

app.use(express.static(publicDirectoryPath));

// let count = 0;

// server(emit) -> client(recieve) - countUpdated
// client(emit) -> server(revieve) - increment

io.on('connection', (socket)=>{
    console.log("New websocket connection");

    // socket.emit("message", generateMessage('Welcome!'));
    // socket.broadcast.emit('message', generateMessage("A new user joined"));
    
    socket.on("join", ({username, room}, callback) =>{
        //socket.join allows us to join a room
        const {error, user} = addUser({id: socket.id, username, room});
        if(error){
            return callback(error);
        }
        socket.join(user.room);
        //io.to.emit allows to send message to only in this room
        //socket.broadcast.to.emit to every one in room except you
        socket.emit("message", generateMessage("Admin", 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage("Admin", `${user.username} has joined!`));

        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })

    socket.on('sendMessage', (str , callback) => {
        const user = getUser(socket.id);

        const filter = new Filter();

        if(filter.isProfane(str))
        {
            return callback("Profinity is not allowed");
        }
        io.to(user.room).emit('message', generateMessage(user.username, str));
        callback();
    })
    
    socket.on('sendLocation', (coords, callback)=>{
        const user = getUser(socket.id);
        // socket.broadcast.emit('message', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message', generateMessage("Admin", `${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })

    // socket.emit("countUpdated", count);     //This need not be io.on since it will be appreared only when page is refreshed. which does not chnage

    // socket.on('increment', () => {
    //     count++;
    //     // socket.emit('countUpdated', count);
    //     io.emit('countUpdated', count);         //this emits to all the connections
    // })

})

server.listen(port, ()=> {
    console.log(`Server is up on port ${port}`);
})