const Spawn = require('./src/spawn');
const Bind = require('./src/bind');
const proxy = require('./src/proxy')

function require_python(path){
    let spawn = new Spawn("python", [__dirname + "\\src\\bind.py", path]);
    return spawn.start().then((self) => {
        return proxy(self, spawn)
    }).finally(() => {
        spawn.close();
    });
}

function exports(modeules, port) {
    return new Bind(modeules).run(port);
}


module.exports = { require_python, exports };