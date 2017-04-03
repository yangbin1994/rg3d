var webpack = require('webpack')

module.exports = {
    entry: './src/index.js',
    output: {
        path: __dirname,
        filename: 'public/bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['env'],
                        plugins: ['transform-runtime']
                    }
                }
            },
            {
                test: /\.css$/,
                use: ['style-loader', 'css-loader']
            },
            {
                test: /\.less$/,
                use: ['style-loader', 'css-loader', 'less-loader']
            },
        ]
    },
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.optimize.UglifyJsPlugin({ // https://github.com/angular/angular/issues/10618
            // mangle: {
            //   keep_fnames: true
            // },
            compress: { warnings: false }
        }),
        // new webpack.DefinePlugin({
            // 'process.env': {
                // 'ENV': JSON.stringify(ENV)
            // }
        // })
    ]
}