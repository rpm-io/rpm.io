let rpm = require('./rpm');
const assert = require('assert');

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
    await new Promise(resolve => setTimeout(resolve, 3000))

    //close conection
    console.log("Server: close conections")
    exported.close()
}).catch(err => {
    console.log(err)
})

//import remote object from client 1
rpm.require_remote('http://localhost:8000')
.then(async (remote) => {
    //call setAttr1 to set a new value
    console.log("Client 1: setting new value 'Hello word!'")
    await (await remote.setAttr1).call("Hello word!");

    //call getAttr1 to get current value
    console.log("Client 1: getting current value")
    let hello = await (await remote.getAttr1).call()
    console.log("Client 1: the current value is '" + hello + "'");

    //verify the value match
    console.log("Client 1: verifying value...")
    assert.equal(hello, a.getAttr1())
    console.log("Client 1: value is correct!")

    //close conection
    remote.close()
}).catch(err => {
    console.log(err)
})

//import remote object from client 2
rpm.require_remote('http://localhost:8000')
.then(async (remote) => {
    //wait for changes in client 1 
    console.log("waiting 2s...")
    await new Promise(resolve => setTimeout(resolve, 2000))

    //call getAttr1 to get current value
    console.log("Client 2: getting current value")
    let hello = await (await remote.getAttr1).call()
    console.log("Client 2: the current value is '" + hello + "'");

    //verify the value match
    console.log("Client 2: verifying value...")
    assert.equal(hello, a.getAttr1())
    console.log("Client 2: value is correct!")
    
    //close conection
    remote.close()
}).catch(err => {
    console.log(err)
})