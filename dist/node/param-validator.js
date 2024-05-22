//! param-validator.js
//! version : 2.0.0
//! authors : MatchOvO
//! license : MIT
//! https://github.com/MatchOvO/param-validator.js
let regexpLibrary = require('./regexpLibrary')
/**
 * Model Config define
 * @typedef {Object|Function} ModelConfig
 * @property {Function|Array.<Function>} [type]
 * @property {boolean} [required=true]
 * @property {CustomFunction} [custom]
 * @property {any} [default]
 * @property {string|number|boolean|Array.<(string|number|boolean)>|Object} [range]
 * @property {RegExp} [regexp]
 * @property {boolean} [empty]
 * @property {number} [length]
 * @property {number} [maxLen]
 * @property {number} [minLen]
 * @property {boolean} [int=false]
 * @property {boolean} [enableNaN]
 * @property {DataModel} [items]
 * @property {DataModel} [objItems]
 * @property {ModelConfig} [arrItems]
 * @property {boolean} [enableClimb]
 * @property {boolean} [enableAsync]
 */

/**
 * @callback CustomFunction
 * @param {any} value
 */

/**
 * @typedef {Object.<string, ModelConfig>} DataModel
 */

class ParamValidator {
    /**
     * @constructor
     * @param {DataModel} dataModel
     * @param {"strict", "sloppy"} [mode="strict"]
     * @param {boolean} [forceGlobalDeepClone=false]
     */
    constructor(dataModel, mode, forceGlobalDeepClone) {
        const moduleName = 'constructor'
        const modeList = ['strict', 'sloppy']
        mode = this._isType(mode, String) ? mode : 'strict'
        if (!modeList.includes(mode))
            throw new ValidatorErr(undefined, 'mode', moduleName, undefined)
        Object.defineProperty(this, 'forceGlobalClone', {
            value: this._isType(forceGlobalDeepClone, Boolean) ? forceGlobalDeepClone : false,
            writable: false
        })
        Object.defineProperty(this, 'mode', {
            set(newValue) {
                if (modeList.includes(newValue)) {
                    mode = newValue
                }
            },
            get() {
                return mode
            }
        })
        /**
         * Specific the validator mode
         * @type {string}
         */
        this.mode = mode
        /**
         * Handle data model and storage data model
         * @private
         */
        this._dataModel = this._deepClone(dataModel)
    }

    /**
     * Provides type derivation methods
     * @param {any} val
     * @returns {String}
     */
    static typeof(val) {
        return val?.constructor ? val.constructor.name : String(val)
    }

    /**
     * Provides a method for determining the type
     * @param {any} val
     * @param {Function|undefined|null} type
     * @returns {boolean}
     */
    static isType(val, type) {
        return this.typeof(val) === ((type?.constructor && typeof type !== 'string') ? type.name : String(type))
    }

    /**
     * @deprecated - deepClone() method is no longer supported after 2.0.0 version, and we also don't suggest you to use it before 2.0.0 version
     * @param copyObj
     * @param toObj
     */
    static deepClone(copyObj, toObj) {
        throw new ValidatorErr(undefined, 'deprecated function', 'static', undefined)
    }

    static regexpLibrary = regexpLibrary

    /**
     * Verify that the data conforms to the data model
     * @param originData
     * @returns {{result: boolean, msg: string, errorField: string, errorModule: string, errorType: string}|{result: boolean}}
     */
    check(originData) {
        try {
            this._data = this._deepClone(originData)
            this._emitter(this._dataModel, this._data)
            const outData = this._data
            delete this._data
            return {
                result: true,
                data: outData
            }
        } catch (e) {
            if (e.constructor === ValidatorErr){
                return {
                    result: false,
                    ...e
                }
            }
            throw e
        }
    }

    /**
     * Quick way for validation
     * @param {Object} originData
     * @returns {boolean}
     */
    test(originData) {
        const checkReturn = this.check(originData)
        return checkReturn.result
    }

    /**
     * According to the data model to construct a completed data from origin data
     * @param {Object} originData
     * @returns {Object}
     */
    construct(originData){
        const {result,data,msg} = this.check(originData)
        return result ? data :  handleErr()
        function handleErr() {
            throw new Error(msg)
        }
    }

