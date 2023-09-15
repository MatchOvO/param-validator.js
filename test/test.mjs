import ParamValidator from '../index.mjs'
const {Email} = ParamValidator

const peopleModel = {
    name:{
        type: String,
        minLen: 3
    },
    age:{
        type: Number,
        isNaN: true
    },
    email: Email,
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
    email: '1033085048@qq.com',
    things:{
        test:'M'
    }
}
console.log( validator.check(person) )// true
