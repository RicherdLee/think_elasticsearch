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

//此处的option与ES的RESTFUL风格接口设置index是完全一样的
var options = {
    settings: {//设置
        number_of_shards: 1,//主分片数量
        number_of_replicas: 0,//复制分片数量
        analysis: {
            analyzer: {//分析器
                comma: {
                    type: "pattern",
                    pattern: ","
                }
            }
        }
    },
    mappings: {//mapping
        user: {
            properties: {
                user_name: {
                    type: 'string',
                    index: "not_analyzed"//不进行全局搜索,match无用
                },
                nick_name: {
                    type: 'string',
                    index: "not_analyzed"
                },
                create_time: {
                    type: 'date',
                    format: 'epoch_second'
                },
                update_time: {
                    type: 'date',
                    format: 'epoch_second'//epoch_second表示10位时间戳,epoch_millis表示13位时间戳
                }
            }
        },
        book: {
            properties: {
                user_name: {
                    type: 'string',
                    index: "not_analyzed"
                },
                nick_name: {
                    type: 'string',
                    index: "not_analyzed"
                },
                class: {
                    type: 'string',
                    index: "not_analyzed"
                },
                goods: {
                    type: 'string',
                    analyzer: "comma"//使用setting中设置的分词器
                },
                price: {
                    type: 'integer'
                },
                create_time: {
                    type: 'date',
                    format: 'epoch_second'
                },
                update_time: {
                    type: 'date',
                    format: 'epoch_second'
                }
            }
        }

    }
};

ES.createIndex(config, 'apsystem1', options, 'apsystem', 'apsystem', true);
