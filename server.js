var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.set('port', (process.env.PORT || 3000));
app.use(express.static(__dirname + '/public'));

app.get('/', function (httpRequest, httpResponse) {
	httpResponse.sendFile(__dirname + '/views/index.html');
});

//	complete userlist
var userList = [];

io.sockets.on('connection', function(socket) {
	console.log('New Socket Client: ' + socket.id);
	
	socket.emit('PC:USERCOUNT', {
		message: 'There are ' + userList.length + ' online users in this room!!!',
	});
	
	socket.on('PC:JOIN', function(info) {
		//	broadcast joining message to everyone in the room if new user
		if(! userList[socket.id]) {
			console.log(info.nickname + ' joined to room ' + info.room);
			socket.broadcast.emit('PC:BROADCAST', {
				message: info.nickname + ' joined to this room just now!!!',
				nickname: info.nickname
			});
			
			//	emit welcome event to the current user
			socket.emit('PC:WELCOME', {
				message: 'Welcome ' + info.nickname + ' to this room!!!',
			});
		}
		else {
			console.log(info.nickname + ' re-joined to room ' + info.room);
		}
		
		userList[socket.id] = info.nickname;
	});
   
	
	socket.on('PC:CHAT', function(info) {
		socket.broadcast.emit('PC:CHAT_BROADCAST', {
			message: info.message,
			nickname: userList[socket.id]
		});
		
		socket.emit('PC:CHAT_BROADCAST', {
			message: info.message,
			nickname: userList[socket.id],
			self: true
		});
	});
	
	socket.on('PC:DISCONNECT', function(info) {
		if(userList[socket.id]) {
			socket.broadcast.emit('PC:BROADCAST', {
				message: userList[socket.id] + ' left the chat room!!!',
				nickname: userList[socket.id]
			});
		}
	});
	
    /*socket.on('create or join', function(room) {
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
    });*/
});

server.listen(process.env.PORT || 3000);
console.log('Server is running on port: ' + (process.env.PORT || 3000));