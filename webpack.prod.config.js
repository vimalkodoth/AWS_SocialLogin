const webpack = require('webpack');
const path = require("path");
const ExtractTextPlugin = require("extract-text-webpack-plugin");
let config = {
		entry: './index.js',
		output: {
			path: path.join(__dirname, "dist"),
			filename: 'output.js'
		},
		module : {
			rules: [
				//{
				//	test: /\.css$/,
				//	exclude: /node_modules/,
				//	loader: ExtractTextPlugin.extract('style-loader','css-loader')
                //
				//},
				{
					test: /\.scss$/,
					use: ExtractTextPlugin.extract({
						fallback: 'style-loader',
						//resolve-url-loader may be chained before sass-loader if necessary
						use: ['css-loader', 'sass-loader']
					})
				},
				// inline base64 URLs for <=8k images, direct URLs for the rest
      			{ 	test: /\.(png|jpg|gif)$/, loader: 'file-loader?name=img/img-[hash:6].[ext]',
					options: {
						outputPath: 'images/'
					}},
      			{
	                test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
					loader : 'file-loader',
					options: {
						outputPath: 'fonts/'
					}
            	}
			]

		},
		plugins: [
		    new webpack.ProvidePlugin({
		        $: "jquery",
		        jQuery: "jquery"
		    }),
			new ExtractTextPlugin("styles.css")
		],
		resolve: {
		    alias: {
		       handlebars: 'handlebars/dist/handlebars.min.js'
		    }
		}
  	}
module.exports = config;

