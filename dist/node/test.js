const ParamValidator = require('./param-validator.min')
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