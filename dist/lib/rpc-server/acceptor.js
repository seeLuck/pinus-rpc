"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const acceptor = require("./acceptors/mqtt-acceptor");
// var acceptor from ('./acceptors/ws2-acceptor');
function create(opts, cb) {
    return acceptor.create(opts, cb);
}
exports.create = create;
;
//# sourceMappingURL=acceptor.js.map