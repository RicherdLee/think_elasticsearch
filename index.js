/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/25
 */
'use strict';
//rewite promise, bluebird is more faster
global.Promise = require('bluebird');
require('babel-runtime/core-js/promise').default = Promise;
//define THINK object
global.ES = {};
//define DB instance
ES.DB = {};
ES.MODEL = {}
require('./lib/Util/lib.js');
//export
function requireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}
module.exports = requireDefault(require('./lib/esmodel.js')).default
