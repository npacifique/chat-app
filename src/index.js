const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
const {generateMessage, generateLocation} = require('./utils/messages')
const {addUser, 
    removeUser, 
    getUser, 
    getUsersInRoom} = require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectory = path.join(__dirname, '../public')

app.use(express.static(publicDirectory))

//let count = 0
io.on('connection', (socket)=>{

    //send message
   //socket.emit('message',generateMessage('Welcome!'))


   //listen for join

   socket.on('join', ({username, room}, callback)=>{

        const {error, user} = addUser({id : socket.id, username, room})

        if(error){
            return callback(error)
        }

       //join chat room
        socket.join(user.room)

        //emit to specific room
        socket.emit('message',generateMessage(user.username, 'Welcome!'))


        //broadcast to a chat room
        socket.broadcast.to(user.room).emit('message', generateMessage(user.username, `${user.username} has joined!`))


        io.to(user.room).emit('roomData', {
            room : user.room, 
            users : getUsersInRoom(user.room)
        })

        callback()
   })


   //listen to send message
   socket.on('sendMessage', (message, callback)=>{

        //TODO add validation here 
        //set validation before continuing 

       
        //send message 
        //socket.emit('message', generateMessage(message))
        const user = getUser(socket.id)

        io.to(user.room).emit('message', generateMessage(user.username, message))
        //send acknowledgment
       callback()
   })

   //broadcast to everyone except the connected user
   //socket.broadcast.emit('message', generateMessage('a new user has connect!'))


    //listen to sendLocation
    socket.on('sendLocation', ({latitude, longitude}, callback )=>{
        const user = getUser(socket.id)

        io.to(user.room).emit('locationMessage', generateLocation( user.username, `https://www.google.com/maps?q=${latitude},${longitude}`))

        callback()
    }) 

   //notify on disconnect
   socket.on('disconnect', ()=>{
        const user = removeUser(socket.id)

        user && io.to(user.room).emit('message', generateMessage(user.username, `${user.username} has left`))

        io.to(user.room).emit('roomData', {
            room : user.room, 
            users : getUsersInRoom(user.room)
        })
   })


})



server.listen(port, ()=>{
    console.log(`server is up on port ${port}`)
})