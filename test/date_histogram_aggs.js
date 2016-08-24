/**
 * 按时间序列进行数据分析
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
bookM.
    aggs({
        price: {
            date_histogram: {//按时间序列
                field: 'create_time',//分组字段,
                interval: '1d',//分组力度,1天
                min_doc_count: 0,//最小显示集合数,如果为0表示即便没有数据也返回,常用于生成图表
                //extended_bounds:{ //区间范围
                //    min: 1461051270218,
                //    max: 1461915270218
                //}
            },
            aggs: {//分组后进一步聚合
                goods: {
                    terms: {
                        field: 'goods'
                    }
                }
            }
        }
    })
    .count()
    .then(res=> {
        "use strict";
        //console.log(res);
        console.log(res.aggregations.price.buckets);
        for (let r of res.aggregations.price.buckets) {
            console.log(r.goods.buckets)
        }
    })