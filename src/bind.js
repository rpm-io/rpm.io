let socket = require('./socket');
const uuidv1 = require('uuid/v1');

class Bind {
    
    constructor(modules){
        this.__VARIABLES__ = {
            "END": "END"
        }
        this.modules = modules;
    }
    
    declare(value) {
        let name = uuidv1()
        this.__VARIABLES__[name] = value
        return name

    }
    
    get_var(name) {
        if (name){
            return this.__VARIABLES__[name]
        }
    }
    
    var_from(name) {
        if (name in this.message){
            return this.get_var(this.message[name])
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
    
    value_of(name){
        let data = this.get_var(name)
        if (data){
            return new String(data).toString()
        }
        return data

    }
    
    type_of(data){
        if (data){
            return typeof data;
        }
    }
    
    show(socket, data, __id__){
        socket.emit("message", {
            "data": data,
            "type": this.type_of(this.get_var(data)),
            "primitive": this.is_primitive(this.get_var(data)),
            "value": this.value_of(data),
            "__id__": __id__
        })
    }
    
    run(port){
        
        socket.start(
            port,
            (socket) => {
                this.show(socket, this.declare(this.modules), "__self__")
            },
            (socket, message) => {
            this.message = message;

            let COMMAND = this.val_from('com')
            let __id__ = this.val_from('__id__')
            
            if (COMMAND == 'attr'){
                
                let variable = this.var_from('var')
                let name = this.val_from('attr')
                if (variable && name){
                    if (name in variable){
                        let attr = variable[name];
                        if (attr instanceof Function) {
                            attr = attr.bind(variable);
                        }
                        this.show(socket, this.declare(attr), __id__)
                    }else{
                        this.show(socket, null, __id__)
                    }
                }
            }
            if (COMMAND == 'new'){
                let clazz = this.var_from('var')
                let params = this.val_from('params')
                let instance = this.init(clazz, params)
                this.show(socket, this.declare(instance), __id__)
            }
            if (COMMAND == 'str'){
                this.show(socket, this.var_from('var'), __id__)
            }
            if (COMMAND == 'call'){
                let method = this.var_from('var')
                let params = this.val_from('params')
                let result = this.call(method, params)
                this.show(socket, this.declare(result), __id__) 
            }
            if (COMMAND == 'describe'){
                this.show(socket, this.var_from('var').__dict__, __id__)
            }
            if (COMMAND == 'destroy'){
                this.show(socket, "END", __id__)
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