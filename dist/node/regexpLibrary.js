//! regexpLibrary.js
//! version : 1.0.0
//! authors : MatchOvO
//! license : MIT
//! https://github.com/MatchOvO/param-validator.js
const regexpLibrary = {
    email: /^\w{3,}(\.\w+)*@[A-z0-9]+(\.[A-z]{2,5}){1,2}$/,
    url: /[a-zA-z]+:\/\/[^\s]*/,
    IP: /((2[0-4]\d|25[0-5]|[01]?\d\d?)\.){3}(2[0-4]\d|25[0-5]|[01]?\d\d?)/,
    ChineseWord: /[\u4e00-\u9fa5]/,
    base64: /[\/]?([\da-zA-Z]+[\/+]+)*[\da-zA-Z]+([+=]{1,2}|[\/])?/,
    phone: /^\d{11}$/,
    html: /^<([a-z]+)([^<]+)*(?:>(.*)<\/\1>|\s+\/>)$/,
    intString: /^[0-9]+$/,
    floatString: /^[0-9]+\.[0-9]+$/,
    userName: /^[a-zA-Z0-9_]{4,16}$/,
    password: /^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[!@#$%^&*()_+]).{8,}$/
}
if (typeof exports === 'object' && typeof module !== 'undefined') {
    module.exports = regexpLibrary;
} else {
    exports.default = regexpLibrary;
}
