const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = {
    entry: './game/Game.js',
    output: {
        filename: 'game.js',
        path: path.resolve(__dirname, 'dist'),
    },
    module: {
        rules: [
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
        ]
    },
    plugins: [
        new CopyPlugin({
            patterns: [
                { from: 'audio', to: 'audio' },
                { from: 'images', to: 'images' },
                { from: 'styles', to: 'styles' },
                { from: 'game.config.js', to: 'game.config.js' },
                {
                    from: 'project.config.json',
                    to: 'project.config.json',
                    transform(content) {
                        // 在生产环境中移除开发相关的配置
                        const config = JSON.parse(content);
                        if (process.env.NODE_ENV === 'production') {
                            config.setting.urlCheck = true;
                            config.setting.debug = false;
                        }
                        return JSON.stringify(config, null, 2);
                    }
                }
            ]
        })
    ],
    resolve: {
        extensions: ['.js']
    }
}; 