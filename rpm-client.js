
/**
 * Simple socket io client
 */
class Client {

    constructor(uri){
        this.messages = [];
        this.listeners = {};
        this.ok = true;
        this.io = io(uri);
        this.time = 0;
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
        message.__id__ = new Date().getTime() + '%' + (++this.time);
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

/**
 * RPM 
 */


function proxy(self, spawn) {
    let proxify = (response) => {
        if (response && !response.primitive){
            return proxy(response, spawn)
        } else{
            return response.value
        }
    }
    self.call = function() {
        return spawn.send({
            "com": "call",
            "var": self.data,
            "params": Array.prototype.slice.call(arguments)
        }).then(proxify)
    }

    self.close = function(){
        spawn.close();
    }
    
    self.newInstance = function() {
        return spawn.send({
            "com": "new",
            "var": self.data,
            "params": Array.prototype.slice.call(arguments)
        }).then(proxify)
    }
    return new Proxy(self, {
        get(self, name) {
            if (!self[name]){
                return spawn.send({ 
                    "com": "attr", 
                    "var": self.data,
                    "attr": name 
                }).then(proxify);
            }
            return self[name];
        }
    });
 
}

function require_remote(uri){
    let client = new Client(uri);
    return client.start().then((self) => {
        return proxy(self, client)
    })
}

