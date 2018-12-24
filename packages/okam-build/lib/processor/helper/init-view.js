/**
 * @file Component template view transform options initialize
 * @author sparklewhy@gmail.com
 */

'use strict';

/* eslint-disable fecs-min-vars-per-destructure */
const path = require('path');
const PLUGIN_BASE_NAME = path.join(__dirname, '..', 'template/plugins');

/**
 * Get event syntax transformation plugin
 *
 * @param {string} appType the app type to transform
 * @return {string}
 */
function getEventSyntaxPlugin(appType) {
    return path.join(PLUGIN_BASE_NAME, 'event', `${appType}-event-plugin`);
}

/**
 * Get template syntax transformation plugin
 *
 * @inner
 * @param {string} appType the app type to transform
 * @return {string}
 */
function getTemplateSyntaxPlugin(appType) {
    return path.join(PLUGIN_BASE_NAME, `${appType}-syntax-plugin`);
}

/**
 * The builtin plugins
 *
 * @const
 * @type {Object}
 */
const BUILTIN_PLUGINS = {
    syntax: getTemplateSyntaxPlugin,
    eventSync: getEventSyntaxPlugin,
    tagTransform: path.join(PLUGIN_BASE_NAME, 'tag-transform-plugin'),
    vuePrefix: path.join(PLUGIN_BASE_NAME, 'vue-prefix-plugin'),
    ref: path.join(PLUGIN_BASE_NAME, 'ref-plugin')
};

/**
 * Add ref plugin
 *
 * @inner
 * @param {Array.<Object>} plugins the existed plugins
 * @return {Array.<Object>}
 */
function addRefPlugin(plugins) {
    let refPlugin = require(BUILTIN_PLUGINS.ref);
    let hasRefPlugin = plugins.some(
        item => (refPlugin === (Array.isArray(item) ? item[0] : item))
    );
    if (!hasRefPlugin) {
        plugins.push(refPlugin);
    }

    return plugins;
}

/**
 * Normalize the view transformation plugins
 *
 * @inner
 * @param {Array.<string|Object>} plugins the plugins to normalize
 * @param {string} appType the appType to transform
 * @return {Array.<Object>}
 */
function normalizeViewPlugins(plugins, appType) {
    return plugins.map(item => {
        let pluginItem = item;
        let pluginOptions;
        if (Array.isArray(item)) {
            pluginItem = item[0];
            pluginOptions = item[1];
        }
        else if (typeof item === 'string') {
            let pluginPath = BUILTIN_PLUGINS[item];
            if (typeof pluginPath === 'function') {
                pluginPath = pluginPath(appType);
            }
            else if (pluginPath && typeof pluginPath === 'object') {
                pluginPath = pluginPath[appType];
            }

            pluginPath && (pluginItem = pluginPath);
        }

        if (typeof pluginItem === 'string') {
            pluginItem = require(pluginItem);
        }

        return pluginOptions ? [pluginItem, pluginOptions] : pluginItem;
    });
}

function handleOnTag(file, tagName, replaceTagName) {
    let tags = file.tags;
    tags || (tags = file.tags = {});
    if (replaceTagName && tags.hasOwnProperty(replaceTagName)) {
        delete tags[replaceTagName];
    }

    tags[tagName] = true;
}

/**
 * Initialize component view template transform options.
 *
 * @param {Object} file the file to process
 * @param {Object} processOpts the process options
 * @param {Array.<string|Object>} processOpts.plugins the view processor plugins,
 *        the builtin plugins:
 *        `syntax`: transform okam template syntax to mini program template syntax
 *        `tagTransform`: transform tags A to tag B
 *        `ref`: provide view `ref` attribute support like Vue
 *        You can also pass your custom plugin:
 *        {
 *           tag() {} // refer to the ref plugin implementation
 *        }
 * @param {BuildManager} buildManager the build manager
 * @return {Object}
 */
function initViewTransformOptions(file, processOpts, buildManager) {
    let isSupportRef = buildManager.isEnableRefSupport();
    let plugins = processOpts.plugins;

    let {appType, componentConf} = buildManager;
    let templateConf = (componentConf && componentConf.template) || {};
    if (!plugins || !plugins.length) {
        plugins = ['syntax'];

        if (templateConf.transformTags) {
            plugins.push('tagTransform');
        }

        // vuePrefix  需要在第一位，v- directives 处理成 directives 再处理
        if (templateConf.useVuePrefix) {
            plugins.unshift('vuePrefix');
        }
    }

    plugins = normalizeViewPlugins(plugins, appType);
    if (isSupportRef) {
        plugins = addRefPlugin(plugins);
    }

    processOpts.plugins = plugins;

    return Object.assign(
        {},
        processOpts,
        {
            plugins,
            template: templateConf,
            onTag: handleOnTag.bind(null, file)
        }
    );
}

module.exports = exports = initViewTransformOptions;

exports.getEventSyntaxPlugin = getEventSyntaxPlugin;
