const ParamValidator = require('../index.cjs')
const {Email} = ParamValidator
const peopleModel = {
    name:{
        type: String,
        custom(name) {
            const newName = name.toUpperCase()
            this.alter(newName)
            return true;
        }
    },
    age:{
        type: Number,
        custom(age) {
            if (age % 2 !== 0) return false
            return true
        }
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
    age:20,
    email: '1033085048@qq.com',
    things:{
        test:'M'
    }
}
console.log( validator.check(person) )// true

const {UserName, Password, Phone} = ParamValidator
const userModel = {
    username: UserName,
    password: Password,
    email: Email,
    phone: Phone
}
const userValidator = new ParamValidator(userModel)
const user1 = {
    username: 'Match_OvO',
    password: 'Match_12345',
    email: '1033085048@qq.com',
    phone: '18064627202'
}
console.log(userValidator.test(user1)) //true

const {Integer, Float, Odd, Even} = ParamValidator
const builtInTestModel = {
    int: Integer,
    float: Float,
    odd: Odd,
    even: Even,
}
const testValidator = new ParamValidator(builtInTestModel)
const testObj = {
    int: 3,
    float: 13.3,
    odd: 3,
    even: 0
}
console.log(testValidator.check(testObj))


