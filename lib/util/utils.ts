
export function invokeCallback(cb)
{
    if (typeof cb === 'function')
    {
        cb.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

export function applyCallback(cb, args)
{
    if (typeof cb === 'function')
    {
        cb.apply(null, args);
    }
};

export function getObjectClass(obj)
{
    if (!obj)
    {
        return;
    }

    var constructor = obj.constructor;
    if (!constructor)
    {
        return;
    }

    if (constructor.name)
    {
        return constructor.name;
    }

    var str = constructor.toString();
    if (!str)
    {
        return;
    }

    var arr = null;
    if (str.charAt(0) == '[')
    {
        arr = str.match(/\[\w+\s*(\w+)\]/);
    } else
    {
        arr = str.match(/function\s*(\w+)/);
    }

    if (arr && arr.length == 2)
    {
        return arr[1];
    }
};

/**
 * Utils check float
 *
 * @param  {Float}   float
 * @return {Boolean} true|false
 * @api public
 */
export function checkFloat(v)
{
    return v === Number(v) && v % 1 !== 0;
    // return parseInt(v) !== v;
}

/**
 * Utils check type
 *
 * @param  {String}   type
 * @return {Function} high order function
 * @api public
 */
export function isType(type)
{
    return function (obj)
    {
        return {}.toString.call(obj) == "[object " + type + "]";
    }
}

/**
 * Utils check array
 *
 * @param  {Array}   array
 * @return {Boolean} true|false
 * @api public
 */
export var checkArray = Array.isArray || isType("Array");

/**
 * Utils check number
 *
 * @param  {Number}  number
 * @return {Boolean} true|false
 * @api public
 */
export var checkNumber = isType("Number");

/**
 * Utils check function
 *
 * @param  {Function}   func function
 * @return {Boolean}    true|false
 * @api public
 */
export var checkFunction = isType("Function");
/**
 * Utils check object
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
export var checkObject = isType("Object");

/**
 * Utils check string
 *
 * @param  {String}   string
 * @return {Boolean}  true|false
 * @api public
 */
export var checkString = isType("String");

/**
 * Utils check boolean
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
export var checkBoolean = isType("Boolean");

/**
 * Utils check bean
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
export var checkBean = function (obj)
{
    return obj && obj['$id'] &&
        checkFunction(obj['writeFields']) &&
        checkFunction(obj['readFields']);
}

export var checkNull = function (obj)
{
    return !isNotNull(obj);
}

/**
 * Utils args to array
 *
 * @param  {Object}  args arguments
 * @return {Array}   array
 * @api public
 */
export var to_array = function (args)
{
    var len = args.length;
    var arr = new Array(len);

    for (var i = 0; i < len; i++)
    {
        arr[i] = args[i];
    }

    return arr;
}

/**
 * Utils check is not null
 *
 * @param  {Object}   value
 * @return {Boolean}  true|false
 * @api public
 */
export var isNotNull = function (value)
{
    if (value !== null && typeof value !== 'undefined')
        return true;
    return false;
}

export var getType = function (object)
{
    if (object == null || typeof object === 'undefined')
    {
        return typeMap['null'];
    }

    if (Buffer.isBuffer(object))
    {
        return typeMap['buffer'];
    }

    if (checkArray(object))
    {
        return typeMap['array'];
    }

    if (checkString(object))
    {
        return typeMap['string'];
    }

    if (checkObject(object))
    {
        if (checkBean(object))
        {
            return typeMap['bean'];
        }

        return typeMap['object'];
    }

    if (checkBoolean(object))
    {
        return typeMap['boolean'];
    }

    if (checkNumber(object))
    {
        if (checkFloat(object))
        {
            return typeMap['float'];
        }

        if (isNaN(object))
        {
            return typeMap['null'];
        }

        return typeMap['number'];
    }
}

export var typeArray = ['', 'null', 'buffer', 'array', 'string', 'object', 'bean', 'boolean', 'float', 'number'];
export var typeMap = {};
for (var i = 1; i <= typeArray.length; i++)
{
    typeMap[typeArray[i]] = i;
}

export var getBearcat = function ()
{
    return require('bearcat');
}

export var genServicesMap = function (services)
{
    var nMap = {}; // namespace
    var sMap = {}; // service
    var mMap = {}; // method
    var nList = [];
    var sList = [];
    var mList = [];

    var nIndex = 0;
    var sIndex = 0;
    var mIndex = 0;

    for (var namespace in services)
    {
        nList.push(namespace);
        nMap[namespace] = nIndex++;
        var s = services[namespace];

        for (var service in s)
        {
            sList.push(service);
            sMap[service] = sIndex++;
            var m = s[service];

            for (var method in m)
            {
                var func = m[method];
                if (checkFunction(func))
                {
                    mList.push(method);
                    mMap[method] = mIndex++;
                }
            }
        }
    }

    return [nMap, sMap, mMap, nList, sList, mList];
}