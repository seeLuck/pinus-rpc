"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pinus_logger_1 = require("pinus-logger");
var logger = pinus_logger_1.getLogger('pinus-rpc', 'mqtt-acceptor');
const events_1 = require("events");
const tracer_1 = require("../../util/tracer");
const MqttCon = require("mqtt-connection");
const net = require("net");
var curId = 1;
class MQTTAcceptor extends events_1.EventEmitter {
    constructor(opts, cb) {
        super();
        this.interval = opts.interval; // flush interval in ms
        this.bufferMsg = opts.bufferMsg;
        this.rpcLogger = opts.rpcLogger;
        this.rpcDebugLog = opts.rpcDebugLog;
        this._interval = null; // interval object
        this.sockets = {};
        this.msgQueues = {};
        this.cb = cb;
    }
    ;
    listen(port) {
        //check status
        if (!!this.inited) {
            this.cb(new Error('already inited.'));
            return;
        }
        this.inited = true;
        var self = this;
        this.server = new net.Server();
        this.server.listen(port);
        this.server.on('error', function (err) {
            logger.error('rpc server is error: %j', err.stack);
            self.emit('error', err);
        });
        this.server.on('connection', function (stream) {
            var socket = MqttCon(stream);
            socket['id'] = curId++;
            socket.on('connect', function (pkg) {
                console.log('connected');
            });
            socket.on('publish', function (pkg) {
                pkg = pkg.payload.toString();
                var isArray = false;
                try {
                    pkg = JSON.parse(pkg);
                    if (pkg instanceof Array) {
                        self.processMsgs(socket, pkg);
                        isArray = true;
                    }
                    else {
                        self.processMsg(socket, pkg);
                    }
                }
                catch (err) {
                    if (!isArray) {
                        self.doSend(socket, {
                            id: pkg.id,
                            resp: [self.cloneError(err)]
                        });
                    }
                    logger.error('process rpc message error %s', err.stack);
                }
            });
            socket.on('pingreq', function () {
                socket.pingresp();
            });
            socket.on('error', function () {
                self.onSocketClose(socket);
            });
            socket.on('close', function () {
                self.onSocketClose(socket);
            });
            self.sockets[socket.id] = socket;
            socket.on('disconnect', function (reason) {
                self.onSocketClose(socket);
            });
        });
        if (this.bufferMsg) {
            this._interval = setInterval(function () {
                self.flush();
            }, this.interval);
        }
    }
    ;
    close() {
        if (this.closed) {
            return;
        }
        this.closed = true;
        if (this._interval) {
            clearInterval(this._interval);
            this._interval = null;
        }
        this.server.close();
        this.emit('closed');
    }
    ;
    onSocketClose(socket) {
        if (!socket['closed']) {
            var id = socket.id;
            socket['closed'] = true;
            delete this.sockets[id];
            delete this.msgQueues[id];
        }
    }
    cloneError(origin) {
        // copy the stack infos for Error instance json result is empty
        var res = {
            msg: origin.msg,
            stack: origin.stack
        };
        return res;
    }
    ;
    processMsg(socket, pkg) {
        var tracer = null;
        if (this.rpcDebugLog) {
            tracer = new tracer_1.Tracer(this.rpcLogger, this.rpcDebugLog, pkg.remote, pkg.source, pkg.msg, pkg.traceId, pkg.seqId);
            tracer.info('server', __filename, 'processMsg', 'mqtt-acceptor receive message and try to process message');
        }
        this.cb(tracer, pkg.msg, (...args) => {
            var errorArg = args[0]; // first callback argument can be error object, the others are message
            if (errorArg && errorArg instanceof Error) {
                args[0] = this.cloneError(errorArg);
            }
            var resp;
            if (tracer && tracer.isEnabled) {
                resp = {
                    traceId: tracer.id,
                    seqId: tracer.seq,
                    source: tracer.source,
                    id: pkg.id,
                    resp: args
                };
            }
            else {
                resp = {
                    id: pkg.id,
                    resp: args
                };
            }
            if (this.bufferMsg) {
                this.enqueue(socket, resp);
            }
            else {
                this.doSend(socket, resp);
            }
        });
    }
    ;
    processMsgs(socket, pkgs) {
        for (var i = 0, l = pkgs.length; i < l; i++) {
            this.processMsg(socket, pkgs[i]);
        }
    }
    ;
    enqueue(socket, msg) {
        var id = socket.id;
        var queue = this.msgQueues[id];
        if (!queue) {
            queue = this.msgQueues[id] = [];
        }
        queue.push(msg);
    }
    ;
    flush() {
        var sockets = this.sockets, queues = this.msgQueues, queue, socket;
        for (var socketId in queues) {
            socket = sockets[socketId];
            if (!socket) {
                // clear pending messages if the socket not exist any more
                delete queues[socketId];
                continue;
            }
            queue = queues[socketId];
            if (!queue.length) {
                continue;
            }
            this.doSend(socket, queue);
            queues[socketId] = [];
        }
    }
    ;
    doSend(socket, msg) {
        socket.publish({
            topic: 'rpc',
            payload: JSON.stringify(msg)
        });
    }
}
exports.MQTTAcceptor = MQTTAcceptor;
/**
 * create acceptor
 *
 * @param opts init params
 * @param cb(tracer, msg, cb) callback function that would be invoked when new message arrives
 */
function create(opts, cb) {
    return new MQTTAcceptor(opts || {}, cb);
}
exports.create = create;
;
//# sourceMappingURL=mqtt-acceptor.js.map