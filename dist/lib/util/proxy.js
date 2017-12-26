"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_logger_1 = require("pinus-logger");
const utils_1 = require("./utils");
var logger = pinus_logger_1.getLogger('pinus-rpc', 'rpc-proxy');
/**
 * Create proxy.
 *
 * @param  {Object} opts construct parameters
 *           opts.origin {Object} delegated object
 *           opts.proxyCB {Function} proxy invoke callback
 *           opts.service {String} deletgated service name
 *           opts.attach {Object} attach parameter pass to proxyCB
 * @return {Object}      proxy instance
 */
function create(opts) {
    if (!opts || !opts.origin) {
        logger.warn('opts and opts.origin should not be empty.');
        return null;
    }
    if (!opts.proxyCB || typeof opts.proxyCB !== 'function') {
        logger.warn('opts.proxyCB is not a function, return the origin module directly.');
        return opts.origin;
    }
    return genObjectProxy(opts.service, opts.origin, opts.attach, opts.proxyCB);
}
exports.create = create;
;
var genObjectProxy = function (serviceName, origin, attach, proxyCB) {
    //generate proxy for function field
    var res = {};
    var proto = utils_1.listEs6ClassMethods(origin);
    for (var field of proto) {
        res[field] = genFunctionProxy(serviceName, field, origin, attach, proxyCB);
    }
    return res;
};
/**
 * Generate prxoy for function type field
 *
 * @param namespace {String} current namespace
 * @param serverType {String} server type string
 * @param serviceName {String} delegated service name
 * @param methodName {String} delegated method name
 * @param origin {Object} origin object
 * @param proxyCB {Functoin} proxy callback function
 * @returns function proxy
 */
var genFunctionProxy = function (serviceName, methodName, origin, attach, proxyCB) {
    return (function () {
        var proxy = function () {
            // var args = arguments;
            var len = arguments.length;
            var args = new Array(len);
            for (var i = 0; i < len; i++) {
                args[i] = arguments[i];
            }
            // var args = Array.prototype.slice.call(arguments, 0);
            return proxyCB(serviceName, methodName, args, attach);
        };
        proxy.toServer = function () {
            // var args = arguments;
            var len = arguments.length;
            var args = new Array(len);
            for (var i = 0; i < len; i++) {
                args[i] = arguments[i];
            }
            return proxyCB(serviceName, methodName, args, attach, true);
        };
        return proxy;
    })();
};
//# sourceMappingURL=proxy.js.map