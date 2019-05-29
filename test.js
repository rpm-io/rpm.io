let rpm = require('./rpm');

//Create a simple class
class A {
    constructor () { this.attr1 = "hello"; }
    setAttr1 (attr1) { this.attr1 = attr1; }
    getAttr1 () { return this.attr1; }
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
    exported.close()
}).catch(err => {
    console.log(err)
})
