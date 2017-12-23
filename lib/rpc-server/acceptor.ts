import * as acceptor from './acceptors/mqtt-acceptor';
// var acceptor from ('./acceptors/ws2-acceptor');

export function create(opts, cb)
{
    return acceptor.create(opts, cb);
};