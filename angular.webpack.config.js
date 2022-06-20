import ResolveTypeScriptPlugin from 'resolve-typescript-plugin';

/**
 *
 * @param {import('webpack').Configuration} config
 * @param {import('@angular-builders/custom-webpack').CustomWebpackBrowserSchema} options
 * @param {import('@angular-builders/custom-webpack').TargetOptions} targetOptions
 * @returns {import('webpack').Configuration}
 */
export default function (config, options, targetOptions) {
    config.resolve ??= {};
    config.resolve.plugins ??= [];
    config.resolve.plugins.push(new ResolveTypeScriptPlugin());
    return config;
}
