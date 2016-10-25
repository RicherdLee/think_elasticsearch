/**
 *
 * @author     lihao
 * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
 * @license    MIT
 * @version    16/8/22
 */
import esmodel from '../../../lib/esmodel'
export default class extends esmodel {
    init(config) {
        super.init(config);
        this.safe = true;
        this.index = 'apsystem';
        this.type = 'book';
        this._mapping = {
            userid: {
                type: 'string'
            },
            username: {
                type: 'string'
            },
            source: 'string',
            info: {
                idNo: {type: 'string'},
                real_name: {type: 'string'},
                address: {type: 'string'},
                phonenum: {type: 'string'},
                email: {type: 'string'},
                qq: {type: 'string'},
                wechat_unionid: {type: 'string'},//微信unionid
                sina_weibo: {type: 'string'},//新浪微博
            },
            create_time: {
                type: 'second'
            },
            update_time: {
                type: 'second'
            }
        }
    }
}