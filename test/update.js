/**
 * 数据更新
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    2016/10/26
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
var updateData = {
    id:'AVf-ys2EvuLo1zgrtaHK',
    username: 'ES_1'
}

bookM.update(updateData).then(res=> {
    "use strict";
    console.log(res)
})