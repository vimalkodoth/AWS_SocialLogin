const webpack = require('webpack');
let config = {
		entry: './index.js',
		output: {
			filename: 'output.js'
		},
		module : {
			rules: [
				{
					test: /\.scss$/,
					loader:['style-loader','css-loader','sass-loader']
				},
				// inline base64 URLs for <=8k images, direct URLs for the rest
      			{ 	test: /\.(png|jpg)$/, loader: 'url-loader?limit=8192'},
      			{
	                test   : /\.(ttf|eot|svg|woff(2)?)(\?[a-z0-9=&.]+)?$/,
					loader : 'file-loader'
            	}
			]

		},
		plugins: [
		    new webpack.ProvidePlugin({
		        $: "jquery",
		        jQuery: "jquery"
		    })
		],
		resolve: {
		    alias: {
		       handlebars: 'handlebars/dist/handlebars.min.js'
		    }
		}
  	}
module.exports = config;

