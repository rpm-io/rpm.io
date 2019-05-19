var socket = require('socket.io-client');

class Client {

    constructor(uri){
        this.messages = [];
        this.listeners = {};
        this.ok = true;
        this.io = socket(uri);
    }

    start(){
        let response = this.wait('__self__').then((response)=> {
            let interval = setInterval(() => {
                if (!this.ok){
                    clearInterval(interval);
                } else {
                    if (this.messages.length) {
                        let message = this.messages.pop(0);
                        this.io.emit("message", message);
                    }
                }
            }, 1);
            return response;
        })
        
        this.io.on('message', (response) => {
            this.listeners[response.__id__](response);
        });
        
        this.io.on('error', (data) => {
            console.error("Err:", data.toString());
        });

        this.io.on('disconnect', (self) => {
            this.ok = false;
        });

        return response;
    }

    wait (__id__){
        return new Promise((done) => {
            this.listeners[__id__] = (response) =>{
                done(response)
            }
        })
    }

    send(message){
        message.__id__ = new Date().getTime();
        this.messages.push(message);
        return this.wait(message.__id__);
    }

    close(){
        return this.send({
            "com": "destroy"
        }).then((end) => {
            //console.log(end)
        });
    }

}


module.exports = Client ;