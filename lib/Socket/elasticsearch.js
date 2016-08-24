'use strict';

exports.__esModule = true;

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _base2 = require('../base');

var _base3 = _interopRequireDefault(_base2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _class = function (_base) {
    (0, _inherits3.default)(_class, _base);

    function _class() {
        (0, _classCallCheck3.default)(this, _class);
        return (0, _possibleConstructorReturn3.default)(this, _base.apply(this, arguments));
    }

    _class.prototype.init = function init(config) {
        _base.prototype.init.call(this, config);
        this.config = {
            host: config.db_host || '127.0.0.1',
            port: config.db_port || '9200',
            log: config.db_log || 'error'
        };
    };

    _class.prototype.connect = function connect() {
        if (this.connection) {
            return _promise2.default.resolve(this.connection);
        }

        //创建ES客户端,ES自带连接池
        var elasticsearch = require('elasticsearch');
        var client = new elasticsearch.Client({
            host: this.config.host + ':' + this.config.port,
            log: this.config.log
        });
        this.connection = client;
        return _promise2.default.resolve(this.connection);
    };

    _class.prototype.close = function close() {
        this.connection.close();
        this.connection = null;
    };

    return _class;
}(_base3.default); /**
                    *
                    * @author     lihao
                    * @copyright  Copyright (c) 2016 - <lihao19860813(at)gmail.com>
                    * @license    MIT
                    * @version    16/8/10
                    */


exports.default = _class;