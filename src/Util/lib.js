/**
 *
 * @author     richen
 * @copyright  Copyright (c) 2016 - <richenlin(at)gmail.com>
 * @license    MIT
 * @version    16/7/26
 */
var fs = require('fs');
var util = require('util');
var crypto = require('crypto');
function _interopSafeRequire(obj) {
    return (obj && obj.__esModule && obj.default) ? obj.default : obj;
}

if (!Date.prototype.Format) {
    Date.prototype.Format = function (format) {
        let Week = ['日', '一', '二', '三', '四', '五', '六'];
        format = format.replace(/yyyy|YYYY/, this.getFullYear());
        format = format.replace(/yy|YY/, this.getYear() % 100 > 9 ? (this.getYear() % 100).toString() : '0' + this.getYear() % 100);
        format = format.replace(/mi|MI/, this.getMinutes() > 9 ? this.getMinutes().toString() : '0' + this.getMinutes());
        format = format.replace(/mm|MM/, this.getMonth() + 1 > 9 ? (this.getMonth() + 1).toString() : '0' + (this.getMonth() + 1));
        format = format.replace(/m|M/g, this.getMonth() + 1);
        format = format.replace(/w|W/g, Week[this.getDay()]);
        format = format.replace(/dd|DD/, this.getDate() > 9 ? this.getDate().toString() : '0' + this.getDate());
        format = format.replace(/d|D/g, this.getDate());
        format = format.replace(/hh|HH/, this.getHours() > 9 ? this.getHours().toString() : '0' + this.getHours());
        format = format.replace(/h|H/g, this.getHours());
        format = format.replace(/ss|SS/, this.getSeconds() > 9 ? this.getSeconds().toString() : '0' + this.getSeconds());
        return format;
    };
}
//Object上toString方法
global.toString = Object.prototype.toString;

/**
 * 是否是buffer
 * @type {Boolean}
 */
var isBuffer = Buffer.isBuffer;
/**
 * 是否是个数组
 * @type {Boolean}
 */
var isArray = Array.isArray;
/**
 * 是否是boolean
 * @param  {[type]}  obj
 * @return {Boolean}
 */
var isBoolean = function (obj) {
    'use strict';
    return toString.call(obj) === '[object Boolean]';
};
/**
 * 是否是数字
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isNumber = function (obj) {
    'use strict';
    return toString.call(obj) === '[object Number]';
};
/**
 * 是否是字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isString = function (obj) {
    'use strict';
    return toString.call(obj) === '[object String]';
};
/**
 * 是否是个对象
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isObject = function (obj) {
    'use strict';
    if (Buffer.isBuffer(obj)) {
        return false;
    }
    return toString.call(obj) === '[object Object]';
};
/**
 * 是否是个数字的字符串
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isNumberString = function (obj) {
    'use strict';
    let numberReg = /^((\-?\d*\.?\d*(?:e[+-]?\d*(?:\d?\.?|\.?\d?)\d*)?)|(0[0-7]+)|(0x[0-9a-f]+))$/i;
    return numberReg.test(obj);
};
/**
 * 是否是标准JSON对象
 * @param obj
 * @returns {boolean}
 */
var isJSONObj = function (obj) {
    'use strict';
    return typeof obj === 'object' && Object.prototype.toString.call(obj).toLowerCase() === '[object object]' && !obj.length;
};
/**
 * 是否是标准的JSON字符串
 * @param str
 * @returns {boolean}
 */
var isJSONStr = function (str) {
    'use strict';
    try {
        JSON.parse(str);
        return true;
    } catch (e) {
        return false;
    }
};
/**
 * 是否是个function
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isFunction = function (obj) {
    'use strict';
    return typeof obj === 'function';
};
/**
 * 是否是日期
 * @return {Boolean} [description]
 */
var isDate = function (obj) {
    'use strict';
    return util.isDate(obj);
};
/**
 * 是否是正则
 * @param  {[type]}  reg [description]
 * @return {Boolean}     [description]
 */
