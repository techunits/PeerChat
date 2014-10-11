var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));

app.get('/', function (httpRequest, httpResponse) {
	httpResponse.sendFile(__dirname + '/views/index.html');
});

io.sockets.on('connection', function(socket) {
    socket.on('message', function(message) {
        socket.broadcast.emit('message', message);
    });

   socket.on('chat', function(message) {
        socket.broadcast.emit('chat', message);
    });

    socket.on('create or join', function(room) {
        var numClients = io.sockets.clients(room).length;

        if (numClients === 0) {
            socket.join(room);
            socket.emit('created', room);
        }
        else if (numClients == 1) {
            io.sockets in (room).emit('join', room);
            socket.join(room);
            socket.emit('joined', room);
        }
        else {
            socket.emit('full', room);
        }
        
        socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
        socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
    });
});

server.listen(process.env.PORT || 3000);
console.log('Server is running on port: ' + (process.env.PORT || 3000));