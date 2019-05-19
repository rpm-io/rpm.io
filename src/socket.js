
class Socket {
    constructor(){
        this.app = require('express')();
        this.http = require('http').Server(this.app);
        this.io = require('socket.io')(this.http);        
    }

    start(port, init, callback){
        
        this.io.on('connection', (socket) => {
            init(socket);
            socket.on('message', (data) => {
                callback(socket, data);
            })
        });

        this.io.on('disconnected', () => {
            console.log("connection lost")
        })
        
        this.http.listen(port, function () {
            console.log('unit is listenning in', port);
        });
    }

    close (){
        this.io.close(true)
    }
}

module.exports = new Socket();