var isRegexp = function (obj) {
    'use strict';
    return util.isRegExp(obj);
};
/**
 * 是否是个标量
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isScalar = function (obj) {
    'use strict';
    return isBoolean(obj) || isNumber(obj) || isString(obj);
};
/**
 * 是否是个文件
 * @param  {[type]}  p [description]
 * @return {Boolean}   [description]
 */
var isFile = function (p) {
    'use strict';
    if (!fs.existsSync(p)) {
        return false;
    }
    let stats = fs.statSync(p);
    return stats.isFile();
};
/**
 * 是否是个错误
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isError = function (obj) {
    'use strict';
    return util.isError(obj);
};
/**
 * 判断对象是否为空
 * @param  {[type]}  obj
 * @return {Boolean}
 */
var isEmpty = function (obj) {
    'use strict';

    if (obj === null || obj === undefined || obj === '') {
        return true;
    } else if (isString(obj)) {
        //\s 匹配任何空白字符，包括空格、制表符、换页符等等。等价于 [ \f\n\r\t\v]。
        return obj.replace(/(^\s*)|(\s*$)/g, '').length === 0;
    } else if (isArray(obj)) {
        return obj.length === 0;
    } else if (isObject(obj)) {
        for (let key in obj) {
            return false;
        }
        return true;
    } else {
        return false;
    }
};
/**
 * 判断值是否是数组的元素
 * @param needle
 * @param haystack 数组
 * @returns {boolean}
 */
var inArray = function (needle, haystack) {
    'use strict';
    let length = haystack.length;
    for (let i = 0; i < length; i++) {
        if (haystack[i] == needle) return true;
    }
    return false;
};
/**
 * 判断是否是个promise
 * @param  {[type]}  obj [description]
 * @return {Boolean}     [description]
 */
var isPromise = function (obj) {
    'use strict';
    return !!(obj && typeof obj.then === 'function');
};

/**
 *
 * @returns {{}}
 */
var getDefer = function () {
    'use strict';
    let deferred = {};
    deferred.promise = new Promise(function (resolve, reject) {
        deferred.resolve = resolve;
        deferred.reject = reject;
    });
    return deferred;
};
/**
 * make callback function to promise
 * @param  {Function} fn       []
 * @param  {Object}   receiver []
 * @return {Promise}            []
 */
var promisify = function (fn, receiver) {
    'use strict';
    return function (...args) {
        return new Promise(function (resolve, reject) {
            fn.apply(receiver, [...args, function (err, res) {
                return err ? reject(err) : resolve(res);
            }]);
        });
    };
};
/**
 * 大写首字符
 * @param  {[type]} name [description]
 * @return {[type]}      [description]
 */
var ucFirst = function (name) {
    'use strict';
    name = (name || '') + '';
    return name.substr(0, 1).toUpperCase() + name.substr(1).toLowerCase();
};
/**
 * 字符串命名风格转换
 * @param  {[type]} name [description]
 * @param  {[type]} type [description]
 * @return {[type]}      [description]
 */
var parseName = function (name) {
    name = name.trim();
    if (!name) {
        return name;
    }
    //首字母如果是大写，不转义为_x
    name = name[0].toLowerCase() + name.substr(1);
    return name.replace(/[A-Z]/g, function (a) {
        return '_' + a.toLowerCase();
    });
};
/**
 * 字符串或文件hash,比md5效率高,但是有很低的概率重复
 * @param input
 * @returns {string}
 */
var hash = function (input) {
    'use strict';
    let _hash = 5381;
    let I64BIT_TABLE =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'.split('');
    let i = input.length - 1;

    if (typeof input === 'string') {
        for (; i > -1; i--)
            _hash += (_hash << 5) + input.charCodeAt(i);
    }
    else {
        for (; i > -1; i--)
            _hash += (_hash << 5) + input[i];
    }
    let value = _hash & 0x7FFFFFFF;

    let retValue = '';
    do {
        retValue += I64BIT_TABLE[value & 0x3F];
    }
    while (value >>= 6);

    return retValue;
};
/**
 * 控制台打印
 * @param msg
 * @param type
 * @param showTime
 * @constructor
 */
