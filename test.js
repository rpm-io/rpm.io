let rpm = require('./rpm');

//Create a simple class
class A {
    constructor () { 
        this.attr1 = "hello"; 
        this.attr2 = [
            { attr1: this.attr1 },
            "attr2"
        ]
        this.attr3 = {
            hhh:{
                rrr:3,
                a: this.attr3
            }
        }
    }

    getObject(){
        return {
            ddd:111
        }
    }
    setAttr1 (attr1) { this.attr1 = attr1; }
    getAttr1 () { console.log("erere"); return this.attr1; }

    callbackable(cb){
        cb("hello callback", "main")
    }
}

//create a simple instance
let a = new A()

//import python os module
rpm.require_python('os')
.then(async (os) => {
    //export simple module
    let exported = rpm.exports(a, 8000)
    
    //wait 3s
    console.log("Server: waiting 3s...")
    await new Promise(resolve => setTimeout(resolve, 30000))

    //close conection
    console.log("Server: close conections")
    //exported.close()
}).catch(err => {
    console.log(err)
})

rpm.exports(a, 8001)
rpm.exports({
    a: () => 0,
    A
}, 8002)