"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function invokeCallback(cb) {
    if (typeof cb === 'function') {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
}
exports.invokeCallback = invokeCallback;
;
function applyCallback(cb, args) {
    if (typeof cb === 'function') {
        cb.apply(null, args);
    }
}
exports.applyCallback = applyCallback;
;
function getObjectClass(obj) {
    if (!obj) {
        return;
    }
    var constructor = obj.constructor;
    if (!constructor) {
        return;
    }
    if (constructor.name) {
        return constructor.name;
    }
    var str = constructor.toString();
    if (!str) {
        return;
    }
    var arr = null;
    if (str.charAt(0) == '[') {
        arr = str.match(/\[\w+\s*(\w+)\]/);
    }
    else {
        arr = str.match(/function\s*(\w+)/);
    }
    if (arr && arr.length == 2) {
        return arr[1];
    }
}
exports.getObjectClass = getObjectClass;
;
/**
 * Utils check float
 *
 * @param  {Float}   float
 * @return {Boolean} true|false
 * @api public
 */
function checkFloat(v) {
    return v === Number(v) && v % 1 !== 0;
    // return parseInt(v) !== v;
}
exports.checkFloat = checkFloat;
/**
 * Utils check type
 *
 * @param  {String}   type
 * @return {Function} high order function
 * @api public
 */
function isType(type) {
    return function (obj) {
        return {}.toString.call(obj) == "[object " + type + "]";
    };
}
exports.isType = isType;
/**
 * Utils check array
 *
 * @param  {Array}   array
 * @return {Boolean} true|false
 * @api public
 */
exports.checkArray = Array.isArray || isType("Array");
/**
 * Utils check number
 *
 * @param  {Number}  number
 * @return {Boolean} true|false
 * @api public
 */
exports.checkNumber = isType("Number");
/**
 * Utils check function
 *
 * @param  {Function}   func function
 * @return {Boolean}    true|false
 * @api public
 */
exports.checkFunction = isType("Function");
/**
 * Utils check object
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
exports.checkObject = isType("Object");
/**
 * Utils check string
 *
 * @param  {String}   string
 * @return {Boolean}  true|false
 * @api public
 */
exports.checkString = isType("String");
/**
 * Utils check boolean
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
exports.checkBoolean = isType("Boolean");
/**
 * Utils check bean
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
exports.checkBean = function (obj) {
    return obj && obj['$id'] &&
        exports.checkFunction(obj['writeFields']) &&
        exports.checkFunction(obj['readFields']);
};
exports.checkNull = function (obj) {
    return !exports.isNotNull(obj);
};
/**
 * Utils args to array
 *
 * @param  {Object}  args arguments
 * @return {Array}   array
 * @api public
 */
exports.to_array = function (args) {
    var len = args.length;
    var arr = new Array(len);
    for (var i = 0; i < len; i++) {
        arr[i] = args[i];
    }
    return arr;
};
/**
 * Utils check is not null
 *
 * @param  {Object}   value
 * @return {Boolean}  true|false
 * @api public
 */
exports.isNotNull = function (value) {
    if (value !== null && typeof value !== 'undefined')
        return true;
    return false;
};
exports.getType = function (object) {
    if (object == null || typeof object === 'undefined') {
        return exports.typeMap['null'];
    }
    if (Buffer.isBuffer(object)) {
        return exports.typeMap['buffer'];
    }
    if (exports.checkArray(object)) {
        return exports.typeMap['array'];
    }
    if (exports.checkString(object)) {
        return exports.typeMap['string'];
    }
    if (exports.checkObject(object)) {
        if (exports.checkBean(object)) {
            return exports.typeMap['bean'];
        }
        return exports.typeMap['object'];
    }
    if (exports.checkBoolean(object)) {
        return exports.typeMap['boolean'];
    }
    if (exports.checkNumber(object)) {
        if (checkFloat(object)) {
            return exports.typeMap['float'];
        }
        if (isNaN(object)) {
            return exports.typeMap['null'];
        }
        return exports.typeMap['number'];
    }
};
exports.typeArray = ['', 'null', 'buffer', 'array', 'string', 'object', 'bean', 'boolean', 'float', 'number'];
exports.typeMap = {};
for (var i = 1; i <= exports.typeArray.length; i++) {
    exports.typeMap[exports.typeArray[i]] = i;
}
exports.getBearcat = function () {
    return require('bearcat');
};
/**
 * 列出ES6的一个Class实例上的所有方法，但不包括父类的
 * @param objInstance
 */
function listEs6ClassMethods(objInstance) {
    var names = [];
    var methodNames = Object.getOwnPropertyNames(Object.getPrototypeOf(objInstance)).concat(Object.getOwnPropertyNames(objInstance));
    for (let name of methodNames) {
        let method = objInstance[name];
        // Supposedly you'd like to skip constructor
        if (!(method instanceof Function) || name == "constructor")
            continue;
        names.push(name);
    }
    return names;
}
exports.listEs6ClassMethods = listEs6ClassMethods;
//# sourceMappingURL=utils.js.map