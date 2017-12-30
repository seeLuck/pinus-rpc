import {MQTTAcceptor, AcceptorOpts} from './acceptors/mqtt-acceptor';
import {Tracer} from '../util/tracer'
// var acceptor from ('./acceptors/ws2-acceptor');

export function create(opts: AcceptorOpts, cb : (tracer: Tracer, msg ?: any, cb ?: Function)=>void)
{
    return new MQTTAcceptor(opts, cb);
};