"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mqtt_acceptor_1 = require("./acceptors/mqtt-acceptor");
// var acceptor from ('./acceptors/ws2-acceptor');
function create(opts, cb) {
    return new mqtt_acceptor_1.MQTTAcceptor(opts, cb);
}
exports.create = create;
;
//# sourceMappingURL=acceptor.js.map