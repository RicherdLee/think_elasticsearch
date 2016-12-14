/**
 * 由于ES不能动态更新mapping,导致对于变更数据结构设计问题较多,暂时关闭.
 * ESModel将提供数据迁移reIndex,命名别名等静态方法,用于解决手动重建索引变更mapping时数据迁移和别名功能
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    2016/10/27
 */

var ES = require('../index');
//初始化模型
var config = {
    db_type: 'es', // 数据库类型
    db_host: '127.0.0.1', // 服务器地址
    db_port: '9200', // 端口
    db_log: 'info'
};

//ES.reIndex(config, 'am_2016-12', 'am_test');
