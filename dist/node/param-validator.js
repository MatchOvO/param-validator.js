//! param-validator.js
//! version : 1.1.0
//! authors : MatchOvO
//! license : MIT
//! https://github.com/MatchOvO/param-validator.js
class ParamValidator {
    constructor(dataModel) {
        /**
         * Handle data model and storage data model
         * @private
         */
        this._dataModel = this._deepClone(dataModel)
    }

    /**
     * 提供进阶的类型推导方法
     * @param val
     * @returns {String}
     */
    static typeof(val) {
        return val?.constructor ? val.constructor.name : String(val)
    }

    /**
     * 提供类型判断方法
     * @param val
     * @param type
     * @returns {boolean}
     */
    static isType(val, type) {
        return this.typeof(val) === ((type?.constructor && typeof type !== 'string') ? type.name : String(type))
    }

    /**
     * 提供深度拷贝对象的方法
     * @param copyObj
     * @param toObj
     * @returns {object}
     */
    static deepClone(copyObj, toObj) {
        return ValidatorDeepClone(copyObj, toObj)
    }

    /**
     * 校验数据是否符合数据模型
     * @param originData
     * @returns {{result: boolean, msg, errorField: string, errorModule: string, errorType: string}|{result: boolean}}
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
     * 快速校验数据
     * @param originData
     * @returns {boolean}
     */
    test(originData) {
        const checkReturn = this.check(originData)
        return checkReturn.result
    }

    /**
     * 根据数据模型将原是属于构建为完整数据
     * @param originData
     * @returns {object}
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
            conf = this._completeConfig(conf)
            if (!data.hasOwnProperty(field) && conf.required) throw new ValidatorErr(field, 'required', moduleName, conf)
            const typeArr = this._isType(conf.type, Array) ? conf.type : [conf.type]
            if (!data.hasOwnProperty(field) && !conf.required) {
                data[field] = conf.default
                typeArr.push(undefined)
            }
            const fieldData = data[field]
            try {
                typeArr.forEach((type, index) => {
                    try {
                        switch (type) {
                            case String:
                                this._stringV(field, conf, fieldData)
                                break
                            case Number:
                                this._numberV(field, conf, fieldData)
                                break
                            case Boolean:
                                this._booleanV(field, conf, fieldData)
                                break
                            case Object:
                                this._objectV(field, conf, fieldData)
                                break
                            case Array:
                                this._arrayV(field, conf, fieldData)
                                break
                            // case 'undefined':
                            //     this._emptyV(field, conf, fieldData, undefined)
                            //     break
                            default:
                                if (!type) {

                                    this._emptyV(field, conf, fieldData, type)

                                } else if (this._isType(type, Function)) {

                                    this._classV(field, conf, fieldData, type)

                                } else {

                                    throw new ValidatorErr(field, 'model', moduleName, conf)

                                }
                                break
                        }
                        /**
                         * 无错误抛出成功消息
                         */
                        throw new ValidatorSuccess()
                    } catch (e) {
                        if (e.name === 'success') throw e
                        if (index + 1 === typeArr.length)
                            throw e
                    }
                })

            } catch (n) {
                if (n.name !== 'success') throw n
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
    }

    _numberV(fie, conf, fieData) {
        const moduleName = 'numberV'
        /**
         * Number type validator
         */
        const { range, int } = conf
        if (!this._isType(fieData, Number))
            throw new ValidatorErr(fie, 'type', moduleName, conf)
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
        if (!this._isType(fieData, type))
            throw new ValidatorErr(fie, 'type', moduleName, conf)
    }

    _objectV(fie, conf, fieData) {
        const moduleName = 'objectV'
        /**
         * Object type validator
         */
        if (!this._isType(fieData, Object))
            throw new ValidatorErr(fie, 'type', moduleName, conf)
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

    _deepClone(copyObj, toObj) {
        return ValidatorDeepClone(copyObj, toObj)
    }

    _completeConfig(oriConf) {
        /**
         * Complete data model config
         */
        let conf
        if (!this._isType(oriConf,Object)) {
            conf = {type: oriConf}
        } else {
            conf = oriConf
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
}

class ValidatorSuccess {
    constructor() {
        this.name = 'success'
    }
}

function ValidatorDeepClone(copyObj, toObj) {
    const newObj = toObj || {};
    for (let key in copyObj) {
        if (typeof copyObj[key] == 'object' && copyObj[key] !== null) {
            if (copyObj[key].constructor === Object || copyObj[key].constructor === Array) {
                newObj[key] = (copyObj[key].constructor === Array) ? [] : {}
                ValidatorDeepClone(copyObj[key], newObj[key]);
            } else {
                newObj[key] = copyObj[key]
            }

        } else {
            newObj[key] = copyObj[key]
        }
    }
    return newObj;
}

module.exports = ParamValidator;