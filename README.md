# Param-Validator.js
* Author: [MatchOvO](https://github.com/MatchOvO/)
* Repository: [param-validator.js](https://github.com/MatchOvO/param-validator.js)
* An easy and lightweight way to validate params in Javascript Object.
You can use it to validate the http request data in Node.js or the form data in web
min.js is less than 10k, so that you can use it in your project without any burden.
And ParamValidator.js can distinguish such as "Object","Array","null".
All you need to do is to define a "dataModel" in a simple way like:
```js
const dataModel = {
    string:{
        type:String,
        regexp:/[A-Z]+/
    },
    number:{
        type:Number,
        int:true,
        range:{
            "<=":9,
            ">":0
        }
    },
    obj:{
        type:Object
    },
    array:{
        type:Array
    }
}
```
* [Easy Start](#easy-start)
* [API](#api)
## Easy Start
### Install (安装)
```
npm install param-validator.js
```

### import (导入)
```js
const ParamValidator = require('param-validator.js')
```

### construct validator model (构建校验模型)
```js
const dataModel = {
    name:{
        type:String
    },
    age:{
        type:Number
    }
}
const validator = new ParamValidator(dataModel)
```

### quick validate(快速校验)
```js
const data = {
    name:'match',
    age:20
}
const result = validator.test(data)
console.log(result)// return 'true' when data is matched width dataModel
```
## API
* [ParamValidator](#paramvalidator) `constructor`
  * [ParamValidator.typeof()](#paramvalidatortypeofval)
  * [ParamValidator.isType()](#paramvalidatoristypevaltype)
  * [ParamValidator.deepClone()](#paramvalidatordeepclonecopyobjectnewobject)
* [Data Model](#data-model) `dataModel`
  * [basic](#basic)
  * [String](#string)
  * [Number](#number)
  * [Boolean](#boolean)
  * [Object](#object)
  * [Array](#array)
  * [Class](#class)
  * [others](#others)
* [validator](#validator-instance) `instance`
  * [validator.test()](#validatortestobject)
  * [validator.construct()](#validatorconstructoriobject)
  * [validator.check()](#validatorcheckobject)
### ParamValidator
* #### ParamValidator.typeof(val)
  * Params:
    * `val`: value that you want to check
  * Return:
    * `String`:
      * 'String'
      * 'Number'
      * 'Boolean'
      * 'Object'
      * 'Array'
      * 'undefined'
      * 'null'
      * className
> provide a method to identity the type of value,you can use it identity the type above.
  You also can use it to check an instance's constructor
```js
console.log(ParamValidator.typeof(1))// 'Number'
console.log(ParamValidator.typeof('match'))// 'String'
console.log(ParamValidator.typeof([]))// 'Array'

class Person {
    
}
const person = new Person()
console.log(ParamValidator.typeof(person))// 'Person'
```
* #### ParamValidator.isType(val,type)
    * Params:
        * `val`: value that you want to check
        * `type`: the type you want to check,you can provide `constructor` or `String` here
          * `String`
          * `Number`
          * `Boolean`
          * `Object`
          * `Array`
          * `undefined`
          * `null`
    * Return:
        * `Boolean`
> provide a method to check if a value can match the type you give
  
> Warn: `null` and `Object` is not matched in this method,although they have some connection between them
```js
console.log(ParamValidator.isType(1,Number))// true
console.log(ParamValidator.isType('1',Number))// false

class Person {

}
const person = new Person()
console.log(ParamValidator.isType(person,Person))// true
```
* #### ParamValidator.deepClone(copyObject,newObject)
    * Params:
        * `copyObject`: the Object you want to clone
          * required: true
        * `newObject`: the Object you want to clone in
          * required: false
    * Return:
        * `Object`: the new Object
> provide a method to deep clone an Object

> Warn: not sure this method will be provided in the future version.

### Data Model

Q: What is Data Model?
> Data Model is the format of a kind of data. Validator uses Data Model to validate the params in data.
> Or you can say Data Model is the description of a kind of data. 
> 
> For example: {name:"Match",age:20} is an data,and his Data Model can be
> "An Object contains 'name' and 'age' these two params, and 'name' needed as String,'age' needed as Number "
> 
> You can follow this doc to create a Data Model for validator
* #### basic
  * `type`: `Type | Type-Array`
    * To specify the type of param
      * `Number`
      * `String`
      * `Boolean`
      * `Object`
      * `Array`
      * `Class`
      * `undefined`
      * `null`
  * `required`: `Boolean`
    * To specify if the param is required 
    * default: `true`
  * `default`: `any`
    * In this field, you can provide a default value. The field will be filled when the data has no value of this field
```js

const dataModel = {
    name:{
        type:String,
        required:true
    },
    age:{
        type:Number,
        required:false
    },
    score:{
        type:[Number,String]// it can be Number or String
        default: 60
    }
}
const validator = new ParamValidator(dataModel)

const data1 = {
    name:'Match',
    age:20,
    score:'A+'
}
const data2 = {
    name:'Match',
    score:90
}

console.log( validator.test(data1) ) // true
console.log( validator.test(data2) ) // true
```
> When a param specify more than one type,such as { type: [Number,Array] } It is not suggested to use the special config that is written below.
> If you read the source code which is easy, and understand how it works, I will suggest you to use the special config below to help improve your project
* #### String
    * `range`: `Array | val`
        * The specific value the param can be, you can provide an Array or single value
        * The value in Array is suggested to be Number, String or Boolean
    * `regexp`: `RegExp`
        * To specify the RegExp that param need to match
        * default: `true`
```js
const dataModel = {
    name:{
        type:String,
        regexp:/^[A-Z]/
    },
    score:{
        type:String,
        range:['A+','A','B+','B','C+','C']
    }
}

const validator = new ParamValidator(dataModel)

console.log(validator.test({
    name:'Match',
    score:'A+'
}))// true
```

* #### Number
    * `range`: `Array | Object | val`
        * The specific value the param can be, you can provide an Array or single value. When type is Number, you can use an Object to describe the range of Number
          * `rangeObject`: `<`,`>`,`<=`,`>=`
        * The value in Array is suggested to be Number, String or Boolean
    * `int`: `Boolean`
        * To specify the value must be int or not(the int here is not a real int. For example,`90.0` is also an int here)
        * default: `false`
```js
const dataModel = {
    score:{
        type:Number,
        int:true,
        range:{
            "<=":100,
            ">":0
        }
    }
}

const validator = new ParamValidator(dataModel)

console.log(validator.test({
    score:90
}))// true
```
* #### Boolean
    * `range`: `Array | val`
        * The specific value the param can be, you can provide an Array or single value.
* #### Object
    * `items`: `Object`
        * Using this param, you can provide the children of this Object. You can also use Data Model to match these children.
      [param-validator.js]() make a promise that `emitter` in validator will do recursion to reach the whole Data Model
```js
const peopleModel = {
    person:{
        type:Object,
        items:{
            name: {
                type:"String"
            },
            age: {
                type:[String,Number]
            },
            things:{
                type:Object,
                items:{
                    tool:{
                        type:String
                    },
                    lunch:{
                        type:String
                    }
                }
            }
        }
    }
}

const validator = new ParamValidator(peopleModel)

console.log(validator.test({
    person:{
        name:"Match",
        age:20,
        things:{
            tool:"MacBook",
            lunch:"rice"
        }
    }
}))// true
```
* #### Array
    * `items`: `Object`
        * Using this param, you can provide a Data Model to validate the children of this Array. 
      >Warn: The items here is different with [items](#object) in Object
```js
const peopleModel = {
    name:{
        type:String
    },
    things:{
        type:Array,
        items:{
            type:Object,
            items:{
                name: {
                    type:String
                },
                brand:{
                    type:String
                }
            }
        }
    }
}

const validator = new ParamValidator(peopleModel)

const person = {
    name:"Match",
    things:[{name:'MacBook',brand:'Apple'},{name:'Iphone',brand:'Apple'}]
}
console.log( validator.test(person) )// true
```
* #### Class
    > When type is a class, [param-validator.js]() also can accept it and validate if the object is the instance of the class. 
But you can not set items to do recursion inside the object. Because it is not necessary and it's dangerous. If you did need that, please use type `Object` 
```js
class Person {
    constructor(name,age){
        this.name = name
        this.age = age
    }
}

const dataModel = {
    person:{
        type:Person
    }
}
const validator = new ParamValidator(dataModel)

const person = new Person('Match',20)
const data = {
    person
}

console.log( validator.test(data) )// true
```
* #### others
  * `type`: `undefined | null`
  * Usage: Sometime we use `null` to release an Object. It can be used to detect if one of the params become `undifined` or `null`.
  >   🔬Warn: It doesn't suggest you to fully dependent on `undefined`,`null` as type at now version., Because it is at experiment stage.

### validator `instance`
* #### validator.test(Object)
    * Params:
        * `Object`: the object you want to validate
    * Return:
        * `Boolean`
> provide a method to validate if the object can match the data model you give
```js
const result = validator.test(data)
console.log(result) // true | false
```
* #### validator.construct(oriObject)
    * Params:
        * `oriObject`: the object you want to validate and construct
    * Return:
        * `newObject`: a new object that is constructed by validator
    * Error:
      * When the object you provided is not matched the Data Model, it will throw an error when the method is called.
> provide a method to construct and complete the object you provided. But it will not change your origin object.
```js
const dataModel = {
    name:{
        type:String,
        regexp:/^[A-Z]/
    },
    age:{
        type:[Number,String],
        required:false,
        int:true,
        range:{
          ">=":0,
          "<":200  
        },
        default:18
    }
}
const validator = new ParamValidator(dataModel)
const oriObj = {
    name: 'Match'
}
const newObj = validator.construct(oriObj)
console.log(newObj)// {name:"Match",age:18}
```
* #### validator.check(Object)
    * Params:
        * `Object`: the object you want to validate
    * Return:
        * `Object` (When success)
          * result: `true`
          * data: `Object`
        * `Object` (When error)
          * result: `false`
          * errorModule: `String`
          * errorField: `String`
          * errorType: `String`
          * msg: `String`
 ```js
/**
     * Error Type
     *  -required   必须的字段为空
     *  -type       类型错误
     *  -regexp     字符串正则错误
     *  -range      值的范围错误
     *  -int        数值整形错误
     *  -model      数据模型错误
     *  -unknown    未知错误
     *  
     * Error Module
     *  -emitter    触发器下的错误
     *  -stringV    字符串校验器的错误
     *  -numberV    数值类型校验器的错误
     *  -objectV    对象校验器的错误
     *  -arrayV     数组校验器的错误
     *  -booleanV   布尔值校验器的错误
     *  -emptyV     空值类型校验器的错误（undefined，null）
     *  -classV     类校验器的错误
     */
```
> provide a method to validate if the object can match the data model you give and construct a new object just like [construct()](#validatorconstructoriobject).
And return more detail message when validate fail. Through this you can locate the reason more conveniently, and provided more specific error reasons to frontend when you use param-validator.js as validator in http server
```js
const dataModel = {
    name:{
        type:String,
        regexp:/^[A-Z]/
    },
    age:{
        type:[Number,String],
        required:false,
        int:true,
        range:{
            ">=":0,
            "<":200
        },
        default:18
    }
}
const validator = new ParamValidator(dataModel)
const oriObj = {
    name: 'Match'
}
const checkReturn = validator.check(oriObj)
console.log(checkReturn)
/**
 * {
 *      result:true,
 *      data:{
 *          name:"Match",
 *          age:18
 *      }      
 * }
 */
```