var log = function (msg, type, showTime) {
    'use strict';
    let d = new Date();
    let date = d.Format('yyyy-mm-dd');
    let time = d.Format('hh:mi:ss');
    let dateTime = `[${date} ${time}] `;

    let message = msg;
    if (util.isError(msg)) {
        type = 'ERROR';
        message = msg.stack;
        //console.error(msg.stack);
    } else if (type === 'ERROR') {
        type = 'ERROR';
        //console.error(msg);
    } else if (type === 'WARNING') {
        type = 'WARNING';
        //console.warn(msg);
    } else {
        if (!Object.prototype.toString.call(msg) === '[object String]') {
            message = JSON.stringify(msg);
        }
        if (Object.prototype.toString.call(showTime) === '[object Number]') {
            let _time = Date.now() - showTime;
            message += '  ' + `${_time}ms`;
        }
        type = type || 'INFO';
    }
    console.log(`${dateTime}[${type}] ${message}`);
    return;
};
/**
 * 执行等待，避免一个耗时的操作多次被执行。 callback 需要返回一个 Promise 。
 * @param  {String}   key      []
 * @param  {Function} callback []
 * @return {Promise}            []
 */
var _ormAwaitInstance = new (_interopSafeRequire(require('./await.js')))();
var _await = function (key, callback) {
    return _ormAwaitInstance.run(key, callback);
};
/**
 * 加载文件
 * @param  {[type]} file [description]
 * @return {[type]}      [description]
 */
var thinkRequire = function (file) {
    'use strict';
    try {
        var obj = require(file);
        obj = _interopSafeRequire(obj);
        if (isFunction(obj)) {
            obj.prototype.__filename = file;
        }
        return obj;
    } catch (err) {
        return null;
    }
};
/**
 * extend, from jquery，具有深度复制功能
 * @return {[type]} [description]
 */
var extend = function () {
    'use strict';
    let args = [].slice.call(arguments);
    let deep = true;
    let target;
    if (isBoolean(args[0])) {
        deep = args.shift();
    }
    if (deep) {
        target = isArray(args[0]) ? [] : {};
    } else {
        target = args.shift();
    }
    target = target || {};
    var i = 0,
        length = args.length,
        options = undefined,
        name = undefined,
        src = undefined,
        copy = undefined;
    for (; i < length; i++) {
        options = args[i];
        if (!options) {
            continue;
        }
        for (name in options) {
            src = target[name];
            copy = options[name];
            if (src && src === copy) {
                continue;
            }
            if (deep) {
                if (isObject(copy)) {
                    target[name] = extend(src && isObject(src) ? src : {}, copy);
                } else if (isArray(copy)) {
                    target[name] = extend([], copy);
                } else {
                    target[name] = copy;
                }
            } else {
                target[name] = copy;
            }
        }
    }
    return target;
};

/**
 * 获取字符串的md5
 * @param  {[type]} str [description]
 * @return {[type]} charset [description]
 */
var md5 = function (str, charset = 'utf-8') {
    let instance = crypto.createHash('md5');
    instance.update(str + '', charset);
    return instance.digest('hex');
};

module.exports = {
    isBuffer: isBuffer,
    isArray: isArray,
    isBoolean: isBoolean,
    isNumber: isNumber,
    isString: isString,
    isObject: isObject,
    isNumberString: isNumberString,
    isJSONObj: isJSONObj,
    isJSONStr: isJSONStr,
    isFunction: isFunction,
    isDate: isDate,
    isRegexp: isRegexp,
    isScalar: isScalar,
    isFile: isFile,
    isError: isError,
    isEmpty: isEmpty,
    inArray: inArray,
    isPromise: isPromise,
    getDefer: getDefer,
    promisify: promisify,
    ucFirst: ucFirst,
    parseName: parseName,
    hash: hash,
    log: log,
    await: _await,
    extend: extend,
    md5: md5,
    thinkRequire: thinkRequire
};
