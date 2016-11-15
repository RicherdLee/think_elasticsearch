/**
 *
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/10
 */
import base from '../base';
import lib from '../Util/lib'
export default class extends base {
    init(config) {
        super.init(config);
        this.config = {
            host: config.db_host || '127.0.0.1',
            user: config.db_user || 'root',
            password: config.db_password,
            port: config.db_port || '9200',
            log: config.db_log || 'error'
        }
    }

    connect() {
        let key = lib.md5(JSON.stringify(this.config));
        if (!lib.isEmpty(ES[key])) return Promise.resolve(ES[key])
        if (this.connection) {
            return Promise.resolve(this.connection);
        }

        //创建ES客户端,ES自带连接池
        let elasticsearch = require('elasticsearch');
        let client = new elasticsearch.Client({
            host: [{
                host: this.config.host,
                auth: `${this.config.user}:${this.config.password}`,
                port: this.config.port
            }],
            log: this.config.log
        });
        this.connection = client;
        ES[key] = this.connection;
        return Promise.resolve(this.connection);
    }

    close() {
        this.connection.close();
        this.connection = null;

    }

}