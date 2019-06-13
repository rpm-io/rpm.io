[![Express Logo](https://github.com/luismoralesp/rpm.io/raw/master/src/logo.png)](http://expressjs.com/)

Real-time polyglot microservice.

## Instalation

Install using npm:
```
$ npm install --save rpm.io-client
```
## Basic Use

Easy to use:


### Server
```javascript
let rpm = require('rpm.io');

let exported = rpm.exports({
    "attr1": "value1"
    "so":{
        "long":{
            "path":{
                "value": "XD"
            }
        }
    }
    "method1": () => "value2"
}, 8000)
```

### Client

```javascript
let rpm = require('rpm.io-client');

rpm.require_remote('http://localhost:8000')
.then(async (remote) => {
    await remote.attr1.__value__ //value1
    await remote.method1.__call__() //value2
    await remote.so.long.path.value.__value__ //XD
})
```
For know more about `rpm.io-client` click [here](https://www.npmjs.com/package/rpm.io-client)

## Object value

### Server
```javascript
let rpm = require('rpm.io');

let exported = rpm.exports({
    "myobject": {
        "foo": "var",
    }
}, 8000)
```

### Client

```javascript
let rpm = require('rpm.io-client');

rpm.require_remote('http://localhost:8000')
.then(async (remote) => {
    await remote.myobject.__obj__ //{ foo: "var" }
})
```

## Array value

### Server
```javascript
let rpm = require('rpm.io');

let exported = rpm.exports({
    "myarray": [
        "foo", "var"
    ]
}, 8000)
```

### Client

```javascript
let rpm = require('rpm.io-client');

rpm.require_remote('http://localhost:8000')
.then(async (remote) => {
    await remote.myarray[0] // foo
    await remote.myarray[1] // var
    await remote.myarray.length // 2
    await remote.myarray.__obj__ // [ "foo", "var" ]
})
```

## Class value

### Server
```javascript
let rpm = require('rpm.io');

class MyClass {
    attr1 = "value1"
    
    constructor(){
        this.attr1 = "value3"
    }

    method1(){
        return "value2"
    }
}
let exported = rpm.exports({
    "MyClass": Myclass
}, 8000)
```

### Client

```javascript
let rpm = require('rpm.io-client');

rpm.require_remote('http://localhost:8000')
.then(async (remote) => {
    await remote.MyClass.attr1.__value__ //value1
    await remote.MyClass.method1.__call__() //value2

    let instance = await remote.MyClass.__call__() 
    await instance.attr1.__value__ //value3
    
})
```

## Realtime
Now you can subscribe to an object to give feedback in realtime

### Server
```javascript
let rpm = require('rpm.io');

let exported = rpm.exports({
    counter: 0,
    start(){
        setInterval(() => {
            this.counter++
        }, 1000)
    }
}, 8000)
```

### Client

```javascript
let rpm = require('rpm.io-client');

rpm.require_remote('http://localhost:8000')
.then(async (remote) => {
    remote.__subscribe__({
        counter: (newValue) =>{
            console.log(newValue)
        }
    })

    remote.start.__call__()
})
```

### Result

```
    1
    2
    3
    4
    5
```