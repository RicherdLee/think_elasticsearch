'use strict';

exports.__esModule = true;

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _esmodel2 = require('../../../lib/esmodel');

var _esmodel3 = _interopRequireDefault(_esmodel2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_esmodel) {
    (0, _inherits3.default)(_class, _esmodel);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _esmodel.apply(this, arguments));
    }

    _class.prototype.init = function init(config) {
        _esmodel.prototype.init.call(this, config);
        this.safe = false;
        this.index = 'apsystem_2';
        this.type = 'book';
        this._mapping = {
            user_name: {
                type: 'string'
            },
            nick_name: {
                type: 'string'
            },
            class: {
                type: 'string'
            },
            goods: {
                type: 'string',
                analyzer: "comma" //使用setting中设置的分词器
            },
            price: {
                type: 'integer'
            },
            create_time: {
                type: 'second'
            },
            update_time: {
                type: 'second'
            }
        };
    };

    return _class;
}(_esmodel3.default); /**
                       *
                       * @author     lihao
                       * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
                       * @license    MIT
                       * @version    16/8/22
                       */


exports.default = _class;