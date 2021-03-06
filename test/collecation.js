/**
 * modify by lihao 2016/10/27 ,由于ES不能动态更新mapping,导致对于变更数据结构设计问题较多,暂时关闭.
 * ESModel将提供数据迁移reIndex,命名别名等静态方法,用于解决手动重建索引变更mapping时数据迁移和别名功能
 *
 *
 *
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
var user = require('../exmple/model/lib/user').default;
var bookM = new book(config);
var userM = new user(config);
//2016/10/27 添加分词器测试,要求先生成index,index配置mapping中需要的analyzer
//bookM.setCollection();
//userM.setCollection();