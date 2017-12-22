"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Loader = require("pomelo-loader");
const Gateway = require("./gateway");
var loadRemoteServices = function (paths, context) {
    var res = {}, item, m;
    for (var i = 0, l = paths.length; i < l; i++) {
        item = paths[i];
        m = Loader.load(item.path, context);
        if (m) {
            createNamespace(item.namespace, res);
            for (var s in m) {
                res[item.namespace][s] = m[s];
            }
        }
    }
    return res;
};
var createNamespace = function (namespace, proxies) {
    proxies[namespace] = proxies[namespace] || {};
};
/**
 * Create rpc server.
 *
 * @param  {Object}      opts construct parameters
 *                       opts.port {Number|String} rpc server listen port
 *                       opts.paths {Array} remote service code paths, [{namespace, path}, ...]
 *                       opts.context {Object} context for remote service
 *                       opts.acceptorFactory {Object} (optionals)acceptorFactory.create(opts, cb)
 * @return {Object}      rpc server instance
 */
function create(opts) {
    if (!opts || !opts.port || opts.port < 0 || !opts.paths) {
        throw new Error('opts.port or opts.paths invalid.');
    }
    var services = loadRemoteServices(opts.paths, opts.context);
    opts.services = services;
    var gateway = Gateway.create(opts);
    return gateway;
}
exports.create = create;
;
// module.exports.WSAcceptor from ('./acceptors/ws-acceptor');
// module.exports.TcpAcceptor from ('./acceptors/tcp-acceptor');
var mqtt_acceptor_1 = require("./acceptors/mqtt-acceptor");
exports.MqttAcceptor = mqtt_acceptor_1.create;
//# sourceMappingURL=server.js.map