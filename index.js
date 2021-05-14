express = require('express.io')

app = express().http().io()

var totalConnection = 0;
var state = {
    playerId1: 0,
    playerId2: 0,
    xmov: ((Math.random() > 0.5) ? 1 : -1),
    ymov: ((Math.random() > 0.5) ? 1 : -1)
};

app.io.route('updateDate', function(req) {
    req.io.broadcast('updateDate', req.data)
})

app.io.route('scoreUpdate', function(req) {
    req.io.broadcast('scoreUpdate', req.data)
})

app.io.sockets.on('connection', function(socket) {
    console.log("connected");
    totalConnection++;
    if (!state.playerId1) {
        console.log("Player1 connected");
        state.playerId1 = socket.id;
    } else if (!state.playerId2) {
        console.log("Player2 connected");
        state.playerId2 = socket.id;

    }
    var playerID = (state.playerId1 == socket.id) ? 1 : 2;

    socket.emit('environment', {
        myPong: {
            xmov: state.xmov,
            ymov: state.ymov
        },
        player: {
            id: socket.id
        }
    });

    if (state.playerId2 && state.playerId1) {
        app.io.broadcast('startGame', state)
    }

    socket.on('disconnect', function() {
        totalConnection--;
        if (socket.id == state.playerId1) {
            state.playerId1 = 0;
        }
        if (socket.id == state.playerId2) {
            state.playerId2 = 0;
        }
    });

});

// Send client html.
app.get('/', function(req, res) {
    res.sendfile(__dirname + '/pong.html')
})

app.listen(12345)