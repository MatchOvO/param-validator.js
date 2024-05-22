import ParamValidator from '../index.mjs'
const {Email, AsyncFunction, Phone, Integer} = ParamValidator

class Person {}
class Student extends Person {
    constructor() {
        super();
        // this.name = 'Match'
    }
}
class Ndarry extends Array{
    constructor() {
        super(...arguments);
    }
}
class Nnumber extends Number{
    constructor() {
        super(...arguments);
    }
}
const OtherArray = Array
const simpleModelValidator = new ParamValidator({
    number: Number,
    string: String,
    fun: Function,
    array: OtherArray,
    obj: Object,
    class: Object,
    empty1: undefined,
    empty2: null,
    age: [Number, String],
    phone: Phone,
    email: Email.extend({required: false}),
    asyncFun: AsyncFunction,
    // obj2: {
    //     type: Object,
    //     objItems: {
    //         name: String
    //     }
    // }
    map: Map,
    set: Set
}, "sloppy", true)

const stu = new Student()

console.log(simpleModelValidator.check({
    number: 123,
    string: 'Match',
    fun: function () {},
    array: [],
    obj: {},
    class: stu,
    empty1: undefined,
    empty2: null,
    age: '18',
    phone: '18064627202',
    email: undefined,
    asyncFun: async function() {},
    // obj2: stu,
    map: new Map(),
    set: new Set()
}))


