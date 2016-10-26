/**
 *
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/10
 */
import base from '../base';
import lib from '../Util/lib'
let parseCondition = function (conditionObj, condition = {}, k, op = 'must') {
    let identifiers = {
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
    }
    let key, value, cval;
    //{id:1,or:[],not:[]}
    for (let ckey in conditionObj) {
        cval = conditionObj[ckey];
        switch (identifiers[ckey]) {
            case 'should':
                condition.should || (condition.should = []);
                for (let v of cval) {
                    key = Object.keys(v)[0]
                    value = v[key]
                    //console.log(key,value)
                    condition = parseCondition(v, condition, key, 'should');
                }
                break;
            case 'must_not':
                condition.must_not || (condition.must_not = []);
                for (let v of cval) {
                    key = Object.keys(v)[0]
                    value = v[key]
                    //console.log(key,value)
                    condition = parseCondition(v, condition, key, 'must_not');
                }
                break;
                break;
            case 'gt':
                condition[op] || (condition[op] = []);
                condition[op].push({range: {[k]: {gt: cval}}});
                break;
            case 'gte':
                condition[op] || (condition[op] = []);
                condition[op].push({range: {[k]: {gte: cval}}});
                break;
            case 'lt':
                condition[op] || (condition[op] = []);
                condition[op].push({range: {[k]: {lt: cval}}});
                break;
            case 'lte':
                condition[op] || (condition[op] = []);
                condition[op].push({range: {[k]: {lte: cval}}});
                break;
            case 'range':
                condition[op] || (condition[op] = []);
                condition[op].push({range: {[k]: {from: cval[0], to: cval[1]}}});
                break;
            case 'must':
            default:
                condition[op] || (condition[op] = []);
                if (lib.isObject(cval)) {
                    condition = parseCondition(cval, condition, ckey, op)
                } else {
                    condition[op].push({term: {[ckey]: {value: cval}}});
                }
                break;
        }
    }
    return condition;
}
export default class extends base {
    init(config) {
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
    }

    /**
     * 获取连接
     * @returns {*|null}
     */
    socket() {
        if (this.handel) {
            return this.handel;
        }
        let socket = require('../Socket/elasticsearch').default;
        this.handel = new socket(this.config);
        return this.handel;
    }

    getResult() {
        return this.resultObj;
    }


    /**
     * 关闭连接
     */
    close() {
        if (this.handel) {
            this.handel.close();
            this.handel = null;
        }
    }

    ping() {
        return this.socket().connect().then(conn=> {
            return conn.ping();
        }).then((res)=> {
            //this.close();
            return res;
        })
    }

    query(searchType = 'query_then_fetch') {
        this.queryObj.searchType = searchType;
        return this.socket().connect().then(conn=> {
            console.log(this.queryObj)
            return conn.search(this.queryObj);
        }).then(data=> {
            //this.close();
            return data;
        })
    }

    execute(data, optype = 'create') {
        this.queryObj.body = data;
        return this.socket().connect().then(conn=> {
            console.log(this.queryObj)
            return conn[optype](this.queryObj);
        }).then(data=> {
            //this.close();
            return data;
        }).catch(err=> {
            console.log(err)
        })
    }

    /**
     * 创建索引
     * @param index
     */
    createIndex(index) {
        return this.socket().connect().then(conn=> {
            return conn.indices.create({index: index})
        })
    }

    /**
     * 删除索引
     * @param index
     */
    delIndex(index) {
        return this.socket().connect().then(conn=> {
            return conn.indices.delete({index: index})
        })
    }

    /**
     * 迁移索引数据
     * @param olerindex
     * @param newindex
     */
    reIndex(olderindex, newindex) {
        return this.socket().connect().then(conn=> {
            return conn.reindex({
                body: {
                    source: {
                        index: olderindex
                    },
                    dest: {
                        index: newindex
                    }
                }
            })
        })
    }

    /**
     * 为索引设置别名
     * @param index
     * @param alias
     */
    setAlias(index, alias) {
        return this.socket().connect().then(conn=> {
            return conn.indices.putAlias({index: index, name: alias})
        })
    }


    getAlias(index, alias) {
        return this.socket().connect().then(conn=> {
            return conn.indices.getAlias({
                index: index,
                name: alias
            }).catch(e=> {
                //对于没有索引的
                //console.log(e)
            })
        })
    }

    /**
     * 判断文档是否存在
     * @param index
     * @param type
     */
    existsType(index, type) {
        return this.socket().connect().then(conn=> {
            return conn.indices.existsType({
                index: index,
                type: type,
                waitForCompletion: true//保证迁移完毕
            })
        })
    }

    /**
     * 设置文档的mapping
     * @param mapping
     */
    setMapping(index, type, mapping) {
        return this.socket().connect().then(conn=> {
            let param = {
                index: index,
                type: type,
                body: {
                    [type]: mapping
                }
            };
            return conn.indices.putMapping(param);
        })
    }

