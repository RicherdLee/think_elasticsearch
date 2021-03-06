/**
 *
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/11
 */
let parseMap = function (mapping) {
    for (let map in mapping) {
        if (lib.isString(mapping[map]) && lib.isEmpty(mapping[map].type)) {
            delete mapping[map]
            continue;
        }
        switch (mapping[map].type) {
            case 'second'://10位时间戳
                mapping[map] = {type: 'date', format: 'epoch_second'};
                break;
            case 'millis'://13位时间戳
                mapping[map] = {type: 'date', format: 'epoch_millis'};
                break;
            case 'time'://time同样表示时间格式
                mapping[map]['type'] = 'date';
                break;
            case undefined://子对象,需要进一步解析
                mapping[map] = {properties: parseMap(mapping[map])};
                break;
            case 'string'://默认不进行Analysis not_analyzed
                mapping[map]['analyzer'] || (mapping[map]['index'] = 'not_analyzed');
                break;
            default:
                break;
        }
    }
    return mapping;
}
import base from './base';
import lib from './Util/lib'
export default class extends base {
    init(config) {
        this.config = config;
        this.__options = {};
        this._mapping = {};
        //表示数据不能直接迁移
        this.safe = true;
    }

    static createIndex(config, newindex, options, oldindex, aliase, delOldIndex = false) {
        if (lib.isEmpty(config)) return Error('缺少ES配置');
        if (lib.isEmpty(newindex)) return Error('缺少所索引');
        if (lib.isEmpty(options)) return Error('缺少索引配置项');
        let Adapter = require('./Adapter/elasticsearch').default;
        let _adapter = new Adapter(config);
        //创建索引
        return _adapter.createIndex(newindex, options).then(() => {
            //数据迁移
            if (!lib.isEmpty(oldindex)) {
                return _adapter.reIndex(oldindex, newindex);
            } else {
                return Promise.resolve();
            }
        }).then(() => {
            //查看原有索引的与现在索引是否相同,如果相同的话,就需要删除原有索引
            if (delOldIndex == true) {
                return _adapter.getAlias(oldindex).then((oldaliase) => {
                    if (aliase == oldaliase) return Error('原有索引与现索引的别名相同,需要设置delOldIndex为true来删除原有索引');
                }).then(() => {
                    return _adapter.delIndex(oldindex);
                }).catch(e => {
                    console.log(e)
                })
            }
        }).then(() => {
            //为新索引设置别名
            if (!lib.isEmpty(aliase)) {
                return _adapter.setAlias(newindex, aliase);
            }
            return Promise.resolve();
        })
    }