    _emitter(modelScope, dataScope) {
        const moduleName = 'emitter'
        const data = dataScope
        for (const field in modelScope) {
            let conf = modelScope[field]
            // transform the simple model to completed model
            const newConf = this._completeConfig(conf, field)
            // inject custom function
            let enableNormalProcedure = true
            if (newConf.hasOwnProperty("custom")) {
                const customFunction = newConf.custom
                const customFunctionTools = {
                    alter(newValue) {
                        data[field] = newValue
                    },
                    alterConfig(key, value) {
                        newConf[key] = value
                    },
                    ignore() {
                        enableNormalProcedure = false
                    },
                    ParamValidator
                }
                const customFunctionResult = customFunction.apply(customFunctionTools, [data[field], field, newConf, data])
                if (!this._isType(customFunctionResult, Boolean)) {
                    throw new Error("[Validator]: custom function need a return that must be the type of boolean")
                } else {
                    if (!customFunctionResult) throw new ValidatorErr(field, 'custom', moduleName, newConf)
                }
            }
            if (enableNormalProcedure) {
                // check if the data fulfill the requirement of the "required" option
                if (!data.hasOwnProperty(field) && newConf.required) throw new ValidatorErr(field, 'required', moduleName, newConf)
                // handle "type" option
                if (!newConf.hasOwnProperty('type'))
                    throw new TypeError('[ParamValidator]: field: "type" is needed unless ignore() is called by custom function')
                const typeArr = this._isType(newConf.type, Array) ? newConf.type : [newConf.type]
                if (!newConf.required) typeArr.push(undefined)
                // give the default value if there is no given value and the filed is required
                if (!data.hasOwnProperty(field) && !newConf.required) {
                    data[field] = newConf.default
                }
                if (newConf.hasOwnProperty('default') && data[field] === undefined && !newConf.required) data[field] = newConf.default
                const fieldData = data[field]
                try {
                    typeArr.forEach((type, index) => {
                        try {
                            if (this._isType(type, BuiltInModel))
                                throw new TypeError('[ParamValidator]: Using Built-in Model to define "type" or Using Built-in Model in Array are not allowed')
                            switch (type) {
                                case String:
                                    this._stringV(field, newConf, fieldData)
                                    break
                                case Number:
                                    this._numberV(field, newConf, fieldData)
                                    break
                                case Boolean:
                                    this._booleanV(field, newConf, fieldData)
                                    break
                                case Object:
                                    this._objectV(field, newConf, fieldData)
                                    break
                                case Array:
                                    this._arrayV(field, newConf, fieldData)
                                    break
                                case Function:
                                    this._functionV(field, newConf, fieldData)
                                    break
                                // case 'undefined':
                                //     this._emptyV(field, conf, fieldData, undefined)
                                //     break
                                default:
                                    if (!type) {

                                        this._emptyV(field, newConf, fieldData, type)

                                    } else if (this._isType(type, Function)) {

                                        this._classV(field, newConf, fieldData, type)

                                    } else {

                                        throw new TypeError("[ParamValidator]: It seems that you provide an Model Config that we can not recognize")

                                    }
                                    break
                            }
                            /**
                             * 无错误抛出成功消息
                             */
                            throw new ValidatorSuccess()
                        } catch (e) {
                            if (e.name === 'success') throw e
                            if (!(e instanceof ValidatorErr)) throw e
                            if (index + 1 === typeArr.length)
                                throw e
                        }
                    })

                } catch (n) {
                    if (n.name !== 'success') throw n
                }

            }

        }
    }

