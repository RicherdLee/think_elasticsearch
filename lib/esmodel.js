'use strict';

exports.__esModule = true;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

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
                mapping[map]['analyzer'] || (mapping[map]['index'] = 'not_analyzed');
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

    _class.createIndex = function createIndex(config, newindex, options, oldindex, aliase) {
        var delOldIndex = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;

        if (_lib2.default.isEmpty(config)) return Error('缺少ES配置');
        if (_lib2.default.isEmpty(newindex)) return Error('缺少所索引');
        if (_lib2.default.isEmpty(options)) return Error('缺少索引配置项');
        var Adapter = require('./Adapter/elasticsearch').default;
        var _adapter = new Adapter(config);
        //创建索引
        return _adapter.createIndex(newindex, options).then(function () {
            //数据迁移
            if (!_lib2.default.isEmpty(oldindex)) {
                return _adapter.reIndex(oldindex, newindex);
            } else {
                return _promise2.default.resolve();
            }
        }).then(function () {
            //查看原有索引的与现在索引是否相同,如果相同的话,就需要删除原有索引
            if (delOldIndex == true) {
                return _adapter.getAlias(oldindex).then(function (oldaliase) {
                    if (aliase == oldaliase) return Error('原有索引与现索引的别名相同,需要设置delOldIndex为true来删除原有索引');
                }).then(function () {
                    return _adapter.delIndex(oldindex);
                }).catch(function (e) {
                    console.log(e);
                });
            }
        }).then(function () {
            //为新索引设置别名
            if (!_lib2.default.isEmpty(aliase)) {
                return _adapter.setAlias(newindex, aliase);
            }
            return _promise2.default.resolve();
        });
    };

    _class.reIndex = function reIndex(config, oldindex, newindex) {
        var Adapter = require('./Adapter/elasticsearch').default;
        var _adapter = new Adapter(config);
        return _adapter.reIndex(oldindex, newindex).catch(function (e) {
            return _adapter.count({ index: oldindex }).then(function (totalCount) {
                //对于过多数据时，一次scorll/bulk进行reindex可能会出问题，因此需要进行分页
                // let currentPage = 1, pageSize = 10000, count = totalCount.hits.total, total, bulk = [];
                // total = count % pageSize == 0 ? parseInt(count / pageSize) : parseInt(count / pageSize) + 1; //总页数
                var count = totalCount.hits.total,
                    bulk = [];
                _adapter.selectAll({ scroll: '3m', index: oldindex, limit: [1, count] }).then(function (res) {
                    _adapter.scroll(res._scroll_id, '3m').then(function (list) {
                        list.hits.hits.map(function (item) {
                            bulk.push({
                                index: {
                                    _index: newindex,
                                    _type: item._type,
                                    _id: item._id
                                }
                            });
                            bulk.push(item._source);
                        });
                        //通过bulk生成新的索引
                        _adapter.bulk(bulk);
                    });
                });
                // let reindexFn = function (oldindex, newindex, currentPage) {
                //     let startIndex = (currentPage - 1) * pageSize;
                //     // let endIndex = currentPage * pageSize > count ? count + 1 : currentPage * pageSize;
                //     _adapter.selectAll({scroll: '1m', index: oldindex, size: count}).then(res => {
                //         _adapter.scroll(res._scroll_id, '1m').then(list => {
                //             bulk = [];
                //             list.hits.hits.map(item => {
                //                 bulk.push({
                //                     index: {
                //                         _index: newindex,
                //                         _type: item._type,
                //                         _id: item._id
                //                     }
                //                 })
                //                 bulk.push(item._source)
                //             })
                //             //通过bulk生成新的索引
                //             // _adapter.bulk(bulk)
                //
                //         }).then(() => {
                //             currentPage++;
                //             if (total >= currentPage) {
                //                 reindexFn(oldindex, newindex, currentPage)
                //             }
                //         })
                //     })
                //
                //
                // }
                // reindexFn(oldindex, newindex, currentPage)
            });
            // return _adapter.selectAll({scroll: '1m', index: oldindex}).then(res => {
            //     if (lib.isEmpty(res)) return [];
            //     if (lib.isEmpty(res._scroll_id)) return [];
            //     if (res.hits.total <= 0) return [];
            //
            //     if (res.hits.total > 1000) {
            //
            //     } else {
            //         return _adapter.limit(1, res.hits.total).scroll(res._scroll_id, '1m').then(list => {
            //             console.log(list.hits.hits.length)
            //             _adapter.clearScroll(res._scroll_id)
            //         })
            //     }
            // })
        });
    };

    _class.setAlias = function setAlias(config, index, aliase) {
        var Adapter = require('./Adapter/elasticsearch').default;
        var _adapter = new Adapter(config);
        return _adapter.setAlias(index, aliase);
    };

    _class.delIndex = function delIndex(configindex) {
        var Adapter = require('./Adapter/elasticsearch').default;
        var _adapter = new Adapter(config);
        return _adapter.delIndex(index);
    };

    /**
     * 初始化ES模型,设置ES mapping
     */
    //async setCollection() {
    //    //判断全局变量中是否有对应的模型且ES中是否有文档,如果没有则根据模型的mapping生成对应的ES文档
    //    if (lib.isEmpty(ES.MODEL[this.index]) || lib.isEmpty(ES.MODEL[this.index][this.type])) {
    //        //TODO将索引信息写入全局变量
    //        let aliases = await this.adapter().getAlias(null, this.index);
    //        let aliasesIndex = this.index, aliasesversion = '';
    //        if (!lib.isEmpty(aliases)) {
    //            this.index = Object.keys(aliases)[0];
    //            let versionArr = this.index.split('_');
    //            aliasesversion = versionArr[versionArr.length - 1];
    //        }
    //        //console.log(this.index,aliasesversion)
    //        //解析mapping
    //        this._mapping = {properties: parseMap(this._mapping)};
    //        //console.log(this._mapping)
    //        //将mapping写入全局变量
    //        lib.isEmpty(ES.MODEL[aliasesIndex]) ? ES.MODEL[aliasesIndex] = {
    //            [this.type]: {
    //                key: lib.md5(JSON.stringify(this._mapping)),
    //                version: aliasesversion
    //            }
    //        } : ES.MODEL[aliasesIndex][this.type] = {
    //            key: lib.md5(JSON.stringify(this._mapping)),
    //            version: aliasesversion
    //        };
    //        if (this.safe === false) {//允许数据迁移
    //            if (await this.adapter().existsType(this.index, this.type)) {
    //                //判断ES文档中的mappgin和model中的model是否一致,如果不一致,则需要update mapping
    //                let esmapping = await this.adapter().getMapping(this.index, this.type);
    //
    //                //此处要根据model设置的mapping挑出ES文档设置的mapping,判断是追加还是改变,因为ES不能对已存在的字段进行属性改变,此种状态只能重建索引,而追加则可以操作
    //                //创建文档,并生成别名,别名用于变更mapping时使用,由于ES不能动态重设mapping,所以只能通过重建mapping,reindex重新索引
    //                //而为了保证模型名称不变,因此需要通过别名方式
    //                let checkfield = function (map1, map2) {
    //                    for (let map in map1) {
    //                        if (map2[map]) {
    //                            if (!map2[map]['type']) {
    //                                checkfield(map1[map], map2[map]);
    //                            } else {
    //                                if (lib.md5(JSON.stringify(map1[map])) !== lib.md5(JSON.stringify(map2[map]))) {
    //                                    //console.log(map1);
    //                                    //console.log(map2);
    //                                    return false;
    //                                }
    //                            }
    //                        }
    //                    }
    //                    return true;
    //                }
    //                let oldindex = ES.MODEL[aliasesIndex][this.type]['version'] ? `${aliasesIndex}_${ES.MODEL[aliasesIndex][this.type]['version']}` : this.index;
    //                let mappinglist = await this.adapter().getMapping(oldindex);
    //                mappinglist = mappinglist[oldindex]['mappings'];
    //                /***TODO此处有个问题,对于index下的第一个type无mapping变化,
    //                 ***而第二个type的mapping有变化,那么将对第二个type进行数据迁移,
    //                 ***那么就会丢掉此index下第一个mapping***/
    //                if (!checkfield(this._mapping['properties'], esmapping[oldindex]['mappings'][this.type]['properties'])) {
    //                    //需要重新创建索引
    //                    let newindex = `${aliasesIndex}_${aliasesversion * 1 + 1}`;
    //                    let indexSetting = await this.adapter().getSetting(oldindex);
    //                    await this.adapter().createIndex(newindex, indexSetting[oldindex]);
    //                    ////设置新索引setting,需要先关闭索引
    //                    //await this.adapter().closeIndex(newindex);
    //                    ////modify by lihao 2016/10/27 此处需要将原有index的setting配置获取
    //                    //let indexSetting = await this.adapter().getSetting(oldindex);
    //                    //await this.adapter().setSetting(newindex, indexSetting[oldindex]);
    //                    ////设置完新索引setting后,在开启索引
    //                    //await this.adapter().openIndex(newindex);
    //                    //为新索引创建maaping
    //                    /***modify by lihao 此处有个问题,对于index下的第一个type无mapping变化,
    //                     * 而第二个type的mapping有变化,那么将对第二个type进行数据迁移,
    //                     * 那么就会丢掉此index下第一个mapping,因此需要将index下的所有type都取出后,
    //                     * 全部重新设置type的mapping
    //                     * ***/
    //                        //更新当前模型的type为新type
    //                    mappinglist[this.type] = this._mapping;
    //                    for (let key in mappinglist) {
    //                        await this.adapter().setMapping(newindex, key, mappinglist[key]);
    //                    }
    //                    //数据迁移
    //                    await this.adapter().reIndex(oldindex, newindex);
    //                    //删除原有索引
    //                    await this.adapter().delIndex(oldindex);
    //
    //                    //数据迁移删除原有索引后再为新索引创建别名,因为是使用index作为索引,保证对使用者index不变
    //                    await this.adapter().setAlias(newindex, aliasesIndex);
    //
    //
    //                }
    //            } else {
    //                try {
    //                    await this.adapter().setMapping(this.index, this.type, this._mapping)
    //                } catch (e) {
    //                    console.log(e)
    //                }
    //            }
    //        }
    //
    //    }
    //}

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
        this.index = index;
        return this;
    };

    _class.prototype.setType = function setType(type) {
        this.type = type;
        return this;
    };

    /**
     * 使用脚本
     * ES中默认未开启Grooy脚本,需要在elasticsearch.yml中添加如下配置
     * script.inline: on
     # script.indexed: on
     * @param flag
     */


    _class.prototype.script = function script() {
        var flag = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

        this.__options.script = flag;
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
     * 指定route
     * @param route
     */


    _class.prototype.route = function route(_route) {
        this.__options.route = _route;
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
        var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(data, options) {
            var parsedOptions, __data;

            return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return this._parseOptions(options);

                        case 2:
                            parsedOptions = _context.sent;
                            __data = _lib2.default.extend({}, data);

                            if (__data.hasOwnProperty('_id')) {
                                parsedOptions.id = __data._id;
                                delete __data._id;
                            }
                            //__data = await this._checkData(__data);
                            return _context.abrupt('return', this.adapter().add(__data, parsedOptions));

                        case 6:
                        case 'end':
                            return _context.stop();
                    }
                }
            }, _callee, this);
        }));

        function add(_x3, _x4) {
            return _ref.apply(this, arguments);
        }

        return add;
    }();

    /**
     * 添加多条记录
     * @param data
     * @param options
     */


    _class.prototype.addAll = function () {
        var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(data, options) {
            var parsedOptions;
            return _regenerator2.default.wrap(function _callee2$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return this._parseOptions(options);

                        case 2:
                            parsedOptions = _context2.sent;

                            this.__data = _lib2.default.extend([], data);
                            return _context2.abrupt('return', this.adapter().addAll(this.__data, parsedOptions));

                        case 5:
                        case 'end':
                            return _context2.stop();
                    }
                }
            }, _callee2, this);
        }));

        function addAll(_x5, _x6) {
            return _ref2.apply(this, arguments);
        }

        return addAll;
    }();

    /**
     * 更新记录,ES更新分为直接以id为条件更新或指定条件更新,不提供无条件更新
     * @param data
     * @param options
     */


    _class.prototype.update = function () {
        var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(data, options) {
            var parsedOption, __data;

            return _regenerator2.default.wrap(function _callee3$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _context3.next = 2;
                            return this._parseOptions(options);

                        case 2:
                            parsedOption = _context3.sent;
                            __data = _lib2.default.extend({}, data);

                            if (!(_lib2.default.isEmpty(__data.id) && _lib2.default.isEmpty(parsedOption.match) && _lib2.default.isEmpty(parsedOption.filter) && _lib2.default.isEmpty(parsedOption.where))) {
                                _context3.next = 6;
                                break;
                            }

                            return _context3.abrupt('return', this.error('ES必须指定条件更新'));

                        case 6:
                            if (!_lib2.default.isEmpty(__data.id)) {
                                parsedOption.id = __data.id;
                                delete __data.id;
                            }
                            //ES的_id项并没有在文档中,而是与index,type同级.因此通过_id更新时,不应该通过解析
                            //暂时将where中的参数作为id
                            if (!_lib2.default.isEmpty(parsedOption.where) && !_lib2.default.isEmpty(parsedOption.where.id)) {
                                parsedOption.id = parsedOption.where.id;
                            }
                            return _context3.abrupt('return', this.adapter().update(__data, parsedOption));

                        case 9:
                        case 'end':
                            return _context3.stop();
                    }
                }
            }, _callee3, this);
        }));

        function update(_x7, _x8) {
            return _ref3.apply(this, arguments);
        }

        return update;
    }();

    /**
     * 批量操作
     * @param data
     */


    _class.prototype.bulk = function () {
        var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(data, options) {
            var parsedOption, __data;

            return _regenerator2.default.wrap(function _callee4$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.next = 2;
                            return this._parseOptions(options);

                        case 2:
                            parsedOption = _context4.sent;
                            __data = _lib2.default.extend([], data);
                            return _context4.abrupt('return', this.adapter().bulk(__data, parsedOption));

                        case 5:
                        case 'end':
                            return _context4.stop();
                    }
                }
            }, _callee4, this);
        }));

        function bulk(_x9, _x10) {
            return _ref4.apply(this, arguments);
        }

        return bulk;
    }();

    /**
     * 查询一条记录
     * @param options
     */


    _class.prototype.find = function () {
        var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(options) {
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

        function find(_x11) {
            return _ref5.apply(this, arguments);
        }

        return find;
    }();

    /**
     * 查询结果集
     * @param options
     * @returns {*}
     */


    _class.prototype.select = function () {
        var _ref6 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(options) {
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

        function select(_x12) {
            return _ref6.apply(this, arguments);
        }

        return select;
    }();

    /**
     * 查询全部集合,scan
     * @param options
     */


    _class.prototype.selectAll = function () {
        var _ref7 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(options) {
            var _this2 = this;

            var parsedOptions;
            return _regenerator2.default.wrap(function _callee7$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                            _context7.next = 2;
                            return this._parseOptions(options);

                        case 2:
                            parsedOptions = _context7.sent;

                            parsedOptions.scroll = '1m';
                            return _context7.abrupt('return', this.adapter().selectAll(parsedOptions).then(function (res) {
                                if (_lib2.default.isEmpty(res)) return [];
                                if (_lib2.default.isEmpty(res._scroll_id)) return [];
                                //if (res.hits.total <= 0) return [];
                                return _this2.adapter().scroll(res._scroll_id, parsedOptions.scroll);
                            }));

                        case 5:
                        case 'end':
                            return _context7.stop();
                    }
                }
            }, _callee7, this);
        }));

        function selectAll(_x13) {
            return _ref7.apply(this, arguments);
        }

        return selectAll;
    }();

    /**
     * 查询数量
     * @param options
     */


    _class.prototype.count = function () {
        var _ref8 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee8(options) {
            var parsedOptions;
            return _regenerator2.default.wrap(function _callee8$(_context8) {
                while (1) {
                    switch (_context8.prev = _context8.next) {
                        case 0:
                            _context8.next = 2;
                            return this._parseOptions(options);

                        case 2:
                            parsedOptions = _context8.sent;
                            return _context8.abrupt('return', this.adapter().count(parsedOptions));

                        case 4:
                        case 'end':
                            return _context8.stop();
                    }
                }
            }, _callee8, this);
        }));

        function count(_x14) {
            return _ref8.apply(this, arguments);
        }

        return count;
    }();

    /**
     * 求和
     * @param field
     */


    _class.prototype.sum = function () {
        var _ref9 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee9(field, options) {
            var parsedOptions, res;
            return _regenerator2.default.wrap(function _callee9$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            if (!(field === undefined)) {
                                _context9.next = 2;
                                break;
                            }

                            return _context9.abrupt('return', this.error('need sum field'));

                        case 2:
                            this.aggs({ sum: { sum: { field: field } } });
                            _context9.next = 5;
                            return this._parseOptions(options);

                        case 5:
                            parsedOptions = _context9.sent;
                            _context9.next = 8;
                            return this.adapter().count(parsedOptions);

                        case 8:
                            res = _context9.sent;
                            return _context9.abrupt('return', res.aggregations.sum.value);

                        case 10:
                        case 'end':
                            return _context9.stop();
                    }
                }
            }, _callee9, this);
        }));

        function sum(_x15, _x16) {
            return _ref9.apply(this, arguments);
        }

        return sum;
    }();

    /**
     * 平均值
     * @param field
     */


    _class.prototype.avg = function () {
        var _ref10 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee10(field, options) {
            var parsedOptions, res;
            return _regenerator2.default.wrap(function _callee10$(_context10) {
                while (1) {
                    switch (_context10.prev = _context10.next) {
                        case 0:
                            if (!(field === undefined)) {
                                _context10.next = 2;
                                break;
                            }

                            return _context10.abrupt('return', this.error('need avg field'));

                        case 2:
                            this.aggs({ avg: { avg: { field: field } } });
                            _context10.next = 5;
                            return this._parseOptions(options);

                        case 5:
                            parsedOptions = _context10.sent;
                            _context10.next = 8;
                            return this.adapter().count(parsedOptions);

                        case 8:
                            res = _context10.sent;
                            return _context10.abrupt('return', res.aggregations.avg.value);

                        case 10:
                        case 'end':
                            return _context10.stop();
                    }
                }
            }, _callee10, this);
        }));

        function avg(_x17, _x18) {
            return _ref10.apply(this, arguments);
        }

        return avg;
    }();

    /**
     * min
     * @param field
     */


    _class.prototype.min = function () {
        var _ref11 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee11(field, options) {
            var parsedOptions, res;
            return _regenerator2.default.wrap(function _callee11$(_context11) {
                while (1) {
                    switch (_context11.prev = _context11.next) {
                        case 0:
                            if (!(field === undefined)) {
                                _context11.next = 2;
                                break;
                            }

                            return _context11.abrupt('return', this.error('need min field'));

                        case 2:
                            this.aggs({ min: { min: { field: field } } });
                            _context11.next = 5;
                            return this._parseOptions(options);

                        case 5:
                            parsedOptions = _context11.sent;
                            _context11.next = 8;
                            return this.adapter().count(parsedOptions);

                        case 8:
                            res = _context11.sent;
                            return _context11.abrupt('return', res.aggregations.min.value);

                        case 10:
                        case 'end':
                            return _context11.stop();
                    }
                }
            }, _callee11, this);
        }));

        function min(_x19, _x20) {
            return _ref11.apply(this, arguments);
        }

        return min;
    }();

    /**
     * 最大值
     * @param field
     */


    _class.prototype.max = function () {
        var _ref12 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee12(field, options) {
            var parsedOptions, res;
            return _regenerator2.default.wrap(function _callee12$(_context12) {
                while (1) {
                    switch (_context12.prev = _context12.next) {
                        case 0:
                            if (!(field === undefined)) {
                                _context12.next = 2;
                                break;
                            }

                            return _context12.abrupt('return', this.error('need max field'));

                        case 2:
                            this.aggs({ max: { max: { field: field } } });
                            _context12.next = 5;
                            return this._parseOptions(options);

                        case 5:
                            parsedOptions = _context12.sent;
                            _context12.next = 8;
                            return this.adapter().count(parsedOptions);

                        case 8:
                            res = _context12.sent;
                            return _context12.abrupt('return', res.aggregations.max.value);

                        case 10:
                        case 'end':
                            return _context12.stop();
                    }
                }
            }, _callee12, this);
        }));

        function max(_x21, _x22) {
            return _ref12.apply(this, arguments);
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

    /**
     * 数据检测
     * @param data
     * @private
     */


    _class.prototype._checkData = function _checkData(data) {}
    //判断字段默认类型合法性,此处有个问题,对于ES的mapping可关闭或开启mapping中未设置的类型


    /**
     * 解析数据,根据参数判断返回是否返回ES返回的相关参数,还是只返回查询结果
     * @param data
     * @param options
     * @private
     */
    ;

    _class.prototype._parseData = function _parseData(data, options) {};

    return _class;
}(_base3.default);

exports.default = _class;