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
            username: {
                type: 'string'
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