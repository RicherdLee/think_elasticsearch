/**
 * ES的聚合多用于count操作
 * 过滤查询与聚合
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
/*********先过滤,再聚合************/
//bookM
//    .filter({
//        price: {'>': 30}
//    })
//    .aggs({
//        price: {
//            terms: {
//                field: 'price'
//            }
//        }
//    })
//    .count()
//    .then(res=> {
//        "use strict";
//        console.log(res);
//        console.log(res.aggregations.price)
//    })
/*********先过滤,再聚合************/


/*********只过滤聚合数据************/
//bookM
//    .aggs({
//        price: {
//            filter: {
//                range: {
//                    price: {
//                        gt: 30
//                    }
//                }
//            },
//            aggs: {
//                goods: {
//                    terms: {
//                        field: 'goods'
//                    }
//                }
//            }
//        }
//    })
//    .count()
//    .then(res=> {
//        "use strict";
//        console.log(res);
//        console.log(res.aggregations.price);
//        console.log(res.aggregations.price.goods);
//    })
/*********只过滤聚合数据************/