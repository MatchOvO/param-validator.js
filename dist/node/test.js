const ParamValidator = require('./param-validator.js')
const peopleModel = {
    name:String,
    age:[Number,String],
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
    name:'Match',
    age:19,
    things:{
        test:'M'
    }
}
console.log( validator.check(person) )// true


