const ParamValidator = require('./param-validator.js')
const peopleModel = {
    name:{
        type:[String,Number]
    },
    things:{
        type:[Array,Object],
        arrItems:{
            type:Object,
            objItems:{
                name: {
                    type:String,
                    empty: false
                },
                brand:{
                    type:String
                }
            }
        },
        objItems:{
            test: {
                type: String,
                empty: false
            }
        }
    }
}

const validator = new ParamValidator(peopleModel)

const person = {
    name:"Match",
    things:[{name:'Macbook',brand:'Apple'},{name:'Iphone',brand:'Apple'}]
}
const person2 = {
    name:0,
    things:{
        test:''
    }
}
console.log( validator.check(person) )// true