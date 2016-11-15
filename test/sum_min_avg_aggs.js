/**
 * ES的聚合多用于count操作
 * 普通分组聚合,类似关系数据库group
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/24
 */
var ES = require('../index');
//初始化模型
var config = {
    db_type: 'es', // 数据库类型
    db_host: '192.168.99.100', // 服务器地址
    db_port: '9200', // 端口
    db_log: 'info'
};
var book = require('../exmple/model/lib/book').default;
var bookM = new book(config);
bookM
    .aggs({
        price: {//分组后字段
            //sum: {
            //    field: 'price'//按哪个字段进行分组
            //}
            //min:{
            //    field:'price'
            //}
            //max:{
            //    field:'price'
            //}
            //avg:{
            //    field:'price'
            //}
            //cardinality:{//求唯一值,即不重复的字段
            //    field:'price'
            //}
            //percentiles:{//百分比
            //    field:'price',
            //}
            //stats:{//多值统计
            //    field:'price'
            //}
            extended_stats: {
                field: 'price'
            }
        }
    })
    .count()
    .then(res=> {
        "use strict";
        console.log(res.aggregations.price)
    })
