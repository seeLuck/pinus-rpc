/**
 * Create proxy.
 *
 * @param  {Object} opts construct parameters
 *           opts.origin {Object} delegated object
 *           opts.proxyCB {Function} proxy invoke callback
 *           opts.service {String} deletgated service name
 *           opts.attach {Object} attach parameter pass to proxyCB
 * @return {Object}      proxy instance
 */
export declare function create(opts: any): any;
