/**
 * es的查询分为match和filter查询,match是全文检索,根据相关度匹配,filter是精确查找
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/23
 */
var ES = require('../index');
//初始化模型
var config = {
    db_type: 'es', // 数据库类型
    db_host: '', // 服务器地址
    db_port: '9200', // 端口
    db_log: 'info',


};
var book = require('../exmple/model/lib/book').default;
var bookM = new book(config);
bookM
//.filter({
//    price: {between: [10, 100]},
//    //or: [{goods: 'java'}, {goods: 'meat'}, {price: {gt: 1000}}],
//    //not: [{goods: 'java'}, {goods: 'meat'}, {price: {gt: 1000}}],
//})
//.match({
//    or: [{goods: 'java'}, {goods: 'meat'}, {price: {gt: 1000}}],
//    not: [{goods: 'java'}, {goods: 'meat'}, {price: {gt: 1000}}],
//})
    .setIndex('am_*')
    .setType('chains')
    // .filter({script: {script: "_source.cids.size() > length", params: {length: 2}}})
    .filter({phonenum: {like: '134'}, activityid: 372})
    // .where({_id: ''})
    // .field('goods,price')
    // .match({outlink: ""})
    // .limit(1, 500)
    .select().then(res => {
    console.log(res.hits.hits)
    // res.hits.hits.map(item => {
    //     item = item._source;
    //     // console.log(item)
    //     console.log(`${item.activityid}|${item.uvmark}|${item.action}|${item.memberid}|${item['@timestamp']}`)
    // }).catch(e => {
    //     "use strict";
    //     console.log(e)
    // })
})