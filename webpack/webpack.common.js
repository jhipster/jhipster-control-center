'use strict';
const path = require('path');
const { merge } = require('webpack-merge');
const { VueLoaderPlugin } = require('vue-loader');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const { DefinePlugin, EnvironmentPlugin } = require('webpack');
const { vueLoaderConfig } = require('./vue.utils');
const config = require('./config');

function resolve(dir = '') {
  return path.join(__dirname, '..', dir);
}

module.exports = async (env, options) => {
  const development = options.mode === 'development';
  return merge(
    {
      mode: options.mode,
      context: resolve(),
      entry: {
        app: './src/main/webapp/app/main.ts',
      },
      output: {
        path: resolve('target/classes/static/'),
      },
      resolve: {
        extensions: ['.ts', '.js', '.vue', '.json'],
        alias: {
          vue$: 'vue/dist/vue.esm.js',
          '@': resolve('src/main/webapp/app'),
        },
        fallback: {
          // prevent webpack from injecting useless setImmediate polyfill because Vue
          // source contains it (although only uses it if it's native).
          setImmediate: false,
          // prevent webpack from injecting mocks to Node native modules
          // that does not make sense for the client
          dgram: 'empty',
          fs: 'empty',
          net: 'empty',
          tls: 'empty',
          child_process: 'empty',
        },
      },
      cache: {
        // 1. Set cache type to filesystem
        type: 'filesystem',
        cacheDirectory: resolve('target/webpack'),
        buildDependencies: {
          // 2. Add your config as buildDependency to get cache invalidation on config change
          config: [
            __filename,
            path.resolve(__dirname, 'config.js'),
            path.resolve(__dirname, 'vue.utils.js'),
            path.resolve(__dirname, `webpack.${development ? 'dev' : 'prod'}.js`),
            path.resolve(__dirname, '../.postcssrc.js'),
            path.resolve(__dirname, '../tsconfig.json'),
          ],
        },
      },
      module: {
        rules: [
          {
            test: /\.vue$/,
            loader: 'vue-loader',
            options: vueLoaderConfig(!development),
          },
          {
            test: /\.ts$/,
            use: [
              {
                loader: 'ts-loader',
                options: {
                  appendTsSuffixTo: ['\\.vue$'],
                  happyPackMode: true,
                  transpileOnly: true,
                },
              },
            ],
            include: [resolve('src'), resolve('test')],
          },
          {
            test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'content/[hash].[ext]',
              publicPath: '../',
            },
          },
          {
            test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'content/[hash].[ext]',
              publicPath: '../',
            },
          },
          {
            test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
            loader: 'url-loader',
            options: {
              limit: 10000,
              name: 'content/[hash].[ext]',
              publicPath: '../',
            },
          },
        ],
      },
      plugins: [
        new EnvironmentPlugin({
          // Required by vuelidate https://github.com/vuelidate/vuelidate/issues/365
          BUILD: 'web',
        }),
        new DefinePlugin({
          VERSION: JSON.stringify(config.version),
          SERVER_API_URL: JSON.stringify(config.serverApiUrl),
        }),
        new VueLoaderPlugin(),
        new CopyWebpackPlugin({
          patterns: [
            {
              context: './node_modules/swagger-ui-dist/',
              from: '*.{js,css,html,png}',
              to: 'swagger-ui/',
              globOptions: { ignore: ['**/index.html'] },
            },
            { from: './node_modules/axios/dist/axios.min.js', to: 'swagger-ui/' },
            { from: './src/main/webapp/swagger-ui/', to: 'swagger-ui/' },
            { from: './src/main/webapp/content/', to: 'content/' },
            { from: './src/main/webapp/favicon.ico', to: 'favicon.ico' },
            {
              from: './src/main/webapp/manifest.webapp',
              to: 'manifest.webapp',
            },
            // jhipster-needle-add-assets-to-webpack - JHipster will add/remove third-party resources in this array
            { from: './src/main/webapp/robots.txt', to: 'robots.txt' },
          ],
        }),
      ],
    },
    await require(`./webpack.${development ? 'dev' : 'prod'}`)(env, options)
    // jhipster-needle-add-webpack-config - JHipster will add custom config
  );
};