    static reIndex(config, oldindex, newindex) {
        let Adapter = require('./Adapter/elasticsearch').default;
        let _adapter = new Adapter(config);
        return _adapter.reIndex(oldindex, newindex).catch(e => {
            return _adapter.count({index: oldindex}).then(totalCount => {
                    //对于过多数据时，一次scorll/bulk进行reindex可能会出问题，因此需要进行分页
                    // let currentPage = 1, pageSize = 10000, count = totalCount.hits.total, total, bulk = [];
                    // total = count % pageSize == 0 ? parseInt(count / pageSize) : parseInt(count / pageSize) + 1; //总页数
                    let count = totalCount.hits.total, bulk = [];
                    _adapter.selectAll({scroll: '3m', index: oldindex, limit: [1, count]}).then(res => {
                        _adapter.scroll(res._scroll_id, '3m').then(list => {
                            list.hits.hits.map(item => {
                                bulk.push({
                                    index: {
                                        _index: newindex,
                                        _type: item._type,
                                        _id: item._id
                                    }
                                })
                                bulk.push(item._source)
                            })
                            //通过bulk生成新的索引
                            _adapter.bulk(bulk)
                        })
                    })
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

                }
            )
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
    }

    static setAlias(config, index, aliase) {
        let Adapter = require('./Adapter/elasticsearch').default;
        let _adapter = new Adapter(config);
        return _adapter.setAlias(index, aliase);
    }

    static delIndex(configindex) {
        let Adapter = require('./Adapter/elasticsearch').default;
        let _adapter = new Adapter(config);
        return _adapter.delIndex(index);
    }

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
    error(err) {
        if (err) {
            let msg = err;
            if (!lib.isError(msg)) {
                if (!lib.isString(msg)) {
                    msg = JSON.stringify(msg);
                }
                msg = new Error(msg);
            }
            let stack = msg.message ? msg.message.toLowerCase() : '';
            // connection error
            if (~stack.indexOf('connect') || ~stack.indexOf('refused')) {
                this.instances && this.instances.close && this.instances.close();
            }
            lib.log(msg);
        }
        return lib.getDefer().promise;
    }

    getPk() {
        return '_id';
    }

    /**
     * 获取elasticsearch适配器单例
     */
    adapter() {
        if (this._adapter) return this._adapter;
        let Adapter = require('./Adapter/elasticsearch').default;
        this._adapter = new Adapter(this.config);
        return this._adapter;
    }

    setIndex(index) {
        this.index = index;
        return this;
    }

    setType(type) {
        this.type = type;
        return this;
    }

    /**
     * 使用脚本
     * ES中默认未开启Grooy脚本,需要在elasticsearch.yml中添加如下配置
     * script.inline: on
     # script.indexed: on
     * @param flag
     */
    script(flag = false) {
        this.__options.script = flag;
        return this;
    }

    /**
     * 全文搜索
     * @param match
     */
    match(match) {
        if (lib.isObject(match)) this.__options.match = match;
        return this;
    }

    /**
     * 过滤(精确查询)
     * @param filter
     */
    filter(filter) {
        this.__options.filter = filter;
        return this;
    }

    /**
     * 原生查询/过滤条件
     * @param where
     */
    where(where) {
        this.__options.where = where;
        return this;
    }

    /**
     * 指定route
     * @param route
     */
    route(route) {
        this.__options.route = route;
        return this;
    }

    /**
     * 聚合排序
     * @param aggs
     */
    aggs(aggs) {
        this.__options.aggs = aggs;
        return this;
    }


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
    field(fields) {
        if (!fields) {
            return this;
        }
        if (typeof fields === 'string') {
            fields = fields.replace(/ +/g, '').split(',');
        }
        this.__options.fields = fields;
        return this;
    }


    /**
     * 指定查询数量
     * @param offset
     * @param length
     */
    limit(offset, length) {
        if (offset === undefined) {
            return this;
        }

        if (lib.isArray(offset)) {
            offset = offset[0], length = offset[1];
        }

        offset = Math.max(parseInt(offset) || 0, 0);
        if (length) {
            length = Math.max(parseInt(length) || 0, 0);
        }
        this.__options.limit = [offset, length];
        return this;
    }

    /**
     * 排序
     * @param order
     */
    order(order) {
        if (order === undefined) return this;
        this.__options.order = order;
        return this;
    }

    /**
     * 新增一条记录
     * @param data
     */
    async add(data, options) {
        let parsedOptions = await this._parseOptions(options);
        let __data = lib.extend({}, data);
        if (__data.hasOwnProperty('_id')) {
            parsedOptions.id = __data._id;
            delete __data._id;
        }
        //__data = await this._checkData(__data);
        return this.adapter().add(__data, parsedOptions);
    }

    /**
     * 添加多条记录
     * @param data
     * @param options
     */
    async addAll(data, options) {
        let parsedOptions = await this._parseOptions(options);
        this.__data = lib.extend([], data);
        return this.adapter().addAll(this.__data, parsedOptions);
    }

    /**
     * 更新记录,ES更新分为直接以id为条件更新或指定条件更新,不提供无条件更新
     * @param data
     * @param options
     */
    async update(data, options) {
        let parsedOption = await this._parseOptions(options);
        let __data = lib.extend({}, data);
        if (lib.isEmpty(__data.id) && lib.isEmpty(parsedOption.match) && lib.isEmpty(parsedOption.filter) && lib.isEmpty(parsedOption.where)) return this.error('ES必须指定条件更新');
        if (!lib.isEmpty(__data.id)) {
            parsedOption.id = __data.id;
            delete __data.id;
        }
        //ES的_id项并没有在文档中,而是与index,type同级.因此通过_id更新时,不应该通过解析
        //暂时将where中的参数作为id
        if (!lib.isEmpty(parsedOption.where) && !lib.isEmpty(parsedOption.where.id)) {
            parsedOption.id = parsedOption.where.id;
        }
        return this.adapter().update(__data, parsedOption);
    }

    /**
     * 批量操作
     * @param data
     */
    async bulk(data, options) {
        let parsedOption = await this._parseOptions(options);
        let __data = lib.extend([], data);
        return this.adapter().bulk(__data, parsedOption)
    }

    /**
     * 查询一条记录
     * @param options
     */
    async find(options) {
        let parsedOptions = await this._parseOptions(options);
        return this.adapter().find(parsedOptions);
    }

    /**
     * 查询结果集
     * @param options
     * @returns {*}
     */
    async select(options) {
        let parsedOptions = await this._parseOptions(options);
        return this.adapter().select(parsedOptions);
    }

    /**
     * 查询全部集合,scan
     * @param options
     */
    async selectAll(options) {
        let parsedOptions = await this._parseOptions(options);
        parsedOptions.scroll = '1m';
        return this.adapter().selectAll(parsedOptions).then(res => {
            if (lib.isEmpty(res)) return [];
            if (lib.isEmpty(res._scroll_id)) return [];
            //if (res.hits.total <= 0) return [];
            return this.adapter().scroll(res._scroll_id, parsedOptions.scroll)
        })
    }

    /**
     * 查询数量
     * @param options
     */
    async count(options) {
        let parsedOptions = await this._parseOptions(options);
        return this.adapter().count(parsedOptions);
    }

    /**
     * 求和
     * @param field
     */
    async sum(field, options) {
        if (field === undefined) return this.error('need sum field');
        this.aggs({sum: {sum: {field: field}}});
        let parsedOptions = await this._parseOptions(options);
        let res = await this.adapter().count(parsedOptions);
        return res.aggregations.sum.value;
    }

    /**
     * 平均值
     * @param field
     */
    async avg(field, options) {
        if (field === undefined) return this.error('need avg field');
        this.aggs({avg: {avg: {field: field}}});
        let parsedOptions = await this._parseOptions(options);
        let res = await this.adapter().count(parsedOptions);
        return res.aggregations.avg.value;
    }

    /**
     * min
     * @param field
     */
    async min(field, options) {
        if (field === undefined) return this.error('need min field');
        this.aggs({min: {min: {field: field}}});
        let parsedOptions = await this._parseOptions(options);
        let res = await this.adapter().count(parsedOptions);
        return res.aggregations.min.value;
    }

    /**
     * 最大值
     * @param field
     */
    async max(field, options) {
        if (field === undefined) return this.error('need max field');
        this.aggs({max: {max: {field: field}}});
        let parsedOptions = await this._parseOptions(options);
        let res = await this.adapter().count(parsedOptions);
        return res.aggregations.max.value;
    }

    /**
     * 解析参数
     * @param options
     */
    _parseOptions(oriOpts, extraOptions) {
        let options;
        if (lib.isScalar(oriOpts)) {
            options = lib.extend({}, this.__options);
        } else {
            options = lib.extend({}, this.__options, oriOpts, extraOptions);
        }

        this.__options = {};
        options.index = this.index;
        options.type = this.type;
        return options;
    }

    /**
     * 数据检测
     * @param data
     * @private
     */
    _checkData(data) {
        //判断字段默认类型合法性,此处有个问题,对于ES的mapping可关闭或开启mapping中未设置的类型
    }

    /**
     * 解析数据,根据参数判断返回是否返回ES返回的相关参数,还是只返回查询结果
     * @param data
     * @param options
     * @private
     */
    _parseData(data, options) {

    }
}