/**
 * @file Build mini program base config
 * @author ${author|raw}
 */

'use strict';

const path = require('path');

const DEV_SERVER_PORT = 9090;

module.exports = {
    verbose: false,
    root: path.join(__dirname, '..'),
    output: {
        dir: 'dist',
        depDir: 'src/common'
    },
    component: {
        extname: '${sfcExt}',
        template: {
            // 标签转换配置项
            transformTags: {
            }
        }
    },
    framework: [
        'data',
        'watch',
        <% if: ${redux} %>
        'redux',
        <% /if %>
        'behavior',
        'broadcast',
        'ref'
    ],
    processors: {
        <% if: ${script} === 'typescript' %>
        babel7: {
            extnames: ['js', 'ts']
        },
        <% elif: ${script} === 'babel7' %>
        babel7: {
            extnames: ['js']
        },
        <% else %>
        babel: {
            extnames: ['js']
        },
        <% /if %>
        <% if: ${template} === 'pug' %>
        pug: {
            extnames: ['pug', 'tpl'],
            options: {
                doctype: 'xml',
                data: {
                    name: 'efe'
                }
            }
        },
        // 定义小程序模板转换的文件后缀名
        view: {
            <% if: ${template} === 'pug' %>
            extnames: ['pug', 'tpl']
            <% else %>
            extnames: ['tpl']
            <% /if %>
        },
        <% /if %>
        postcss: {
            extnames: ['${styleExt}'],
            options: {
                <% if: ${px2rpx} %>
                plugins: {
                    px2rpx: {
                        // 设计稿尺寸
                        designWidth: 1242,
                        // 开启 1px 不转
                        noTrans1px: true
                    }
                }
                <% /if %>
            }
        }
    },

    // 启用开发 Server
    server: {
        port: DEV_SERVER_PORT,
        type: 'connect',
        // 需要安装 mock 中间件 npm i autoresponse --save-dev
        middlewares: [
            // {
            //     name: 'autoresponse',
            //     options: {
            //         post: true,
            //         get: true
            //     }
            // }
        ]
    },

    prod: {
        rules: [
            {
                match: '*.js',
                processors: [
                    ['replacement', {'process.env.NODE_ENV': '"production"'}]
                ]
            }
        ]
    },

    dev: {
        rules: [
            <% if: ${tinyimg} %>
            {
                match: /\.(png|jpe?g|gif)(\?.*)?$/,
                processors: {
                    tinyimg: {
                        replaceRaw: true
                    }
                }
            },
            <% /if %>
            {
                match: '*.js',
                processors: [
                    ['replacement', {
                        // 'https://online.com': 'https://dev.com',
                        'process.env.NODE_ENV': '"development"'
                    }]
                ]
            }
        ]
    },
    test: {
        rules: [
            {
                match: '*.js',
                processors: [
                    ['replacement', {
                        // 'https://online.com': 'https://test.com',
                        'process.env.NODE_ENV': '"development"'
                    }]
                ]
            }
        ]
    }
};
