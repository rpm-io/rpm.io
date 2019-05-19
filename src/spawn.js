var child_process = require('child_process');

class Spawn {

    constructor(exec, params){
        this.messages = [];
        this.listeners = {};
        this.ok = true;
        this.cmd = child_process.spawn(exec, params);
    }

    start(){
        let response = this.wait('__self__').then((response)=> {
            let interval = setInterval(() => {
                if (!this.ok){
                    clearInterval(interval);
                } else {
                    if (this.messages.length) {
                        let message = this.messages.pop(0);
                        this.cmd.stdin.write(JSON.stringify(message) + "\n");
                    }
                }
            }, 1);
            return response;
        })
        
        this.cmd.stdout.on('data', (data) => {
            let response = JSON.parse(data.toString());
            this.listeners[response.__id__](response);
        });

        
        this.cmd.stderr.on('data', (data) => {
            console.error("Err:", data.toString());
        });

        this.cmd.stdout.on('close', (self) => {
            this.cmd.stdin.end();
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


module.exports = Spawn ;