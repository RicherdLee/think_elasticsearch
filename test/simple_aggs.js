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
    db_host: '127.0.0.1', // 服务器地址
    db_port: '9200', // 端口
    db_log: 'info'
};
var book = require('../exmple/model/lib/book').default;
var bookM = new book(config);
bookM
    .setIndex('user_orbit-*')
    .setType('user_orbit')
    .aggs({
        price: {//分组后字段
            terms: {
                field: 'outlink'//按哪个字段进行分组
            }
        }
    })
    .count()
    .then(res=> {
        "use strict";
        console.log(res.aggregations.price)
    }).catch(e=>{
        "use strict";
        console.log(e)
})
