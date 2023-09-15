# Param-Validator.js
* Author: [MatchOvO](https://github.com/MatchOvO/)
* Repository: [param-validator.js](https://github.com/MatchOvO/param-validator.js)
* More information and doc in (https://paramvalidator.chenzs.com)
* Current Version: `1.4.0`
* An easy and lightweight way to validate params in Javascript Object.
You can use it to validate the http request data in Node.js or the form data in web
min.js is less than 10k, so that you can use it in your project without any burden.
And ParamValidator.js can distinguish such as "Object","Array","null".
All you need to do is to define a "dataModel" in a simple way like:
```js
const dataModel = {
    anString: String,
    anNumber: Number,
    anObject: Object
}
```
Or more specific config like:
```js
const dataModel = {
    anString:{
        type:String,
        regexp:/[A-Z]+/
    },
    anNumber:{
        type:Number,
        int:true,
        range:{
            "<=":9,
            ">":0
        }
    },
    anObject:{
        type:Object
    },
    anArray:{
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
    name: String,
    age: Number
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
console.log(result)// return 'true' when data is matched with dataModel
```
## API
* [ParamValidator](#paramvalidator) `constructor`
  * [ParamValidator.typeof()](#paramvalidatortypeofval)
  * [ParamValidator.isType()](#paramvalidatoristypevaltype)
  * [ParamValidator.deepClone()](#paramvalidatordeepclonecopyobjectnewobject)
* [Data Model](#data-model) `dataModel`
  * [simple model](#simple-model)
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
* [Custom Function](#custom-function)
* [Built-in Model](#built-in-model)
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
* #### simple model
  * After the version of 1.2.0
  * You can specify a simple type or built-in model below for a field:
      * `Number`
      * `String`
      * `Boolean`
      * `Object`
      * `Array`
      * `Class`
      * `undefined`
      * `null`
      * `Built-in Model`(after Version 1.4.0) More details in [Built-in Model](#built-in-model)
  * You can construct a data model with a simple way like:
```js
const { Email, Phone } = ParamValidator
const userModel_1 = {
    name: String,
    age: Number,
    email: Email,
    phone: Phone
}

// You can also use an Array, this means the param can be a Number or a String
// WARN: you can not use built-in model like "Email, Phone..." in Array in now version, but it will be published in the future version
const userModel_2 = {
    name: String,
    age: [Number, String]
}
```
> This way to construct a data model is very simple and quick. 
> If you don't need to specify other specific option, you are suggested to use this way.
> 
> You can mix the simple way and the complex way when you construct a data model, it is allowed and welcomed
```js
const personModel = {
    name: String,
    age: {
        type: [Number, String],
        int: true
    }
}
```

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
  * `custom`: `Function` (after Version 1.4.0)
    * To give validator a custom function to validate field, the function need a return value that must be Boolean type (true or false). `false` means that the value fail to pass the validation, `true` means the opposite.
    * custom function tools: contains some built-in functions that you can use in the custom function
    * More details see [Custom Function](#custom-function)
  * `default`: `any`
    * In this field, you can provide a default value. The field will be filled when the data has no value of this field
    > ATTENTION: 1.`default` option only works when `required` is `false` 2.the priority of the value specified by `default` is higher than `undefined`, which means if the validated value is `undefined` and you specify a default value, the default value will cover the value of `undefined`
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
        type:[Number,String],// it can be Number or String
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
> When a param specify more than one type,such as { type: [ Number, Array ] } 
> You also can use the option blow.
* #### String
    * `range`: `Array | val`
        * The specific value the param can be, you can provide an Array or single value
        * The value in Array is suggested to be Number, String or Boolean
    * `regexp`: `RegExp`
        * To specify the RegExp that param need to match
        * default: `true`
    * `empty`: `Boolean` (After Version 1.3.0)
      * To specific the if the String can be an empty String
    * `length`: `Number` (After Version 1.3.0)
      * To specific the length of the String, is validate by the property [String: length](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/length)
    * `maxLen`: `Number` (After Version 1.3.0)
      * To specific the max length of the String
    * `minLen`: `Number` (After Version 1.3.0)
      * To specific the min length of the String
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
    * `isNaN`: `Boolean` (After Version 1.3.0)
      * To specify the value is [NaN](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/NaN) or not
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
    * `objItems`: `Object` (After Version 1.1.0)
      * This property's function is the same as "items". 
> In order to distinguish "items" in Object and Array, we add `objItems | arrItems` you can use after the version of 1.1.0. 
We recommend you to use this property when a data model you set can be Object or Array( type: [Object,Array] )
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
    * `arrItems`: `Object` (After Version 1.1.0)
      * This property's function is the same as "items".
> In order to distinguish "items" in Object and Array, we add `objItems | arrItems` you can use after the version of 1.1.0.
We recommend you to use this property when a data model you set can be Object or Array( type: [Object,Array] )
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
     *  -empty      字符串为空错误
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

### Custom Function
> Through this way, you can fully customize your validator to create more complicated and more personal validation rules
* An model property: `custom`: `Function(value, key, config, data)` (after Version 1.4.0)
    * To give validator a custom function to validate field, the function need a return value that must be Boolean type (true or false). `false` means that the value fail to pass the validation, `true` means the opposite.
    * custom function tools: contains some built-in functions that you can use in the custom function
#### Usage
* In this option when you define a data model, you should give a function that must contain a return value which is type of `Boolean`. 
* When your custom function return `true`, it means
* param:
  * value: the value of the field
  * key: the key of the value, you figure out which field you are validating
  * config: you can get the completed config of the data model
  * data: you can get the whole data that you are validating
* custom function tools: you can use `this` to get an object containing some method you can use to make some change on the value of the data or something else, it will be more and more method constantly added in. 
  * alter(newValue: `Any`)
    * you can use this method to change the value that you are validating
  * alterConfig(field: `String`, value: `Any`)
    * you can use this method to change any option in the model config that you are validating
  * ignore()
    * if you call this function in custom function, all the validation procedure will be ignored including the validation of type. And that means you don't need to specific any option except the custom function in data model if you decide to use this method. All the work need to be done by your custom function.
  * ParamValidator
    * you can access all the method provided by ParamValidator
```js
const peopleModel = {
    name:{
        type: String,
        custom: function(name) {
            const newName = name.toUpperCase()
            this.alter(newName)
            if (newName === 'MATCH') {
                this.alterData('age', 20)
            }
            return true;
        }
    },
    age:{
        type: Number,
        // if number is not an even then it can't pass the validation
        custom(age) {
            if (age % 2 !== 0) return false
            return true
        }
    }
}

const validator = new ParamValidator(peopleModel)

const person = {
    name:'Match',
    age:18
}
console.log( validator.check(person) )// true
```

### Built-in Model
> ParamValidator provided some Built-in Models, it can help you create data model faster and more conveniently. Built-in Model is essentially a config of data model, which is defined by the ParamValidator author. And the number of Built-in Model will be expended more and more in the future.

After Version 1.4.0

Example of usage:
```js
const ParamValidator = require('param-validator.js')
const {UserName, Password, Email, Phone, Integer} = ParamValidator
const userModel = {
    username: UserName,
    password: Password,
    email: Email,
    phone: Phone,
    age: Integer
}
const userValidator = new ParamValidator(userModel)
const user1 = {
    username: 'Match_OvO',
    password: 'Match_12345',
    email: '1033085048@qq.com',
    phone: '+861234567890123',
    age: 20
}
console.log(userValidator.test(user1)) //true
```

List of Built-in Models:
* Email: `String`
* Url: `String`
* IP: `String`
* ChineseWord: `String`
* Base64: `String`
* Phone: `String`
* Html: `String`
* IntString: `String`
* FloatString: `String`
* UserName: `String`
* Password: `String`
* Integer: `Number`
* Float: `Number`
* Odd: `Number`
* Even: `Number`

### RegexpLibrary
Usage:
```js
const {regexpLibrary} = require('param-validator.js')
```
```
{
    email: /^\w{3,}(\.\w+)*@[A-z0-9]+(\.[A-z]{2,5}){1,2}$/,
    url: /[a-zA-z]+:\/\/[^\s]*/,
    IP: /((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)/,
    ChineseWord: /[\u4e00-\u9fa5]/,
    base64: /[\/]?([\da-zA-Z]+[\/+]+)*[\da-zA-Z]+([+=]{1,2}|[\/])?/,
    phone: /^\d{11}$/,
    html: /^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/,
    intString: /^[0-9]+$/,
    floatString: /^[0-9]+\.[0-9]+$/,
    userName: /^[a-zA-Z0-9_]{4,16}$/,
    password: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+]).{8,}$/
}
```

