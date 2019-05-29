let socket = require('./socket');
const uuidv1 = require('uuid/v1');
const { watch } = require('watchjs');

class Bind {
    
    constructor(modules){
        this.__VARIABLES__ = { "END": "END" };
        this.modules = modules;
    }
    
    declare(value, path) {
        let name = this.get_by_path(path);
        if (!name){
            name = uuidv1();
        }
        this.__VARIABLES__[name] = { value, path : (path ? path:name) };
        return name
    }


    get_by_path(path){
        for (let name in this.__VARIABLES__){
            if (this.__VARIABLES__[name].path == path){
                return name;
            }
        }
    }

    subscribe(socket, name, __id__) {
        watch(this.modules, name, (prop, action, newvalue, oldvalue) => {
            this.show(socket, name, newvalue, __id__);
        })
        return name;
    }
    
    get_var(name) {
        if (name){
            return this.__VARIABLES__[name].value
        }
    }

    get_path(name) {
        if (name){
            return this.__VARIABLES__[name].path
        }
    }
    
    var_from(name) {
        if (name in this.message){
            return this.get_var(this.message[name])
        }
    }
    
    path_from(name) {
        if (name in this.message){
            return this.get_path(this.message[name])
        }
    }
    
    subscribe_from(socket, name, __id__) {
        if (name in this.message){
            return this.subscribe(socket, this.message[name], __id__)
        }
    }
    
    val_from(name) {
        if (name in this.message){
            return this.message[name]
        }
    }
    
    init(clazz, params){
        return clazz(...params)

    }
    
    call(method, params){
        return method(...params)
    }
    
    is_primitive(data){
        if (data) {
            return (
                (typeof data === 'string' || data instanceof String)
                ||
                (!isNaN(data))
            );
        } 
        return true;
    }
    
    value_of(data){
        if (data){
            return new String(data).toString()
        }
        return data

    }
    
    type_of(data) {
        if (data){
            return typeof data;
        }
    }

    show(socket, name, value, __id__){
        Promise.resolve(value).then(value => {
            socket.emit("message", {
                "data": name,
                "type": this.type_of(value),
                "primitive": this.is_primitive(value),
                "value": this.value_of(value),
                "__id__": __id__
            })
        })
    }
    
    show_var(socket, name, __id__) {
        let value = this.get_var(name);
        this.show(socket, name, value, __id__)
    }
    
    run(port){
        
        socket.start(
            port,
            (socket) => {
                this.show_var(socket, this.declare(this.modules, "HOME"), "__self__")
            },
            (socket, message) => {
            this.message = message;

            let COMMAND = this.val_from('com')
            let __id__ = this.val_from('__id__')
            
            if (COMMAND == 'attr'){
                
                let variable = this.var_from('var')
                let path = this.path_from('var')
                let name = this.val_from('attr')
                if (variable && name){
                    if (name in variable){
                        let attr = variable[name];
                        if (attr instanceof Function) {
                            attr = attr.bind(variable);
                        }
                        this.show_var(socket, this.declare(attr, `${path}/${name}`), __id__)
                    }else{
                        this.show_var(socket, null, __id__)
                    }
                }
            }else
            if (COMMAND == 'new'){
                let clazz = this.var_from('var')
                let params = this.val_from('params')
                let instance = this.init(clazz, params)
                this.show_var(socket, this.declare(instance), __id__)
            }else
            if (COMMAND == 'str'){
                this.show_var(socket, this.var_from('var'), __id__)
            }else
            if (COMMAND == 'call'){
                let method = this.var_from('var')
                let params = this.val_from('params')
                let result = this.call(method, params)
                this.show_var(socket, this.declare(result), __id__) 
            }else
            if (COMMAND == 'describe'){
                this.show_var(socket, this.var_from('var').__dict__, __id__)
            }else
            if (COMMAND == 'subscribe'){
                this.subscribe_from(socket, 'var', __id__)
            }else
            if (COMMAND == 'destroy'){
                this.show_var(socket, "END", __id__)
                socket.disconnect();
            }
        });
        return this;
    }

    close(){
        socket.close()
    }
}

module.exports = Bind;