const ParamValidator = require('./param-validator.min.js')
const peopleModel = {
    name:{
        type:String
    },
    things:{
        type:Array,
        items:{
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
        }
    }
}

const validator = new ParamValidator(peopleModel)

const person = {
    name:"Match",
    things:[{name:'',brand:'Apple'},{name:'Iphone',brand:'Apple'}]
}
console.log( validator.check(person) )// true