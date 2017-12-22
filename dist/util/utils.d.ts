export declare function invokeCallback(cb: any): void;
export declare function applyCallback(cb: any, args: any): void;
export declare function getObjectClass(obj: any): any;
/**
 * Utils check float
 *
 * @param  {Float}   float
 * @return {Boolean} true|false
 * @api public
 */
export declare function checkFloat(v: any): boolean;
/**
 * Utils check type
 *
 * @param  {String}   type
 * @return {Function} high order function
 * @api public
 */
export declare function isType(type: any): (obj: any) => boolean;
/**
 * Utils check array
 *
 * @param  {Array}   array
 * @return {Boolean} true|false
 * @api public
 */
export declare var checkArray: (obj: any) => boolean;
/**
 * Utils check number
 *
 * @param  {Number}  number
 * @return {Boolean} true|false
 * @api public
 */
export declare var checkNumber: (obj: any) => boolean;
/**
 * Utils check function
 *
 * @param  {Function}   func function
 * @return {Boolean}    true|false
 * @api public
 */
export declare var checkFunction: (obj: any) => boolean;
/**
 * Utils check object
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
export declare var checkObject: (obj: any) => boolean;
/**
 * Utils check string
 *
 * @param  {String}   string
 * @return {Boolean}  true|false
 * @api public
 */
export declare var checkString: (obj: any) => boolean;
/**
 * Utils check boolean
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
export declare var checkBoolean: (obj: any) => boolean;
/**
 * Utils check bean
 *
 * @param  {Object}   obj object
 * @return {Boolean}  true|false
 * @api public
 */
export declare var checkBean: (obj: any) => boolean;
export declare var checkNull: (obj: any) => boolean;
/**
 * Utils args to array
 *
 * @param  {Object}  args arguments
 * @return {Array}   array
 * @api public
 */
export declare var to_array: (args: any) => any[];
/**
 * Utils check is not null
 *
 * @param  {Object}   value
 * @return {Boolean}  true|false
 * @api public
 */
export declare var isNotNull: (value: any) => boolean;
export declare var getType: (object: any) => any;
export declare var typeArray: string[];
export declare var typeMap: {};
export declare var getBearcat: () => any;
export declare var genServicesMap: (services: any) => {}[];
