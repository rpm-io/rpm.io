import sys
import uuid
import json
from importlib import import_module

class Bind:

    __VARIABLES__ = {
        "END": "END"
    }

    def __init__(self):
        self.module = import_module(sys.argv[1])
        self.ok = True

    def declare(self, value):
        name = str(uuid.uuid1())
        self.__VARIABLES__[name] = value
        return name

    def var(self, name):
        if name:
            return self.__VARIABLES__[name]
    
    def var_from(self, name):
        if name in self.message:
            return self.var(self.message[name])

    def val_from(self, name):
        if name in self.message:
            return self.message[name]
    
    def init(self, clazz, params):
        return clazz(*params)

    def call(self, method, params):
        return method(*params)

    def command(self):
        self.message = json.loads(input())

    def is_primitive(self, data):
        if data:
            return not hasattr(self.var(data), "__dict__")
        return True

    def value_of(self, name):
        data = self.var(name)
        if data:
            return str(data)
        return data

    def type_of(self, data):
        if data:
            return str(type(self.var(data)))
        
    
    def show(self, data, __id__):
        print(json.dumps({
            "data": data,
            "type": self.type_of(data),
            "primitive": self.is_primitive(data),
            "value": self.value_of(data),
            "__id__": __id__
        }), flush=True)


    def run(self):
        self.show(self.declare(self.module), "__self__")
        while self.ok:
            self.command()     
            COMMAND = self.val_from('com')
            __id__ = self.val_from('__id__')
            if COMMAND == 'attr':
                variable = self.var_from('var')
                name = self.val_from('attr')
                if variable and name:
                    if hasattr(variable, name):
                        attr = getattr(variable, name)
                        self.show(self.declare(attr), __id__)
                    else:
                        self.show(None, __id__)
                
            if COMMAND == 'new':
                clazz = self.var_from('var')
                params = self.val_from('params')
                instance = self.init(clazz, params)
                self.show(self.declare(instance), __id__)

            if COMMAND == 'str':
                self.show(self.var_from('var'), __id__)

            if COMMAND == 'call':
                method = self.var_from('var')
                params = self.val_from('params')
                result = self.call(method, params)
                self.show(self.declare(result), __id__)
            
            if COMMAND == 'describe':
                self.show(self.var_from('var').__dict__, __id__)

            if COMMAND == 'destroy':
                self.ok = False
                self.show("END", __id__)

if __name__ == "__main__":
    Bind().run()
