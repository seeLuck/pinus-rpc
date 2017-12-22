"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const defaultAcceptorFactory = require("./acceptor");
const events_1 = require("events");
const dispatcher_1 = require("./dispatcher");
const Loader = require("pomelo-loader");
const fs = require("fs");
class Gateway extends events_1.EventEmitter {
    constructor(opts) {
        super();
        this.started = false;
        this.stoped = false;
        this.stop = function () {
            if (!this.started || this.stoped) {
                return;
            }
            this.stoped = true;
            try {
                this.acceptor.close();
            }
            catch (err) { }
        };
        this.start = function () {
            if (this.started) {
                throw new Error('gateway already start.');
            }
            this.started = true;
            var self = this;
            this.acceptor.on('error', self.emit.bind(self, 'error'));
            this.acceptor.on('closed', self.emit.bind(self, 'closed'));
            this.acceptor.listen(this.port);
        };
        this.opts = opts || {};
        this.port = opts.port || 3050;
        this.started = false;
        this.stoped = false;
        this.acceptorFactory = opts.acceptorFactory || defaultAcceptorFactory;
        this.services = opts.services;
        var dispatcher = new dispatcher_1.Dispatcher(this.services);
        if (!!this.opts.reloadRemotes) {
            watchServices(this, dispatcher);
        }
        this.acceptor = this.acceptorFactory.create(opts, function (tracer, msg, cb) {
            dispatcher.route(tracer, msg, cb);
        });
    }
    ;
}
exports.Gateway = Gateway;
/**
 * create and init gateway
 *
 * @param opts {services: {rpcServices}, connector:conFactory(optional), router:routeFunction(optional)}
 */
function create(opts) {
    if (!opts || !opts.services) {
        throw new Error('opts and opts.services should not be empty.');
    }
    return new Gateway(opts);
}
exports.create = create;
;
var watchServices = function (gateway, dispatcher) {
    var paths = gateway.opts.paths;
    var app = gateway.opts.context;
    for (var i = 0; i < paths.length; i++) {
        (function (index) {
            fs.watch(paths[index].path, function (event, name) {
                if (event === 'change') {
                    var res = {};
                    var item = paths[index];
                    var m = Loader.load(item.path, app);
                    if (m) {
                        createNamespace(item.namespace, res);
                        for (var s in m) {
                            res[item.namespace][s] = m[s];
                        }
                    }
                    dispatcher.emit('reload', res);
                }
            });
        })(i);
    }
};
var createNamespace = function (namespace, proxies) {
    proxies[namespace] = proxies[namespace] || {};
};
//# sourceMappingURL=gateway.js.map