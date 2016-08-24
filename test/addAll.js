/**
 * 批量插入数据
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
var time = Math.ceil(new Date().getTime() / 1000);
var dataAll = [{
    user_name: '李明明',
    nick_name: '明明',
    class: 'book',
    goods: 'java',
    price: 100,
    create_time: time,
    update_time: time,
}, {
    user_name: '胡于谦',
    nick_name: '丁丁',
    class: 'book',
    goods: 'node',
    price: 100,
    create_time: time,
    update_time: time,
}, {
    user_name: '张英伟',
    nick_name: '张英伟',
    class: 'phone',
    goods: 'iphone',
    price: 5000,
    create_time: time * 1 - 100000,
    update_time: time * 1 - 100000,
}, {
    user_name: '董倩',
    nick_name: '王子',
    class: 'food',
    goods: 'milk',
    price: 10,
    create_time: time * 1 - 400000,
    update_time: time * 1 - 400000,
}, {
    user_name: '苏荔贺',
    nick_name: '贾东文',
    class: 'food',
    goods: 'meat',
    price: 30,
    create_time: time * 1 - 400000,
    update_time: time * 1 - 400000,
}, {
    user_name: '李明明',
    nick_name: '明明',
    class: 'food',
    goods: 'milk',
    price: 20,
    create_time: time * 1 - 500000,
    update_time: time * 1 - 500000
}, {
    user_name: '董倩',
    nick_name: '王子',
    class: 'phone',
    goods: 'huawei',
    price: 3000,
    create_time: time * 1 - 800000,
    update_time: time * 1 - 800000,
}, {
    user_name: '张英伟',
    nick_name: '张英伟',
    class: 'food',
    goods: 'meat',
    price: 100,
    create_time: time * 1 - 4000,
    update_time: time * 1 - 4000,
}, {
    user_name: '胡于谦',
    nick_name: '丁丁',
    class: 'food',
    goods: 'milk',
    price: 100,
    create_time: time * 1 - 500000,
    update_time: time * 1 - 500000,
}, {
    user_name: '苏荔贺',
    nick_name: '贾东文',
    class: 'food',
    goods: 'milk',
    price: 20,
    class: 'food',
    goods: 'meat',
    price: 30,
    create_time: time * 1 - 400000,
    update_time: time * 1 - 400000,
}, {
    user_name: '李明明',
    nick_name: '明明',
    class: 'food',
    goods: 'meat',
    price: 30,
    create_time: time * 1 - 500000,
    update_time: time * 1 - 500000
}]

bookM.addAll(dataAll).then(res=> {
    "use strict";
    console.log(res)
})
