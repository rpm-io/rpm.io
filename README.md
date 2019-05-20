[![Express Logo](https://github.com/luismoralesp/rpm.io/raw/master/src/logo.png)](http://expressjs.com/)

Real-time polyglot microservice.

[![NPM Version][npm-image]][npm-url]

## Instalation

Install using npm:
```
$ npm install --save rpm.io
```
## Use

Easy to use:

### Server
```javascript
let rpm = require('rpm');

let exported = rpm.exports({
    "attr1": "value1"
}, 8000)
```

### Client

```javascript
let rpm = require('rpm.io/rpm');

rpm.require_remote('http://localhost:8000')
.then(async (remote) => {
    await remote.attr1 //value1
})
```

## Poliglot

### Python

```python
# myclass.py

class MyClass:
    attr1 = "value1"
```

### Javascript
```javascript
let rpm = require('rpm.io/rpm')

rpm.require_python('myclass')
.then(async (myclass) => {
    await myclass.attr1 //value1
})
```