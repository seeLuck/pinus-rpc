"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pomelo_logger_1 = require("pomelo-logger");
var logger = pomelo_logger_1.getLogger('pomelo-rpc', 'blackhole');
const events_1 = require("events");
var exp = module.exports = new events_1.EventEmitter();
exp.connect = function (tracer, cb) {
    tracer && tracer.info('client', __filename, 'connect', 'connect to blackhole');
    process.nextTick(function () {
        cb(new Error('fail to connect to remote server and switch to blackhole.'));
    });
};
exp.close = function (cb) { };
exp.send = function (tracer, msg, opts, cb) {
    tracer && tracer.info('client', __filename, 'send', 'send rpc msg to blackhole');
    logger.info('message into blackhole: %j', msg);
    process.nextTick(function () {
        cb(tracer, new Error('message was forward to blackhole.'));
    });
};
//# sourceMappingURL=blackhole.js.map