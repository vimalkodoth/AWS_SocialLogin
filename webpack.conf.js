const webpack = require('webpack');
var config = {
		entry: './index.js',
		output: {
			filename: 'output.js'
		},
		module : {
			rules: [
				{
					test: /\.scss$/,
					loader:['style-loader','css-loader','sass-loader']
				}
			]
		}
  	}
module.exports = config;