    /**
     * 获取文档的mapping
     * @param index
     * @param type
     */
    getMapping(index, type) {
        return this.socket().connect().then(conn=> {
            return conn.indices.getMapping({
                index: index,
                type: type
            })
        })
    }

    /**
     * 新增一条记录
     * @param data
     * @param options
     * @returns {*}
     */
    add(data, options) {
        this.queryBuilder(options, 'add', data);
        return this.execute(data);
    }

    /**
     * 添加全部,此处采用elasticsearch.js的bulk方法
     * @param data
     * @param options
     */
    addAll(data, options) {
        let bulk = [];
        let fn = function (data, options) {
            if (lib.isString(options.id) && data[options.id]) {
                return {index: {_index: options.index, _type: options.type, _id: data[options.id]}}
            }
            return {index: {_index: options.index, _type: options.type}}
        }
        data.map(item=> {
            bulk.push(fn(item, options));
            bulk.push(item);
        });
        //console.log(bulk)
        return this.execute(bulk, 'bulk');
    }

    /**
     * 更新数据,根据条件match,filter更新暂时没在ES文档中找到
     * @param data
     * @param options
     */
    update(data, options) {
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
        if (!options.script) {
            data = {doc: data}
        }
        return this.execute(data, 'update');
    }

    /**
     * 查询
     * @param options
     */
    select(options) {
        this.queryBuilder(options, 'select');
        return this.query();
    }

    /**
     * 查询一条
     * @param opitons
     */
    find(opitons) {
        opitons.limit = [0, 1];
        this.queryBuilder(opitons, 'select');
        return this.query();
    }

    /**
     *
     * @param options
     */
    count(opitons) {
        this.queryBuilder(opitons, 'count');
        return this.query('count');
    }

    /**
     *查询对象转变为查询语句
     * @param options
     * @param optype
     */
    queryBuilder(options, optype = 'select', data) {
        let caseList = {
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
            add: {index: true, type: true, id: true},
            update: {index: true, type: true, where: true, match: true, filter: true, id: true},
            delete: {index: true, type: true, where: true},
            count: {index: true, type: true, aggs: true, match: true, limit: true, filter: true, where: true},
            min: {index: true, type: true, where: true},
            max: {index: true, type: true, where: true},
            avg: {index: true, type: true, where: true},
            avgDistinct: {index: true, type: true, where: true},
            increment: {index: true, type: true, where: true},
            decrement: {index: true, type: true, where: true},
        }
        //重新清空查询条件
        this.queryObj = {
            body: {
                query: {
                    filtered: {}
                }
            }
        };
        for (let o in options) {
            if (caseList[optype][o] && this[`builder${lib.ucFirst(o)}`]) this[`builder${lib.ucFirst(o)}`](options[o], data);
        }
    }

    /**
     * 解析索引
     * @param optionTable
     */
    builderIndex(optionIndex) {
        this.queryObj.index = optionIndex;
    }

    /**
     * 解析类型
     * @param optionsType
     */
    builderType(optionsType) {
        this.queryObj.type = optionsType;
    }


    /**
     * 设定id
     * @param optionsId
     * @param data
     */
    builderId(optionsId, data) {
        this.queryObj.id = optionsId;
    }

    /**
     * 解析字段
     * @param optionField
     */
    builderFields(optionField) {
        this.queryObj.fields = optionField;
    }

    /**
     * 解析limit
     * @param optionLimit
     */
    builderLimit(optionLimit) {
        if (!optionLimit || optionLimit.length < 1)return;
        this.queryObj.from = optionLimit[0];
        this.queryObj.size = optionLimit[1];
    }

    /**
     * 解析原生查询/过滤条件
     * @param optionWhere
     */
    builderWhere(optionWhere) {
        this.queryObj.body = {query: optionWhere};
    }

    /**
     * 解析全局搜索匹配条件
     * @param optionMatch
     */
    builderMatch(optionMatch) {
        let match = parseCondition(optionMatch)
        this.queryObj.body.query.filtered.query || (this.queryObj.body.query.filtered.query = {})
        this.queryObj.body.query.filtered.query = {bool: match};
    }

    /**
     * 解析过滤条件
     * @param optionFilter
     */
    builderFilter(optionFilter) {
        let filter = parseCondition(optionFilter)
        this.queryObj.body.query.filtered.filter || (this.queryObj.body.query.filtered.filter = {})
        this.queryObj.body.query.filtered.filter = {bool: filter};
    }

    builderAggs(optionAggs) {
        this.queryObj.body.aggs = optionAggs;
    }

    /**
     * 排序
     * @param optionsOrder
     */
    builderOrder(optionsOrder) {
        this.queryObj.body.sort = optionsOrder;
    }

}