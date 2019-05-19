let Spawn = require('./src/spawn');
let Client = require('./src/client');
let Bind = require('./src/bind');

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

function require_python(path){
    let spawn = new Spawn("python", [__dirname + "\\src\\bind.py", path]);
    return spawn.start().then((self) => {
        return proxy(self, spawn)
    }).finally(() => {
        spawn.close();
    });
}

function exports(modeules, port){
    return new Bind(modeules).run(port);
}

function require_remote(uri){
    let client = new Client(uri);
    return client.start().then((self) => {
        return proxy(self, client)
    })
}

module.exports = { require_python, require_remote, exports };