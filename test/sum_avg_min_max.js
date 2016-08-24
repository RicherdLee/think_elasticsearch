/**
 * 求和,es的sum必须传需要求和的值
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
//bookM.sum('price').then(res=> {
//    console.log(res)
//})
//bookM.avg('price').then(res=> {
//    console.log(res)
//})
//bookM.min('price').then(res=> {
//    console.log(res)
//})
//bookM.max('price').then(res=> {
//    console.log(res)
//})
