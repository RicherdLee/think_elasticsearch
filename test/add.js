/**
 * 写入数据
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/23
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
var data = {
    _id: '1',
    user_name: 'ES',
    create_time: Math.ceil(new Date().getTime() / 1000),//除以1000是因为使用的是second,表示的10位时间戳
    update_time: Math.ceil(new Date().getTime() / 1000)
};
bookM.add(data).then(res=> {
    "use strict";
    console.log(res);
})