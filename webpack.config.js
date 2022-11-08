const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin')
const {IgnorePlugin} = require('webpack')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
//const OptimizeCssAssetWebpackPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')
const {BundleAnalyzerPlugin} = require('webpack-bundle-analyzer')

const isDev = process.env.NODE_ENV === 'development'
const isProd = !isDev

const filename = ext => isDev ? `[name].${ext}` : `[name].[hash].${ext}`

const optimization = () => {
    const config = {
        splitChunks: {
            chunks: 'all'
        }
    }

    if (isProd) {
        config.minimizer = [
            new TerserWebpackPlugin()
        ]
    }

    return config
}

const babelOptions = preset => {
    const opts = {
        presets: [
            '@babel/preset-env'
        ],
        plugins: [
            '@babel/plugin-proposal-class-properties'
        ]
    }

    if (preset) {
        opts.presets.push(preset)
    }

    return opts
}

const jsLoaders = () => {
    return [{
        loader: 'babel-loader',
        options: babelOptions()
    }]
}

const cssLoaders = extra => {
    const loaders = [
        {
            loader: MiniCssExtractPlugin.loader,
            options: {
                hmr: isDev,
                reloadAll: true
            },
        },
        'css-loader'
    ]

    if (extra) {
        loaders.push(extra)
    }

    return loaders
}

const plugins = () => {
    const base = [
        new HtmlWebpackPlugin(),
        new CleanWebpackPlugin(),
        new CopyWebpackPlugin({
            patterns: [
                {
                    from: path.resolve(__dirname, 'src/public/images/hero-img.png'),
                    to: path.resolve(__dirname, 'dist/storage/json-convention.txt')
                },
                {
                    from: path.resolve(__dirname, 'src/storage'),
                    to: path.resolve(__dirname, 'dist/storage')
                }
            ]
        }),
        new MiniCssExtractPlugin({
            filename: filename('css')
        })
    ]

    if (isProd) {
        base.push(new BundleAnalyzerPlugin())
    }

    return base
}
module.exports = {
    context: path.resolve(__dirname, 'src'),
    mode: 'development',
    entry: {
        // '/public/stylesheets/style': '/public/stylesheets/style.less',
        // '/public/images/hero-img': '/public/images/hero-img.png',
        //index: './bin/index.html',
        '/public/javascripts/friends': './public/javascripts/friends.js',
        '/public/javascripts/newsFriends': './public/javascripts/newsFriends.js',
        '/public/javascripts/users': './public/javascripts/users.js',
        '/views/layouts/layout': './views/layouts/layout.ejs',
        '/views/index': './views/index.ejs',
        '/views/admin/friends': './views/admin/friends.ejs',
        '/views/admin/index': './views/admin/index.ejs',
        '/views/admin/newsFriends': './views/admin/newsFriends.ejs'

    },
    externals: {
        express: 'express',
    },
    output: {
        filename: filename('js'),
        path: path.resolve(__dirname, 'dist')
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
        }
    },
    devServer: {
        // proxy: {
        //     '/': 'http://localhost:3000',
        //     '/admin': 'http://localhost:3000/admin'
        // },
        static: {
            directory: path.join(__dirname, 'public'),
        },
        compress: true,
        port: 9000,
        open: true,
        https: true
    },
    devtool: isDev ? 'source-map' : false,
    optimization: optimization(),
    plugins: plugins(),
    module: {
        rules: [
            {
                test: /\.ejs$/,
                loader: 'ejs-loader',
                options: {
                    esModule: false
                }
            },
            {
                test: /\.css$/,
                use: cssLoaders()
            },
            {
                test: /\.less$/,
                use: cssLoaders('less-loader')
            },
            {
                test: /\.s[ac]ss$/,
                use: cssLoaders('sass-loader')
            },
            {
                test: /\.(png|jpg|svg|gif)$/,
                use: ['asset/resource']
            },
            {
                test: /\.(ttf|woff|woff2|eot)$/,
                use: ['asset/resource']
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
            // {
            //     test: /\.ts$/,
            //     exclude: /node_modules/,
            //     loader: {
            //         loader: 'babel-loader',
            //         options: babelOptions('@babel/preset-typescript')
            //     }
            // },
            // {
            //     test: /\.jsx$/,
            //     exclude: /node_modules/,
            //     loader: {
            //         loader: 'babel-loader',
            //         options: babelOptions('@babel/preset-react')
            //     }
            // }
        ]
    }
}