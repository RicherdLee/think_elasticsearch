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
    db_host: '120.27.196.80', // 服务器地址
    db_port: '9200', // 端口
    db_log: 'info'
};
var book = require('../exmple/model/lib/book').default;
var bookM = new book(config);
bookM
//.filter({
//    price: {between: [10, 100]},
//    //or: [{goods: 'java'}, {goods: 'meat'}, {price: {gt: 1000}}],
//    //not: [{goods: 'java'}, {goods: 'meat'}, {price: {gt: 1000}}],
//})'NyPYKUHA
//.match({
//    or: [{goods: 'java'}, {goods: 'meat'}, {price: {gt: 1000}}],
//    not: [{goods: 'java'}, {goods: 'meat'}, {price: {gt: 1000}}],
//})
    .setIndex('am_test')
    .setType('list')
    .where({_id: '5e97ab25b4620e6a7f027647e6dc3611'})
    //.field('goods,price')
    .find().then(res => {
    console.log(res)
    //res.hits.hits.map(item=> {
    //    "use strict";
    //    console.log(item)
    //})
})