    _stringV(fie, conf, fieData) {
        const moduleName = 'stringV'
        /**
         * String type validator
         */
        const { regexp, range, empty } = conf
        if (!this._isType(fieData, String))
            throw new ValidatorErr(fie, 'type', moduleName, conf)
        if (conf.hasOwnProperty('empty') && !empty && fieData === '')
            throw new ValidatorErr(fie,'empty',moduleName, conf)
        if (conf.hasOwnProperty('regexp') && !regexp.test(fieData))
            throw new ValidatorErr(fie, 'regexp', moduleName, conf)
        if (conf.hasOwnProperty('range')) {
            const rangeArr = this._isType(range, Array) ? range : [range]
            let matched = false
            rangeArr.forEach(str => {
                if (str === fieData) matched = true
            })
            if (!matched)
                throw new ValidatorErr(fie, 'range', moduleName, conf)
        }
        if (conf.hasOwnProperty('length')) {
            if (fieData.length !== conf.length)
                throw new ValidatorErr(fie, 'length', moduleName, conf)
        }
        if (conf.hasOwnProperty('maxLen')) {
            if (fieData.length > conf.maxLen)
                throw new ValidatorErr(fie, 'maxLen', moduleName, conf)
        }
        if (conf.hasOwnProperty('minLen')) {
            if (fieData.length < conf.minLen)
                throw new ValidatorErr(fie, 'minLen', moduleName, conf)
        }
    }

    _numberV(fie, conf, fieData) {
        const moduleName = 'numberV'
        /**
         * Number type validator
         */
        const { range, int } = conf
        let { enableNaN } = conf
        enableNaN = this._isType(enableNaN, Boolean) ? enableNaN : this.mode !== "strict"
        if (!this._isType(fieData, Number))
            throw new ValidatorErr(fie, 'type', moduleName, conf)
        if (!enableNaN){
            const result = Number.isNaN(fieData) === enableNaN
            if (!result)
                throw new ValidatorErr(fie, 'type', moduleName, conf)
        }
        if (int && fieData !== Number(fieData.toFixed()))
            throw new ValidatorErr(fie, 'int', moduleName,conf)
        if (conf.hasOwnProperty('range')) {
            const rangeObj = range
            if (this._isType(rangeObj, Array) || this._isType(rangeObj, Number)) {
                let matched = false
                const rangeArr = this._isType(rangeObj, Array) ? rangeObj : [rangeObj]
                rangeArr.forEach(val => {
                    if (val === fieData) matched = true
                })
                if (!matched)
                    throw new ValidatorErr(fie, 'range', moduleName, conf)
            } else if (this._isType(rangeObj, Object)) {
                const { "<": max, ">": min, "<=": maxE, ">=": minE } = rangeObj
                let matched = true
                if (rangeObj.hasOwnProperty('<')) {
                    if (fieData >= max) matched = false
                }
                if (rangeObj.hasOwnProperty('>')) {
                    if (fieData <= min) matched = false
                }
                if (rangeObj.hasOwnProperty('<=')) {
                    if (fieData > maxE) matched = false
                }
                if (rangeObj.hasOwnProperty('>=')) {
                    if (fieData < minE) matched = false
                }
                if (!matched)
                    throw new ValidatorErr(fie, 'range', moduleName, conf)
            }
        }
    }

    _booleanV(fie, conf, fieData) {
        const moduleName = 'booleanV'
        /**
         * Boolean type validator
         */
        const { range } = conf
        if (!this._isType(fieData, Boolean))
            throw new ValidatorErr(fie, 'type', moduleName, conf)
        if (conf.hasOwnProperty('range')) {
            const rangeArr = this._isType(range, Array) ? range : [range]
            let matched = false
            rangeArr.forEach(val => {
                if (val === fieData) matched = true
            })
            if (!matched)
                throw new ValidatorErr(fie, 'range', moduleName, conf)
        }
    }

    _emptyV(fie, conf, fieData, type) {
        const moduleName = 'emptyV'
        /**
         * empty type validator
         */
        if (!this._isType(fieData, type))
            throw new ValidatorErr(fie, 'type', moduleName, conf)
    }

    _classV(fie, conf, fieData, type) {
        const moduleName = 'classV'
        /**
         * Class type validator
         */
        let { enableClimb } = conf
        enableClimb = this._isType(enableClimb, Boolean) ? enableClimb : this.mode !== "strict"
        if (enableClimb) {
            if (!(fieData instanceof type))
                throw new ValidatorErr(fie, 'type', moduleName, conf)
        } else {
            if (!this._isType(fieData, type))
                throw new ValidatorErr(fie, 'type', moduleName, conf)
        }
    }

