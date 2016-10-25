'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base2 = require('./base');

var _base3 = _interopRequireDefault(_base2);

var _lib = require('./Util/lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/11
 */
var parseMap = function parseMap(mapping) {
    for (var map in mapping) {
        if (_lib2.default.isString(mapping[map]) && _lib2.default.isEmpty(mapping[map].type)) {
            delete mapping[map];
            continue;
        }
        switch (mapping[map].type) {
            case 'second':
                //10位时间戳
                mapping[map] = { type: 'date', format: 'epoch_second' };
                break;
            case 'millis':
                //13位时间戳
                mapping[map] = { type: 'date', format: 'epoch_millis' };
                break;
            case 'time':
                //time同样表示时间格式
                mapping[map]['type'] = 'date';
                break;
            case undefined:
                //子对象,需要进一步解析
                mapping[map] = { properties: parseMap(mapping[map]) };
                break;
            case 'string':
                //默认不进行Analysis not_analyzed
                mapping[map]['analysis'] || (mapping[map]['index'] = 'not_analyzed');
                break;
            default:
                break;
        }
    }
    return mapping;
};

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init(config) {
        this.config = config;
        this.__options = {};
        this._mapping = {};
        //表示数据不能直接迁移
        this.safe = true;
    };

    /**
     * 初始化ES模型,设置ES mapping
     */


    _class.prototype.setCollection = function () {
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
            var _this2 = this;

            var _ES$MODEL$aliasesInde, aliases, aliasesIndex, aliasesversion, versionArr;

            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            if (!(_lib2.default.isEmpty(ES.MODEL[this.index]) || _lib2.default.isEmpty(ES.MODEL[this.index][this.type]))) {
                                _context2.next = 17;
                                break;
                            }

                            _context2.next = 3;
                            return this.adapter().getAlias(null, this.index);

                        case 3:
                            aliases = _context2.sent;
                            aliasesIndex = this.index, aliasesversion = '';

                            if (!_lib2.default.isEmpty(aliases)) {
                                this.index = (0, _keys2.default)(aliases)[0];
                                versionArr = this.index.split('_');

                                aliasesversion = versionArr[versionArr.length - 1];
                            }
                            //console.log(this.index,aliasesversion)
                            //解析mapping
                            this._mapping = { properties: parseMap(this._mapping) };
                            //console.log(this._mapping)
                            //将mapping写入全局变量
                            _lib2.default.isEmpty(ES.MODEL[aliasesIndex]) ? ES.MODEL[aliasesIndex] = (_ES$MODEL$aliasesInde = {}, _ES$MODEL$aliasesInde[this.type] = {
                                key: _lib2.default.md5((0, _stringify2.default)(this._mapping)),
                                version: aliasesversion
                            }, _ES$MODEL$aliasesInde) : ES.MODEL[aliasesIndex][this.type] = {
                                key: _lib2.default.md5((0, _stringify2.default)(this._mapping)),
                                version: aliasesversion
                            };

                            if (!this.safe) {
                                _context2.next = 17;
                                break;
                            }

                            _context2.next = 11;
                            return this.adapter().existsType(this.index, this.type);

                        case 11:
                            if (!_context2.sent) {
                                _context2.next = 15;
                                break;
                            }

                            return _context2.delegateYield(_regenerator2.default.mark(function _callee() {
                                var esmapping, checkfield, oldindex, newindex;
                                return _regenerator2.default.wrap(function _callee$(_context) {
                                    while (1) {
                                        switch (_context.prev = _context.next) {
                                            case 0:
                                                _context.next = 2;
                                                return _this2.adapter().getMapping(_this2.index, _this2.type);

                                            case 2:
                                                esmapping = _context.sent;

                                                //此处要根据model设置的mapping挑出ES文档设置的mapping,判断是追加还是改变,因为ES不能对已存在的字段进行属性改变,此种状态只能重建索引,而追加则可以操作
                                                //创建文档,并生成别名,别名用于变更mapping时使用,由于ES不能动态重设mapping,所以只能通过重建mapping,reindex重新索引
                                                //而为了保证模型名称不变,因此需要通过别名方式
                                                checkfield = function checkfield(map1, map2) {
                                                    for (var map in map1) {
                                                        if (map2[map]) {
                                                            if (!map2[map]['type']) {
                                                                checkfield(map1[map], map2[map]);
                                                            } else {
                                                                if (_lib2.default.md5((0, _stringify2.default)(map1[map])) !== _lib2.default.md5((0, _stringify2.default)(map2[map]))) {
                                                                    //console.log(map1);
                                                                    //console.log(map2);
                                                                    return false;
                                                                }
                                                            }
                                                        }
                                                    }
                                                    return true;
                                                };

                                                oldindex = ES.MODEL[aliasesIndex][_this2.type]['version'] ? aliasesIndex + '_' + ES.MODEL[aliasesIndex][_this2.type]['version'] : _this2.index;

                                                if (checkfield(_this2._mapping['properties'], esmapping[oldindex]['mappings'][_this2.type]['properties'])) {
                                                    _context.next = 17;
                                                    break;
                                                }

                                                //需要重新创建索引
                                                newindex = aliasesIndex + '_' + (aliasesversion * 1 + 1);
                                                _context.next = 9;
                                                return _this2.adapter().createIndex(newindex);

                                            case 9:
                                                _context.next = 11;
                                                return _this2.adapter().setMapping(newindex, _this2.type, _this2._mapping);

                                            case 11:
                                                _context.next = 13;
                                                return _this2.adapter().reIndex(oldindex, newindex);

                                            case 13:
                                                _context.next = 15;
                                                return _this2.adapter().delIndex(oldindex);

                                            case 15:
                                                _context.next = 17;
                                                return _this2.adapter().setAlias(newindex, aliasesIndex);

                                            case 17:
                                            case 'end':
                                                return _context.stop();
                                        }
                                    }
                                }, _callee, _this2);
                            })(), 't0', 13);

                        case 13:
                            _context2.next = 17;
                            break;

                        case 15:
                            _context2.next = 17;
                            return this.adapter().setMapping(this.index, this.type, this._mapping);

                        case 17:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function setCollection() {
            return _ref.apply(this, arguments);
        }

        return setCollection;
    }();

    /**
     * 错误封装
     * @param err
     */


    _class.prototype.error = function error(err) {
        if (err) {
            var msg = err;
            if (!_lib2.default.isError(msg)) {
                if (!_lib2.default.isString(msg)) {
                    msg = (0, _stringify2.default)(msg);
                }
                msg = new Error(msg);
            }
            var stack = msg.message ? msg.message.toLowerCase() : '';
            // connection error
            if (~stack.indexOf('connect') || ~stack.indexOf('refused')) {
                this.instances && this.instances.close && this.instances.close();
            }
            _lib2.default.log(msg);
        }
        return _lib2.default.getDefer().promise;
    };

    _class.prototype.getPk = function getPk() {
        return '_id';
    };

    /**
     * 获取elasticsearch适配器单例
     */


    _class.prototype.adapter = function adapter() {
        if (this._adapter) return this._adapter;
        var Adapter = require('./Adapter/elasticsearch').default;
        this._adapter = new Adapter(this.config);
        return this._adapter;
    };

    _class.prototype.setIndex = function setIndex(index) {
        this.__options.index = index;
        return this;
    };

    _class.prototype.setType = function setType(type) {
        this.__options.type = type;
        return this;
    };

    /**
     * 全文搜索
     * @param match
     */


    _class.prototype.match = function match(_match) {
        if (_lib2.default.isObject(_match)) _match = this.__options.match = _match;
        return this;
    };

    /**
     * 过滤(精确查询)
     * @param filter
     */


    _class.prototype.filter = function filter(_filter) {
        this.__options.filter = _filter;
        return this;
    };

    /**
     * 原生查询/过滤条件
     * @param where
     */


    _class.prototype.where = function where(_where) {
        this.__options.where = _where;
        return this;
    };

    /**
     * 聚合排序
     * @param aggs
     */


    _class.prototype.aggs = function aggs(_aggs) {
        this.__options.aggs = _aggs;
        return this;
    };

    /**
     * 设置主键
     */
    //modify by lihao 删除此方法,ES在mapping可指定从文档的字段生成_id
    //setId(idvalue) {
    //    this.__options.id = idvalue;
    //    return this;
    //}

    /**
     * 查询字段
     * @param  {[type]} fields   [description]
     * @return {[type]}         [description]
     */


    _class.prototype.field = function field(fields) {
        if (!fields) {
            return this;
        }
        if (typeof fields === 'string') {
            fields = fields.replace(/ +/g, '').split(',');
        }
        this.__options.fields = fields;
        return this;
    };

    /**
     * 指定查询数量
     * @param offset
     * @param length
     */


    _class.prototype.limit = function limit(offset, length) {
        if (offset === undefined) {
            return this;
        }

        if (_lib2.default.isArray(offset)) {
            offset = offset[0], length = offset[1];
        }

        offset = Math.max(parseInt(offset) || 0, 0);
        if (length) {
            length = Math.max(parseInt(length) || 0, 0);
        }
        this.__options.limit = [offset, length];
        return this;
    };

    /**
     * 排序
     * @param order
     */


    _class.prototype.order = function order(_order) {
        if (_order === undefined) return this;
        this.__options.order = _order;
        return this;
    };

    /**
     * 新增一条记录
     * @param data
     */


    _class.prototype.add = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(data, options) {
            var parsedOptions;
            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return this._parseOptions(options);

                        case 2:
                            parsedOptions = _context3.sent;

                            this.__data = _lib2.default.extend({}, data);
                            return _context3.abrupt('return', this.adapter().add(this.__data, parsedOptions));

                        case 5:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function add(_x, _x2) {
            return _ref2.apply(this, arguments);
        }

        return add;
    }();

    /**
     * 添加多条记录
     * @param data
     * @param options
     */


    _class.prototype.addAll = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(data, options) {
            var parsedOptions;
            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return this._parseOptions(options);

                        case 2:
                            parsedOptions = _context4.sent;

                            this.__data = _lib2.default.extend([], data);
                            return _context4.abrupt('return', this.adapter().addAll(this.__data, parsedOptions));

                        case 5:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function addAll(_x3, _x4) {
            return _ref3.apply(this, arguments);
        }

        return addAll;
    }();

    /**
     * 查询一条记录
     * @param options
     */


    _class.prototype.find = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(options) {
            var parsedOptions;
            return _regenerator2.default.wrap(function _callee5$(_context5) {
                while (1) {
                    switch (_context5.prev = _context5.next) {
                        case 0:
                            _context5.next = 2;
                            return this._parseOptions(options);

                        case 2:
                            parsedOptions = _context5.sent;
                            return _context5.abrupt('return', this.adapter().find(parsedOptions));

                        case 4:
                        case 'end':
                            return _context5.stop();
                    }
                }
            }, _callee5, this);
        }));

        function find(_x5) {
            return _ref4.apply(this, arguments);
        }

        return find;
    }();

    /**
     * 查询结果集
     * @param options
     * @returns {*}
     */


    _class.prototype.select = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(options) {
            var parsedOptions;
            return _regenerator2.default.wrap(function _callee6$(_context6) {
                while (1) {
                    switch (_context6.prev = _context6.next) {
                        case 0:
                            _context6.next = 2;
                            return this._parseOptions(options);

                        case 2:
                            parsedOptions = _context6.sent;
                            return _context6.abrupt('return', this.adapter().select(parsedOptions));

                        case 4:
                        case 'end':
                            return _context6.stop();
                    }
                }
            }, _callee6, this);
        }));

        function select(_x6) {
            return _ref5.apply(this, arguments);
        }

        return select;
    }();

    /**
     * 查询数量
     * @param options
     */


    _class.prototype.count = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(options) {
            var parsedOptions;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.next = 2;
                            return this._parseOptions(options);

                        case 2:
                            parsedOptions = _context7.sent;
                            return _context7.abrupt('return', this.adapter().count(parsedOptions));

                        case 4:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function count(_x7) {
            return _ref6.apply(this, arguments);
        }

        return count;
    }();

    /**
     * 求和
     * @param field
     */


    _class.prototype.sum = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(field, options) {
            var parsedOptions, res;
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            if (!(field === undefined)) {
                                _context8.next = 2;
                                break;
                            }

                            return _context8.abrupt('return', this.error('need sum field'));

                        case 2:
                            this.aggs({ sum: { sum: { field: field } } });
                            _context8.next = 5;
                            return this._parseOptions(options);

                        case 5:
                            parsedOptions = _context8.sent;
                            _context8.next = 8;
                            return this.adapter().count(parsedOptions);

                        case 8:
                            res = _context8.sent;
                            return _context8.abrupt('return', res.aggregations.sum.value);

                        case 10:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function sum(_x8, _x9) {
            return _ref7.apply(this, arguments);
        }

        return sum;
    }();

    /**
     * 平均值
     * @param field
     */


    _class.prototype.avg = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(field, options) {
            var parsedOptions, res;
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            if (!(field === undefined)) {
                                _context9.next = 2;
                                break;
                            }

                            return _context9.abrupt('return', this.error('need avg field'));

                        case 2:
                            this.aggs({ avg: { avg: { field: field } } });
                            _context9.next = 5;
                            return this._parseOptions(options);

                        case 5:
                            parsedOptions = _context9.sent;
                            _context9.next = 8;
                            return this.adapter().count(parsedOptions);

                        case 8:
                            res = _context9.sent;
                            return _context9.abrupt('return', res.aggregations.avg.value);

                        case 10:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function avg(_x10, _x11) {
            return _ref8.apply(this, arguments);
        }

        return avg;
    }();

    /**
     * min
     * @param field
     */


    _class.prototype.min = function () {
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(field, options) {
            var parsedOptions, res;
            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            if (!(field === undefined)) {
                                _context10.next = 2;
                                break;
                            }

                            return _context10.abrupt('return', this.error('need min field'));

                        case 2:
                            this.aggs({ min: { min: { field: field } } });
                            _context10.next = 5;
                            return this._parseOptions(options);

                        case 5:
                            parsedOptions = _context10.sent;
                            _context10.next = 8;
                            return this.adapter().count(parsedOptions);

                        case 8:
                            res = _context10.sent;
                            return _context10.abrupt('return', res.aggregations.min.value);

                        case 10:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function min(_x12, _x13) {
            return _ref9.apply(this, arguments);
        }

        return min;
    }();

    /**
     * 最大值
     * @param field
     */


    _class.prototype.max = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(field, options) {
            var parsedOptions, res;
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            if (!(field === undefined)) {
                                _context11.next = 2;
                                break;
                            }

                            return _context11.abrupt('return', this.error('need max field'));

                        case 2:
                            this.aggs({ max: { max: { field: field } } });
                            _context11.next = 5;
                            return this._parseOptions(options);

                        case 5:
                            parsedOptions = _context11.sent;
                            _context11.next = 8;
                            return this.adapter().count(parsedOptions);

                        case 8:
                            res = _context11.sent;
                            return _context11.abrupt('return', res.aggregations.max.value);

                        case 10:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this);
        }));

        function max(_x14, _x15) {
            return _ref10.apply(this, arguments);
        }

        return max;
    }();

    /**
     * 解析参数
     * @param options
     */


    _class.prototype._parseOptions = function _parseOptions(oriOpts, extraOptions) {
        var options = void 0;
        if (_lib2.default.isScalar(oriOpts)) {
            options = _lib2.default.extend({}, this.__options);
        } else {
            options = _lib2.default.extend({}, this.__options, oriOpts, extraOptions);
        }

        this.__options = {};
        options.index = this.index;
        options.type = this.type;

        return options;
    };

    return _class;
}(_base3.default);

exports.default = _class;