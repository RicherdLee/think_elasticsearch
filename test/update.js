/**
 * 数据更新,ES指定id进行更新
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
    //id: 'AVf_6uxvvuLo1zgrtaIC',
    nick_name: '李明'
}

bookM.where({id: 'AVf_6uxvvuLo1zgrtaIC'})
    .update(updateData, {version: 1})
    .then(res=> {
        "use strict";
        console.log(res)
    })