    _objectV(fie, conf, fieData) {
        const moduleName = 'objectV'
        /**
         * Object type validator
         */
        let { enableClimb } = conf
        enableClimb = this._isType(enableClimb, Boolean) ? enableClimb : this.mode !== "strict"
        if (enableClimb) {
            if (!(fieData instanceof Object))
                throw new ValidatorErr(fie, 'type', moduleName, conf)
        } else {
            if (!this._isType(fieData, Object))
                throw new ValidatorErr(fie, 'type', moduleName, conf)
        }
        if (conf.hasOwnProperty('objItems') || conf.hasOwnProperty('items')) {
            const itemsModel = conf.objItems || conf.items
            this._emitter(itemsModel, fieData)
        }
    }

    _arrayV(fie, conf, fieData) {
        const moduleName = 'arrayV'
        /**
         * Array type validator
         */
        if (!this._isType(fieData, Array))
            throw new ValidatorErr(fie, 'type', moduleName, conf)
        if (conf.hasOwnProperty('arrItems') || conf.hasOwnProperty('items')) {
            const arrayModelScope = {}
            arrayModelScope[fie] = conf.arrItems || conf.items
            fieData.forEach(item => {
                const itemScope = {}
                itemScope[fie] = item
                this._emitter(arrayModelScope, itemScope)
            })
        }
    }

    _functionV(fie, conf, fieData) {
        const moduleName = 'functionV'
        /**
         * Function type validator
         */
        const { name, argsLength } = conf
        let { enableAsync } = conf
        enableAsync = this._isType(enableAsync, Boolean) ? enableAsync : this.mode !== "strict"
        async function asyncFunSample() {}
        if (enableAsync) {
            if (!(this._isType(fieData, Function) || this._isType(fieData, asyncFunSample.constructor)))
                throw new ValidatorErr(fie, 'type', moduleName, conf)
        } else {
            if (!this._isType(fieData, Function))
                throw new ValidatorErr(fie, 'type', moduleName, conf)
        }
        if (conf.hasOwnProperty('name')) {
            if (name !== fieData.name)
                throw new ValidatorErr(fie, 'function-name', moduleName, conf)
        }
        if (conf.hasOwnProperty('argsLength')) {
            if (argsLength !== fieData.length) {
                throw new ValidatorErr(fie, 'arguments-length', moduleName, conf)
            }
        }
    }

    _deepClone(copyObj) {
        if (this.mode === 'strict' && this.forceGlobalClone === false) {
            return ValidatorDeepCloneLazy(copyObj)
        } else {
            return ValidatorDeepCloneGlobal(copyObj)
        }
    }

    _completeConfig(oriConf, field) {
        /**
         * Complete data model config
         */
        let conf
        if (this._isType(oriConf, BuiltInModel) || this._isType(oriConf, Object)) {
            conf = oriConf
        } else if (this._isType(oriConf, Function) || this._isType(oriConf, Array) || this._isType(oriConf, undefined) || this._isType(oriConf, null)) {
            conf = {type: oriConf}
        } else if(oriConf instanceof Object) {
            conf = oriConf
        } else {
            throw new TypeError(`[ParamValidator]: It seems that you provide an Model Config that we can not recognize at "${field}"`)
        }
        conf.required = conf.hasOwnProperty('required') ? conf.required : true
        return conf
    }

    _typeof(val) {
        return val?.constructor ? val.constructor.name : String(val)
    }

    _isType(val, type) {
        return this._typeof(val) === ((type?.constructor && typeof type !== 'string') ? type.name : String(type))
    }


}

/**
 * 错误类
 */
class ValidatorErr {
    constructor(errorField, errorType, errorModule, errorModel) {
        this.errorField = errorField
        this.errorType = errorType
        this.errorModule = errorModule
        this.errorModel = errorModel
        this.msg = `[Validator]"${errorModule.toUpperCase()}" throw an error ---at "${errorField}" ---errorType:"${errorType}"`
    }

    /**
     * Error Type
     *  -required   必须的字段为空
     *  -type       类型错误
     *  -empty      字符串为空错误
     *  -regexp     字符串正则错误
     *  -unknown    未知错误
     *  -range      值的范围错误
     *  -int        数值整形错误
     *  -model      数据模型错误
     *  -custom     自定义函数校验不通过
     *  -function-name  函数名称错误
     *  -arguments-length 函数形参长度错误
     *  -deprecated function 被废弃的方法
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
     *  -static     静态方法的错误
     */
}

