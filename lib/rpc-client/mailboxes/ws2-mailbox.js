import {EventEmitter} from 'events';
import * as util from 'util';
import * as utils from '../../util/utils';
import * as wsClient from 'ws';
import * as zlib from 'zlib';
import * as Tracer from '../../util/tracer';
let DEFAULT_CALLBACK_TIMEOUT = 10 * 1000;
let DEFAULT_INTERVAL = 50;

let KEEP_ALIVE_TIMEOUT = 10 * 1000;
let KEEP_ALIVE_INTERVAL = 30 * 1000;
let KEEP_ALIVE_INTERVAL = 30 * 1000;

let DEFAULT_ZIP_LENGTH = 1024 * 10;
let useZipCompress = false;

let MailBox = function(server, opts) {
  EventEmitter.call(this);
  this.id = server.id;
  this.host = server.host;
  this.port = server.port;
  this.requests = {};
  this.timeout = {};
  this.curId = 0;
  this.queue = [];
  this.bufferMsg = opts.bufferMsg;
  this.interval = opts.interval || DEFAULT_INTERVAL;
  this.timeoutValue = opts.timeout || DEFAULT_CALLBACK_TIMEOUT;
  this.connected = false;
  this.closed = false;
  this.opts = opts;
  this._KPinterval = null;
  this._KP_last_ping_time = -1;
  this._KP_last_pong_time = -1;
  DEFAULT_ZIP_LENGTH = opts.doZipLength || DEFAULT_ZIP_LENGTH;
  useZipCompress = opts.useZipCompress || false;
};
util.inherits(MailBox, EventEmitter);

let pro = MailBox.prototype;

pro.connect = function(tracer, cb) {
  tracer && tracer.info('client', __filename, 'connect', 'ws-mailbox try to connect');
  if (this.connected) {
    tracer && tracer.error('client', __filename, 'connect', 'mailbox has already connected');
    cb(new Error('mailbox has already connected.'));
    return;
  }

  this.socket = wsClient.connect('ws://' + this.host + ':' + this.port);
  //this.socket = wsClient.connect(this.host + ':' + this.port, {'force new connection': true, 'reconnect': false});

  let self = this;
  this.socket.on('message', function(data, flags) {
    try {
      // console.log("ws rpc client received message = " + data);
      let msg = data;

      msg = JSON.parse(msg);

      if (msg.body instanceof Array) {
        processMsgs(self, msg.body);
      } else {
        processMsg(self, msg.body);
      }
    } catch (e) {
      console.error('ws rpc client process message with error: %j', e.stack);
    }
  });

  this.socket.on('open', function() {
    if (self.connected) {
      //ignore reconnect
      return;
    }
    // success to connect
    self.connected = true;
    if (self.bufferMsg) {
      // start flush interval
      self._interval = setInterval(function() {
        flush(self);
      }, self.interval);
    }
    self._KPinterval = setInterval(function() {
      checkKeepAlive(self);
    }, KEEP_ALIVE_INTERVAL);
    utils.invokeCallback(cb);
  });

  this.socket.on('error', function(err) {
    utils.invokeCallback(cb, err);
    self.close();
  });

  this.socket.on('close', function(code, message) {
    let reqs = self.requests,
      cb;
    for (let id in reqs) {
      cb = reqs[id];
      utils.invokeCallback(cb, new Error('disconnect with remote server.'));
    }
    self.emit('close', self.id);
    self.close();
  });

  //  this.socket.on('ping', function (data, flags) {
  //  });
  this.socket.on('pong', function(data, flags) {
    ////console.log('ws received pong: %s', data);
    self._KP_last_pong_time = Date.now();
  });

};

let checkKeepAlive = function(mailbox) {
  if (mailbox.closed) {
    return;
  }
  let now = Date.now();
  if (mailbox._KP_last_ping_time > 0) {
    if (mailbox._KP_last_pong_time < mailbox._KP_last_ping_time) {
      if (now - mailbox._KP_last_ping_time > KEEP_ALIVE_TIMEOUT) {
        console.error('ws rpc client checkKeepAlive error because > KEEP_ALIVE_TIMEOUT');
        mailbox.close();
        return;
      } else {
        return;
      }
    }
    if (mailbox._KP_last_pong_time >= mailbox._KP_last_ping_time) {
      mailbox.socket.ping();
      mailbox._KP_last_ping_time = Date.now();
      return;
    }
  } else {
    mailbox.socket.ping();
    mailbox._KP_last_ping_time = Date.now();
  }
};

