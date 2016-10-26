'use strict';

exports.__esModule = true;

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

var _lib = require('../Util/lib');

var _lib2 = _interopRequireDefault(_lib);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 *
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/10
 */
var parseCondition = function parseCondition(conditionObj) {
    var condition = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

    var _range, _range2, _range3, _range4, _range5;

    var k = arguments[2];
    var op = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'must';

    var identifiers = {
        or: 'should',
        should: 'should',
        not: 'must_not',
        must_not: 'must_not',
        and: 'must',
        must: 'must',
        '>': 'gt',
        gt: 'gt',
        '>=': 'gte',
        gte: 'gte',
        '<': 'lt',
        lt: 'lt',
        '<=': 'lte',
        lte: 'lte',
        between: 'range',
        range: 'range'
    };
    var key = void 0,
        value = void 0,
        cval = void 0;
    //{id:1,or:[],not:[]}
    for (var ckey in conditionObj) {
        cval = conditionObj[ckey];
        switch (identifiers[ckey]) {
            case 'should':
                condition.should || (condition.should = []);
                for (var _iterator = cval, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : (0, _getIterator3.default)(_iterator);;) {
                    var _ref;

                    if (_isArray) {
                        if (_i >= _iterator.length) break;
                        _ref = _iterator[_i++];
                    } else {
                        _i = _iterator.next();
                        if (_i.done) break;
                        _ref = _i.value;
                    }

                    var v = _ref;

                    key = (0, _keys2.default)(v)[0];
                    value = v[key];
                    //console.log(key,value)
                    condition = parseCondition(v, condition, key, 'should');
                }
                break;
            case 'must_not':
                condition.must_not || (condition.must_not = []);
                for (var _iterator2 = cval, _isArray2 = Array.isArray(_iterator2), _i2 = 0, _iterator2 = _isArray2 ? _iterator2 : (0, _getIterator3.default)(_iterator2);;) {
                    var _ref2;

                    if (_isArray2) {
                        if (_i2 >= _iterator2.length) break;
                        _ref2 = _iterator2[_i2++];
                    } else {
                        _i2 = _iterator2.next();
                        if (_i2.done) break;
                        _ref2 = _i2.value;
                    }

                    var _v = _ref2;

                    key = (0, _keys2.default)(_v)[0];
                    value = _v[key];
                    //console.log(key,value)
                    condition = parseCondition(_v, condition, key, 'must_not');
                }
                break;
                break;
            case 'gt':
                condition[op] || (condition[op] = []);
                condition[op].push({ range: (_range = {}, _range[k] = { gt: cval }, _range) });
                break;
            case 'gte':
                condition[op] || (condition[op] = []);
                condition[op].push({ range: (_range2 = {}, _range2[k] = { gte: cval }, _range2) });
                break;
            case 'lt':
                condition[op] || (condition[op] = []);
                condition[op].push({ range: (_range3 = {}, _range3[k] = { lt: cval }, _range3) });
                break;
            case 'lte':
                condition[op] || (condition[op] = []);
                condition[op].push({ range: (_range4 = {}, _range4[k] = { lte: cval }, _range4) });
                break;
            case 'range':
                condition[op] || (condition[op] = []);
                condition[op].push({ range: (_range5 = {}, _range5[k] = { from: cval[0], to: cval[1] }, _range5) });
                break;
            case 'must':
            default:
                condition[op] || (condition[op] = []);
                if (_lib2.default.isObject(cval)) {
                    condition = parseCondition(cval, condition, ckey, op);
                } else {
                    var _term;

                    condition[op].push({ term: (_term = {}, _term[ckey] = { value: cval }, _term) });
                }
                break;
        }
    }
    return condition;
};

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init(config) {
        this.config = config;
        this.queryObj = {
            body: {
                query: {
                    filtered: {}
                }
            }
        };
        this.handel = null;
        this.resultObj = {};
    };

    /**
     * 获取连接
     * @returns {*|null}
     */


    _class.prototype.socket = function socket() {
        if (this.handel) {
            return this.handel;
        }
        var socket = require('../Socket/elasticsearch').default;
        this.handel = new socket(this.config);
        return this.handel;
    };

    _class.prototype.getResult = function getResult() {
        return this.resultObj;
    };

    /**
     * 关闭连接
     */


    _class.prototype.close = function close() {
        if (this.handel) {
            this.handel.close();
            this.handel = null;
        }
    };

    _class.prototype.ping = function ping() {
        return this.socket().connect().then(function (conn) {
            return conn.ping();
        }).then(function (res) {
            //this.close();
            return res;
        });
    };

    _class.prototype.query = function query() {
        var _this2 = this;

        var searchType = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'query_then_fetch';

        this.queryObj.searchType = searchType;
        console.log((0, _stringify2.default)(this.queryObj));
        return this.socket().connect().then(function (conn) {
            return conn.search(_this2.queryObj);
        }).then(function (data) {
            //this.close();
            return data;
        });
    };

    _class.prototype.execute = function execute(data) {
        var _this3 = this;

        var optype = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'create';

        this.queryObj.body = _lib2.default.extend(this.queryObj.body, data);
        return this.socket().connect().then(function (conn) {
            console.log(_this3.queryObj);
            return conn[optype](_this3.queryObj);
        }).then(function (data) {
            //this.close();
            return data;
        }).catch(function (err) {
            console.log(err);
        });
    };

    /**
     * 创建索引
     * @param index
     */


    _class.prototype.createIndex = function createIndex(index) {
        return this.socket().connect().then(function (conn) {
            return conn.indices.create({ index: index });
        });
    };

    /**
     * 删除索引
     * @param index
     */


    _class.prototype.delIndex = function delIndex(index) {
        return this.socket().connect().then(function (conn) {
            return conn.indices.delete({ index: index });
        });
    };

    /**
     * 迁移索引数据
     * @param olerindex
     * @param newindex
     */


    _class.prototype.reIndex = function reIndex(olderindex, newindex) {
        return this.socket().connect().then(function (conn) {
            return conn.reindex({
                body: {
                    source: {
                        index: olderindex
                    },
                    dest: {
                        index: newindex
                    }
                }
            });
        });
    };

    /**
     * 为索引设置别名
     * @param index
     * @param alias
     */


    _class.prototype.setAlias = function setAlias(index, alias) {
        return this.socket().connect().then(function (conn) {
            return conn.indices.putAlias({ index: index, name: alias });
        });
    };

    _class.prototype.getAlias = function getAlias(index, alias) {
        return this.socket().connect().then(function (conn) {
            return conn.indices.getAlias({
                index: index,
                name: alias
            }).catch(function (e) {
                //对于没有索引的
                //console.log(e)
            });
        });
    };

    /**
     * 判断文档是否存在
     * @param index
     * @param type
     */


    _class.prototype.existsType = function existsType(index, type) {
        return this.socket().connect().then(function (conn) {
            return conn.indices.existsType({
                index: index,
                type: type,
                waitForCompletion: true //保证迁移完毕
            });
        });
    };

    /**
     * 设置文档的mapping
     * @param mapping
     */


    _class.prototype.setMapping = function setMapping(index, type, mapping) {
        return this.socket().connect().then(function (conn) {
            var _body;

            var param = {
                index: index,
                type: type,
                body: (_body = {}, _body[type] = mapping, _body)
            };
            return conn.indices.putMapping(param);
        });
    };

    /**
     * 获取文档的mapping
     * @param index
     * @param type
     */


    _class.prototype.getMapping = function getMapping(index, type) {
        return this.socket().connect().then(function (conn) {
            return conn.indices.getMapping({
                index: index,
                type: type
            });
        });
    };

    /**
     * 新增一条记录
     * @param data
     * @param options
     * @returns {*}
     */


    _class.prototype.add = function add(data, options) {
        this.queryBuilder(options, 'add', data);
        return this.execute(data);
    };

    /**
     * 添加全部,此处采用elasticsearch.js的bulk方法
     * @param data
     * @param options
     */


    _class.prototype.addAll = function addAll(data, options) {
        var bulk = [];
        var fn = function fn(data, options) {
            if (_lib2.default.isString(options.id) && data[options.id]) {
                return { index: { _index: options.index, _type: options.type, _id: data[options.id] } };
            }
            return { index: { _index: options.index, _type: options.type } };
        };
        data.map(function (item) {
            bulk.push(fn(item, options));
            bulk.push(item);
        });
        //console.log(bulk)
        return this.execute(bulk, 'bulk');
    };

    /**
     * 更新数据,根据条件match,filter更新暂时没在ES文档中找到
     * @param data
     * @param options
     */


    _class.prototype.update = function update(data, options) {
        //判断是否有更新条件,无更新条件使用update,有更新条件使用updateByQuery
        this.queryBuilder(options, 'update', data);
        //let op;
        //if (lib.isEmpty(options.id) && !lib.isEmpty(options.match) || !lib.isEmpty(options.filter)) {
        //    op = 'updateByQuery';
        //
        //} else {
        //    op = 'update';
        //    //data = {doc: data}
        //}
        return this.execute({ doc: data }, 'update');
    };

    /**
     * 查询
     * @param options
     */


    _class.prototype.select = function select(options) {
        this.queryBuilder(options, 'select');
        return this.query();
    };

    /**
     * 查询一条
     * @param opitons
     */


    _class.prototype.find = function find(opitons) {
        opitons.limit = [0, 1];
        this.queryBuilder(opitons, 'select');
        return this.query();
    };

    /**
     *
     * @param options
     */


    _class.prototype.count = function count(opitons) {
        this.queryBuilder(opitons, 'count');
        return this.query('count');
    };

    /**
     *查询对象转变为查询语句
     * @param options
     * @param optype
     */


    _class.prototype.queryBuilder = function queryBuilder(options) {
        var optype = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'select';
        var data = arguments[2];

        var caseList = {
            select: {
                index: true,
                type: true,
                where: true,
                order: true,
                match: true,
                filter: true,
                fields: true,
                limit: true,
                aggs: true,
                group: true,
                join: true
            },
            add: { index: true, type: true, id: true },
            update: { index: true, type: true, where: true, match: true, filter: true, id: true },
            delete: { index: true, type: true, where: true },
            count: { index: true, type: true, aggs: true, match: true, limit: true, filter: true, where: true },
            min: { index: true, type: true, where: true },
            max: { index: true, type: true, where: true },
            avg: { index: true, type: true, where: true },
            avgDistinct: { index: true, type: true, where: true },
            increment: { index: true, type: true, where: true },
            decrement: { index: true, type: true, where: true }
        };
        for (var o in options) {
            if (caseList[optype][o] && this['builder' + _lib2.default.ucFirst(o)]) this['builder' + _lib2.default.ucFirst(o)](options[o], data);
        }
    };

    /**
     * 解析索引
     * @param optionTable
     */


    _class.prototype.builderIndex = function builderIndex(optionIndex) {
        this.queryObj.index = optionIndex;
    };

    /**
     * 解析类型
     * @param optionsType
     */


    _class.prototype.builderType = function builderType(optionsType) {
        this.queryObj.type = optionsType;
    };

    /**
     * 设定id
     * @param optionsId
     * @param data
     */


    _class.prototype.builderId = function builderId(optionsId, data) {
        this.queryObj.id = optionsId;
    };

    /**
     * 解析字段
     * @param optionField
     */


    _class.prototype.builderFields = function builderFields(optionField) {
        this.queryObj.fields = optionField;
    };

    /**
     * 解析limit
     * @param optionLimit
     */


    _class.prototype.builderLimit = function builderLimit(optionLimit) {
        if (!optionLimit || optionLimit.length < 1) return;
        this.queryObj.from = optionLimit[0];
        this.queryObj.size = optionLimit[1];
    };

    /**
     * 解析原生查询/过滤条件
     * @param optionWhere
     */


    _class.prototype.builderWhere = function builderWhere(optionWhere) {
        this.queryObj.body = { query: optionWhere };
    };

    /**
     * 解析全局搜索匹配条件
     * @param optionMatch
     */


    _class.prototype.builderMatch = function builderMatch(optionMatch) {
        var match = parseCondition(optionMatch);
        this.queryObj.body.query.filtered.query || (this.queryObj.body.query.filtered.query = {});
        this.queryObj.body.query.filtered.query = { bool: match };
    };

    /**
     * 解析过滤条件
     * @param optionFilter
     */


    _class.prototype.builderFilter = function builderFilter(optionFilter) {
        var filter = parseCondition(optionFilter);
        this.queryObj.body.query.filtered.filter || (this.queryObj.body.query.filtered.filter = {});
        this.queryObj.body.query.filtered.filter = { bool: filter };
    };

    _class.prototype.builderAggs = function builderAggs(optionAggs) {
        this.queryObj.body.aggs = optionAggs;
    };

    /**
     * 排序
     * @param optionsOrder
     */


    _class.prototype.builderOrder = function builderOrder(optionsOrder) {
        this.queryObj.body.sort = optionsOrder;
    };

    return _class;
}(_base3.default);

exports.default = _class;