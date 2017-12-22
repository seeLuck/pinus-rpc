import * as acceptor from './acceptors/mqtt-acceptor';
// var acceptor from ('./acceptors/ws2-acceptor');

module.exports.create = function (opts, cb)
{
    return acceptor.create(opts, cb);
};