/**
 * close mailbox
 */
pro.close = function() {
  if (this.closed) {
    return;
  }
  this.closed = true;
  this.connected = false;
  if (this._interval) {
    clearInterval(this._interval);
    this._interval = null;
  }
  if (this._KPinterval) {
    clearInterval(this._KPinterval);
    this._KPinterval = null;
  }
  this.socket.close();
  this._KP_last_ping_time = -1;
  this._KP_last_pong_time = -1;
};

/**
 * send message to remote server
 *
 * @param msg {service:"", method:"", args:[]}
 * @param opts {} attach info to send method
 * @param cb declaration decided by remote interface
 */
pro.send = function(tracer, msg, opts, cb) {
  tracer && tracer.info('client', __filename, 'send', 'ws-mailbox try to send');
  if (!this.connected) {
    tracer && tracer.error('client', __filename, 'send', 'ws-mailbox not init');
    cb(tracer, new Error('not init.'));
    return;
  }

  if (this.closed) {
    tracer && tracer.error('client', __filename, 'send', 'mailbox alread closed');
    cb(tracer, new Error('mailbox alread closed.'));
    return;
  }

  let id = this.curId++;
  this.requests[id] = cb;
  setCbTimeout(this, id);

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
    pkg = {
      id: id,
      msg: msg
    };
  }
  if (this.bufferMsg) {
    enqueue(this, pkg);
  } else {
    doSend(this.socket, pkg);
    //this.socket.send(JSON.stringify({body: pkg}));
  }
};

let enqueue = function(mailbox, msg) {
  mailbox.queue.push(msg);
};

let flush = function(mailbox) {
  if (mailbox.closed || !mailbox.queue.length) {
    return;
  }
  doSend(mailbox.socket, mailbox.queue);
  //mailbox.socket.send(JSON.stringify({body: mailbox.queue}));
  mailbox.queue = [];
};

let doSend = function(socket, dataObj) {
  let str = JSON.stringify({
    body: dataObj
  });
  // console.log("ws rpc client send str = " + str);
  //console.log("ws rpc client send str len = " + str.length);
  //console.log("ws rpc client send message, len = " + str.length);
  socket.send(str);
};

let processMsgs = function(mailbox, pkgs) {
  for (let i = 0, l = pkgs.length; i < l; i++) {
    processMsg(mailbox, pkgs[i]);
  }
};

let processMsg = function(mailbox, pkg) {
  clearCbTimeout(mailbox, pkg.id);
  let cb = mailbox.requests[pkg.id];
  if (!cb) {
    return;
  }
  delete mailbox.requests[pkg.id];
  let rpcDebugLog = mailbox.opts.rpcDebugLog;
  let tracer = null;
  let sendErr = null;
  if (rpcDebugLog) {
    tracer = new Tracer(mailbox.opts.rpcLogger, mailbox.opts.rpcDebugLog, mailbox.opts.clientId, pkg.source, pkg.resp, pkg.traceId, pkg.seqId);
  }
  let pkgResp = pkg.resp;
  // let args = [tracer, null];

  // pkg.resp.forEach(function(arg){
  //   args.push(arg);
  // });

  cb(tracer, sendErr, pkgResp);
};

let setCbTimeout = function(mailbox, id) {
  let timer = setTimeout(function() {
    clearCbTimeout(mailbox, id);
    if (!!mailbox.requests[id]) {
      delete mailbox.requests[id];
    }
  }, mailbox.timeoutValue);
  mailbox.timeout[id] = timer;
};

let clearCbTimeout = function(mailbox, id) {
  if (!mailbox.timeout[id]) {
    console.warn('timer is not exsits, id: %s', id);
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