class ValidatorSuccess {
    constructor() {
        this.name = 'success'
    }
}

function ValidatorDeepCloneLazy(copyObj, toObj, map) {
    let newObj = toObj ? toObj : {};
    map = map ? map : new WeakMap()
    const existed = map.get(copyObj)
    if (existed) {
        throw new TypeError("[ParamValidator]: detected circular references, please set forceGlobalDeepClone as true to handle this kind of situation")
    }
    map.set(copyObj, true)
    for (let key in copyObj) {
        if (typeof copyObj[key] == 'object' && copyObj[key] !== null) {
            if (copyObj[key].constructor === Object || copyObj[key].constructor === Array) {
                newObj[key] = (copyObj[key].constructor === Array) ? [] : {}
                ValidatorDeepCloneLazy(copyObj[key], newObj[key], map);
            } else {
                newObj[key] = copyObj[key]
            }

        } else {
            newObj[key] = copyObj[key]
        }
    }
    return newObj;
}

function ValidatorDeepCloneGlobal(target) {
    const map = new WeakMap()

    function isObject(target) {
        return (typeof target === 'object' && target ) || typeof target === 'function'
    }

    function clone(data) {
        if (!isObject(data)) {
            return data
        }
        if ([Date, RegExp].includes(data.constructor)) {
            return new data.constructor(data)
        }
        if (typeof data === 'function') {
            return data
        }
        const exist = map.get(data)
        if (exist) {
            return exist
        }
        if (data instanceof Map) {
            const result = new Map()
            map.set(data, result)
            data.forEach((val, key) => {
                if (isObject(val)) {
                    result.set(key, clone(val))
                } else {
                    result.set(key, val)
                }
            })
            return result
        }
        if (data instanceof Set) {
            const result = new Set()
            map.set(data, result)
            data.forEach(val => {
                if (isObject(val)) {
                    result.add(clone(val))
                } else {
                    result.add(val)
                }
            })
            return result
        }
        const keys = Reflect.ownKeys(data)
        const allDesc = Object.getOwnPropertyDescriptors(data)
        const result = Object.create(Object.getPrototypeOf(data), allDesc)
        map.set(data, result)
        keys.forEach(key => {
            const val = data[key]
            if (isObject(val)) {
                result[key] = clone(val)
            } else {
                result[key] = val
            }
        })
        return result
    }

    return clone(target)
}

class BuiltInModel {
    /**
     * @constructor To construct an instance of BuiltInModel
     * @param {ModelConfig} conf
     */
    constructor(conf) {
        for (const option in conf) {
            this[option] = conf[option]
        }
    }

    /**
     * Return a new Built-in Model that extends existed config and inject more config
     * @param {ModelConfig} newConfig - the config that will be injected in new Built-in Model
     * @return {BuiltInModel} - new Built-in Model that extends existed config and inject more config
     */
    extend(newConfig) {
        return new BuiltInModel({
            ...this,
            ...newConfig
        })
    }
}

ParamValidator.BuiltInModel = BuiltInModel

// inject built-in validator (related of regexp)
for (let type in regexpLibrary) {
    const regexp = regexpLibrary[type]
    type = type.slice(0,1).toUpperCase() + type.slice(1)
    ParamValidator[type] = new BuiltInModel({
        type: String,
        regexp
    })
}

// Built-in Model
ParamValidator.Integer = new BuiltInModel({
    type: Number,
    int: true
})

ParamValidator.Float = new BuiltInModel({
    type: Number,
    custom(v) {
        if (!this.ParamValidator.isType(v, Number)) return false
        if (v.toFixed() == v) return false
        return true
    }
})

ParamValidator.Even = new BuiltInModel({
    type: Number,
    custom(v) {
        if (!this.ParamValidator.isType(v, Number)) return false
        if (v % 2 !== 0) return false
        return true
    }
})

ParamValidator.Odd = new BuiltInModel({
    type: Number,
    custom(v) {
        if (!this.ParamValidator.isType(v, Number)) return false
        if (v % 2 === 0) return false
        return true
    }
})

ParamValidator.AsyncFunction = new BuiltInModel({
    type: (()=>{
        async function fun() {}
        return fun.constructor
    })()
})

if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = ParamValidator;
} else {
    exports.default = ParamValidator;
}
