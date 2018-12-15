/**
 * @file The config for building quick app
 * @author sparklewhy@gmail.com
 */

'use strict';

const merge = require('../util').merge;
const baseConf = require('./base');

const notNeedDeclarationAPIFeatures = [
    '@system.router',
    '@system.app'
];

module.exports = merge({}, baseConf, {

    /**
     * 模块 resolve 选项
     *
     * @type {Object}
     */
    resolve: {
        ignore: /^@(system|service)\./, // 忽略快应用的内部系统模块的 resolve

        /**
         * 收集需要导入声明的 API features
         * 默认不在 `notNeedDeclarationAPIFeatures` 该列表里且
         * `@system.` `@service.`开头的模块
         * 都会自动添加到项目清单的 feature 声明里
         *
         * @param {string} requireModId require 模块 id
         * @param {Object} file require 该模块 id 所属的文件对象
         */
        onResolve(requireModId, file) {
            if (notNeedDeclarationAPIFeatures.indexOf(requireModId) !== -1) {
                return;
            }

            if (/^@(system|service)\./.test(requireModId)) {
                let features = file.features || (file.features = []);
                if (features.indexOf(requireModId) === -1) {
                    features.push(requireModId);
                }
            }
        }
    },

    output: {

        /**
         * 输出的文件路径映射定义
         *
         * @type {Object}
         */
        pathMap: {
            projectConfig: false,
            entryScript: 'app.ux',
            entryStyle: 'app.css',
            appConfig: 'manifest.json'
        },

        /**
         * 自定义输出文件路径。
         * 如果该文件不输出，返回 `false`。
         *
         * @param {string} path 要输出的文件相对路径
         * @param {Object} file 要输出的文件对象
         * @return {boolean|string}
         */
        file(path, file) {
            if (file.isStyle && file.extname !== 'css' && !file.compiled) {
                return false;
            }

            // do not output not processed file and component config file
            if (!file.allowRelease || file.isComponentConfig) {
                return false;
            }

            return path;
        },

        /**
         * None app base class is needed
         */
        appBaseClass: null
    },

    component: {
        template: {
            transformTags: {
                'button': 'o-button'
            }
        },
        global: {
            'o-button': 'okam/Button'
        }
    },

    processors: {
        component: {
            rext: 'ux',
            options: {
                parse: {pad: 'space'},
                trim: true
            }
        },

        cssImport: {
            // using the existed postcss processor
            processor: 'postcss',
            extnames: ['css'],
            rext: 'css',
            options: {
                plugins: ['cssImport']
            }
        }
    },

    rules: [
        {
            match(file) {
                return file.isAppConfig;
            },
            processors: ['quickAppJson']
        },
        {
            match(file) {
                return file.isEntryScript || file.isComponent;
            },
            processors: ['componentGenerator']
        },
        {
            match(file) {
                // process sfc component style
                return file.isStyle && file.owner && file.owner.isPageComponent;
            },
            processors: ['addCssDependencies']
        }
    ]
});
