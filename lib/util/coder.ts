import { getLogger } from 'pinus-logger'
var logger = getLogger('pinus-rpc', 'Coder');
// import * as OutBuffer from ('./buffer/outputBuffer');
// import * as InBuffer from ('./buffer/inputBuffer');
import * as bBuffer from 'bearcat-buffer';
var OutBuffer = bBuffer.outBuffer;
var InBuffer = bBuffer.inBuffer;



export function encodeClient(id, msg, servicesMap)
{
    // logger.debug('[encodeClient] id %s msg %j', id, msg);
    var outBuf = new OutBuffer();
    outBuf.writeUInt(id);
    var namespace = msg['namespace'];
    var serverType = msg['serverType'];
    var service = msg['service'];
    var method = msg['method'];
    var args = msg['args'] || [];
    outBuf.writeShort(servicesMap[0][namespace]);
    outBuf.writeShort(servicesMap[1][service]);
    outBuf.writeShort(servicesMap[2][method]);
    // outBuf.writeString(namespace);
    // outBuf.writeString(service);
    // outBuf.writeString(method);

    outBuf.writeObject(args);

    return outBuf.getBuffer();
}

export function encodeServer(id, args)
{
    // logger.debug('[encodeServer] id %s args %j', id, args);
    var outBuf = new OutBuffer();
    outBuf.writeUInt(id);
    outBuf.writeObject(args);
    return outBuf.getBuffer();
}

export function decodeServer(buf, servicesMap)
{
    var inBuf = new InBuffer(buf);
    var id = inBuf.readUInt();
    var namespace = servicesMap[3][inBuf.readShort()];
    var service = servicesMap[4][inBuf.readShort()];
    var method = servicesMap[5][inBuf.readShort()];
    // var namespace = inBuf.readString();
    // var service = inBuf.readString();
    // var method = inBuf.readString();

    var args = inBuf.readObject();
    // logger.debug('[decodeServer] namespace %s service %s method %s args %j', namespace, service, method, args)

    return {
        id: id,
        msg: {
            namespace: namespace,
            // serverType: serverType,
            service: service,
            method: method,
            args: args
        }
    }
}

export function decodeClient(buf)
{
    var inBuf = new InBuffer(buf);
    var id = inBuf.readUInt();
    var resp = inBuf.readObject();
    // logger.debug('[decodeClient] id %s resp %j', id, resp);
    return {
        id: id,
        resp: resp
    }
}