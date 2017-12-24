import {MQTTAcceptor} from './acceptors/mqtt-acceptor';
// var acceptor from ('./acceptors/ws2-acceptor');

export function create(opts, cb)
{
    return new MQTTAcceptor(opts, cb);
};