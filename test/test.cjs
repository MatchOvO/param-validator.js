const ParamValidator = require('../index.cjs')
const peopleModel = {
    name:{
        type: String,
        minLen: 3
    },
    age:{
        type: Number,
        isNaN: true
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
    name:'Match',
    age:NaN,
    things:{
        test:'M'
    }
}
console.log( validator.check(person) )// true


