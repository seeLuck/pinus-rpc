import {getLogger} from 'pomelo-logger'
let logger = getLogger('pomelo-rpc', 'mqtt2-mailbox');
import {EventEmitter} from 'events';
 import {constants} from '../../util/constants';
import * as Tracer from '../../util/tracer';
import * as MqttCon from 'mqtt-connection';
import * as utils from '../../util/utils';
import * as Coder from '../../util/coder';
import * as util from 'util';
import * as net from 'net';

let CONNECT_TIMEOUT = 2000;

let MailBox = function(server, opts) {
  EventEmitter.call(this);
  this.curId = 0;
  this.id = server.id;
  this.host = server.host;
  this.port = server.port;
  this.requests = {};
  this.timeout = {};
  this.queue = [];
  this.servicesMap = {};
  this.bufferMsg = opts.bufferMsg;
  this.keepalive = opts.keepalive || Constants.DEFAULT_PARAM.KEEPALIVE;
  this.interval = opts.interval || Constants.DEFAULT_PARAM.INTERVAL;
  this.timeoutValue = opts.timeout || Constants.DEFAULT_PARAM.CALLBACK_TIMEOUT;
  this.keepaliveTimer = null;
  this.lastPing = -1;
  this.lastPong = -1;
  this.connected = false;
  this.closed = false;
  this.opts = opts;
  this.serverId = opts.context.serverId;
};

util.inherits(MailBox, EventEmitter);

MailBox.prototype.connect = function(tracer, cb) {
  tracer && tracer.info('client', __filename, 'connect', 'mqtt-mailbox try to connect');
  if (this.connected) {
    tracer && tracer.error('client', __filename, 'connect', 'mailbox has already connected');
    return cb(new Error('mailbox has already connected.'));
  }

  let self = this;

  let stream = net.createConnection(this.port, this.host);
  this.socket = MqttCon(stream);

  let connectTimeout = setTimeout(function() {
    logger.error('rpc client %s connect to remote server %s timeout', self.serverId, self.id);
    self.emit('close', self.id);
  }, CONNECT_TIMEOUT);

  this.socket.connect({
    clientId: 'MQTT_RPC_' + Date.now()
  }, function() {
    if (self.connected) {
      return;
    }

    clearTimeout(connectTimeout);
    self.connected = true;
    if (self.bufferMsg) {
      self._interval = setInterval(function() {
        flush(self);
      }, self.interval);
    }

    self.setupKeepAlive();
  });

  this.socket.on('publish', function(pkg) {
    if(pkg.topic == Constants['TOPIC_HANDSHAKE']) {
      upgradeHandshake(self, pkg.payload);
      return cb();
    }
    try {
      pkg = Coder.decodeClient(pkg.payload);
      processMsg(self, pkg);
    } catch (err) {
      logger.error('rpc client %s process remote server %s message with error: %s', self.serverId, self.id, err.stack);
    }
  });

  this.socket.on('error', function(err) {
    logger.error('rpc socket %s is error, remote server %s host: %s, port: %s', self.serverId, self.id, self.host, self.port);
    self.emit('close', self.id);
    self.close();
  });

  this.socket.on('pingresp', function() {
    self.lastPong = Date.now();
  });

  this.socket.on('disconnect', function(reason) {
    logger.error('rpc socket %s is disconnect from remote server %s, reason: %s', self.serverId, self.id, reason);
    let reqs = self.requests;
    for (let id in reqs) {
      let ReqCb = reqs[id];
      ReqCb(tracer, new Error(self.serverId + ' disconnect with remote server ' + self.id));
    }
    self.emit('close', self.id);
  });
};

/**
 * close mailbox
 */
MailBox.prototype.close = function() {
  this.closed = true;
  this.connected = false;
  if (this._interval) {
    clearInterval(this._interval);
    this._interval = null;
  }
  if(this.keepaliveTimer) {
    clearInterval(this.keepaliveTimer);
    this.keepaliveTimer = null;
  }
  if(this.socket) {
    this.socket.destroy();
  }
};

/**
 * send message to remote server
 *
 * @param msg {service:"", method:"", args:[]}
 * @param opts {} attach info to send method
 * @param cb declaration decided by remote interface
 */
MailBox.prototype.send = function(tracer, msg, opts, cb) {
  tracer && tracer.info('client', __filename, 'send', 'mqtt-mailbox try to send');
  if (!this.connected) {
    tracer && tracer.error('client', __filename, 'send', 'mqtt-mailbox not init');
    cb(tracer, new Error(this.serverId + ' mqtt-mailbox is not init ' + this.id));
    return;
  }

  if (this.closed) {
    tracer && tracer.error('client', __filename, 'send', 'mailbox has already closed');
    cb(tracer, new Error(this.serverId + ' mqtt-mailbox has already closed ' + this.id));
    return;
  }

  let id = this.curId++;
  this.requests[id] = cb;
  setCbTimeout(this, id, tracer, cb);

  let pkg;
  if (tracer && tracer.isEnabled) {
    pkg = {
      traceId: tracer.id,
      seqId: tracer.seq,
      source: tracer.source,
      remote: tracer.remote,
      id: id,
      msg: msg
    };
  } else {
    pkg = Coder.encodeClient(id, msg, this.servicesMap);
    // pkg = {
    //   id: id,
    //   msg: msg
    // };
  }
  if (this.bufferMsg) {
    enqueue(this, pkg);
  } else {
    doSend(this.socket, pkg);
  }
};

