// Defines the set of js and css resources that this project
// wants to export via the web-server. 
// 
// These assets can be served from hogan templates using, e.g., 
// {{resources.js.main}} to serve the bundled and minified files listed in 
// the js.main array below.
//
// Note that plugins may augment these bundled resources by contributing
// to the same named group, so the file served in response to 
// {{resources.js.main}} may include more than just the content of the files
// listed in the array here.
module.exports = {
	js: {
    debug:[
			'/public/js/debug/react-with-addons.js',
			'/public/js/debug/JSXTransformer.js',
			'/public/js/_gen/config.js',
      '/public/js/application.js',
      '/public/js/utils.js',
      '/public/js/ajax.js',
      '/public/js/i18n.js',
      '/public/js/api.js',
      '/public/js/routing.js',
      '/public/js/platformApi.js',
      '/public/js/phonegapLoader.js',
      '/public/js/phonegapApi.js',
      '/public/js/auth.js',
      '/public/js/notification.js'
    ],
    production:[
      '/public/js/production/react-with-addons.min.js',
      '/public/js/_gen/config.js',
      '/public/js/application.js',
      '/public/js/utils.js',
      '/public/js/ajax.js',
      '/public/js/i18n.js',
      '/public/js/api.js',
      '/public/js/routing.js',
      '/public/js/platformApi.js',
      '/public/js/phonegapLoader.js',
      '/public/js/phonegapApi.js',
      '/public/js/auth.js',
      '/public/js/notification.js'
    ]
  },
  jsx: {
		components: [
			'/public/jsx/mixins/intervals.jsx',
			'/public/jsx/components/auth.jsx',
			'/public/jsx/components/registration_confirmation.jsx',
			'/public/jsx/components/password_reset.jsx',
			'/public/jsx/components/comments.jsx',
			'/public/jsx/components/content.jsx',
			'/public/jsx/components/dates.jsx',
			'/public/jsx/components/followers.jsx',
			'/public/jsx/components/generic.jsx',
			'/public/jsx/components/hearts.jsx',
			'/public/jsx/components/images.jsx',
      		'/public/jsx/components/lightbox.jsx',
			'/public/jsx/components/map.jsx',
			'/public/jsx/components/medani.jsx',
			'/public/jsx/components/preview.jsx',
			'/public/jsx/components/route.jsx',
			'/public/jsx/components/recommend.jsx',
			'/public/jsx/components/scroll.jsx',
			'/public/jsx/components/search.jsx',
			'/public/jsx/components/settings.jsx',
			'/public/jsx/components/share.jsx',
			'/public/jsx/components/site_header.jsx',
			'/public/jsx/components/site_navigation.jsx',
			'/public/jsx/components/site.jsx',
			'/public/jsx/components/slider.jsx',
			'/public/jsx/components/start.jsx',
			'/public/jsx/components/tags.jsx',
			'/public/jsx/components/user.jsx',
			'/public/jsx/components/video.jsx',
    		'/public/jsx/pages/index.jsx',
    		'/public/jsx/components/messages.jsx'
    ]
	},
	css: {
		ltr_small: [
		  '/public/css/ltr_fonts.css',
      '/public/css/icon-font.css',
			'/public/css/normalize.css',
			'/public/css/style.css',
			'/public/css/ltr.css',
			'/public/css/small.css',
			'/public/css/ltr_small.css'
		],
		ltr_medium: [
		  '/public/css/ltr_fonts.css',
		  '/public/css/icon-font.css',
			'/public/css/normalize.css',
			'/public/css/style.css',
			'/public/css/ltr.css',
			'/public/css/medium.css',
			'/public/css/ltr_medium.css'
		],
		ltr_large: [
		  '/public/css/ltr_fonts.css',
		  '/public/css/icon-font.css',
			'/public/css/normalize.css',
			'/public/css/style.css',
			'/public/css/ltr.css',
			'/public/css/large.css',
			'/public/css/ltr_large.css'
		],
		rtl_small: [
		  '/public/css/rtl_fonts.css',
		  '/public/css/icon-font.css',
		  '/public/css/normalize.css',
			'/public/css/style.css',
			'/public/css/rtl.css',
			'/public/css/small.css',
			'/public/css/rtl_small.css'
		],
		rtl_medium: [
      '/public/css/rtl_fonts.css',
		  '/public/css/icon-font.css',
			'/public/css/normalize.css',
			'/public/css/style.css',
			'/public/css/rtl.css',
			'/public/css/medium.css',
			'/public/css/rtl_medium.css'
		],
		rtl_large: [
      '/public/css/rtl_fonts.css',
		  '/public/css/icon-font.css',
			'/public/css/normalize.css',
			'/public/css/style.css',
			'/public/css/rtl.css',
			'/public/css/large.css',
			'/public/css/rtl_large.css'
		]
	}
};
