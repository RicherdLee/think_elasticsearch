/**
 * elasticsearch的mapping只能添加不能修改,因此当mapping的field变化时,只能重建索引并迁移数据
 * 为了保证模型名称不变,采用elasticsearch的别名方式
 * 同时对于未在mapping表示的field,而插入数据时,es会自动进行匹配
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
bookM.setCollection();