MailBox.prototype.setupKeepAlive = function() {
  let self = this;
  this.keepaliveTimer = setInterval(function() {
    self.checkKeepAlive();
  }, this.keepalive);
}

MailBox.prototype.checkKeepAlive = function() {
  if (this.closed) {
    return;
  }

  // console.log('checkKeepAlive lastPing %d lastPong %d ~~~', this.lastPing, this.lastPong);
  let now = Date.now();
  let KEEP_ALIVE_TIMEOUT = this.keepalive * 2;
  if (this.lastPing > 0) {
    if (this.lastPong < this.lastPing) {
      if (now - this.lastPing > KEEP_ALIVE_TIMEOUT) {
        logger.error('mqtt rpc client %s checkKeepAlive timeout from remote server %s for %d lastPing: %s lastPong: %s', this.serverId, this.id, KEEP_ALIVE_TIMEOUT, this.lastPing, this.lastPong);
        this.emit('close', this.id);
        this.lastPing = -1;
        // this.close();
      }
    } else {
      this.socket.pingreq();
      this.lastPing = Date.now();
    }
  } else {
    this.socket.pingreq();
    this.lastPing = Date.now();
  }
}

let enqueue = function(mailbox, msg) {
  mailbox.queue.push(msg);
};

let flush = function(mailbox) {
  if (mailbox.closed || !mailbox.queue.length) {
    return;
  }
  doSend(mailbox.socket, mailbox.queue);
  mailbox.queue = [];
};

let doSend = function(socket, msg) {
  socket.publish({
    topic: 'rpc',
    payload: msg
    // payload: JSON.stringify(msg)
  });
}

let upgradeHandshake = function(mailbox, msg) {
  let servicesMap = JSON.parse(msg.toString());
  mailbox.servicesMap = servicesMap;
}

let processMsgs = function(mailbox, pkgs) {
  for (let i = 0, l = pkgs.length; i < l; i++) {
    processMsg(mailbox, pkgs[i]);
  }
};

let processMsg = function(mailbox, pkg) {
  let pkgId = pkg.id;
  clearCbTimeout(mailbox, pkgId);
  let cb = mailbox.requests[pkgId];
  if (!cb) {
    return;
  }

  delete mailbox.requests[pkgId];
  let rpcDebugLog = mailbox.opts.rpcDebugLog;
  let tracer = null;
  let sendErr = null;
  if (rpcDebugLog) {
    tracer = new Tracer(mailbox.opts.rpcLogger, mailbox.opts.rpcDebugLog, mailbox.opts.clientId, pkg.source, pkg.resp, pkg.traceId, pkg.seqId);
  }
  let pkgResp = pkg.resp;

  cb(tracer, sendErr, pkgResp);
};

let setCbTimeout = function(mailbox, id, tracer, cb) {
  // console.log('setCbTimeout %d', id);
  let timer = setTimeout(function() {
    // logger.warn('rpc request is timeout, id: %s, host: %s, port: %s', id, mailbox.host, mailbox.port);
    clearCbTimeout(mailbox, id);
    if (mailbox.requests[id]) {
      delete mailbox.requests[id];
    }
    let eMsg = util.format('rpc %s callback timeout %d, remote server %s host: %s, port: %s', mailbox.serverId, mailbox.timeoutValue, id, mailbox.host, mailbox.port);
    logger.error(eMsg);
    cb(tracer, new Error(eMsg));
  }, mailbox.timeoutValue);
  mailbox.timeout[id] = timer;
};

let clearCbTimeout = function(mailbox, id) {
  // console.log('clearCbTimeout %d', id);
  if (!mailbox.timeout[id]) {
    logger.warn('timer is not exsits, serverId: %s remote: %s, host: %s, port: %s', mailbox.serverId, id, mailbox.host, mailbox.port);
    return;
  }
  clearTimeout(mailbox.timeout[id]);
  delete mailbox.timeout[id];
};

/**
 * Factory method to create mailbox
 *
 * @param {Object} server remote server info {id:"", host:"", port:""}
 * @param {Object} opts construct parameters
 *                      opts.bufferMsg {Boolean} msg should be buffered or send immediately.
 *                      opts.interval {Boolean} msg queue flush interval if bufferMsg is true. default is 50 ms
 */
module.exports.create = function(server, opts) {
  return new MailBox(server, opts || {});
};