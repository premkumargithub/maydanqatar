var path = require('path');

module.exports = function(){

  return {
    app: {
      port: 85,
      pageSize: 25,
      scrollLimit: 200,
      defaultLanguage: 'ar',
      mode: 'production',
      session_timeout: 2*24*60*60,
      secret: 'heebiejeebie',
      date_format: 'yyyy-mm-dd',// for session hashing
      workers:1,
      ingest_interval: 15000
    },
    domain: "www.maydan.qa",
    urls: {
      www: "http://www.maydan.qa",
      image: "http://images.maydan.qa",
      static: "http://static.maydan.qa"
    },
    rb: {
      url: 'http://rb.maydanqatar.com/newsbrowser/',
      username: 'mqd-node',
      password: 'mqd'
    },
    mongo: 'mongodb://localhost/mq',
    elastic: {
      connect: {
        url: "localhost",
        port: 9200,
        index: "mq",
        curlDebug: false
      },
      create: {
        settings: {
          number_of_shards: 5,
          number_of_replicas: 1
        },
        mappings: require('./conf/elastic_mappings.js')()
      }
    },
    queries:{
    	akhbari: {
    	  en:{
    	    query:{
            term:{
              lang:"en"
            }
          },
          sort: {
            published:{
              order:"desc"
            }
          }
        },
				ar:{
					query:{
            term:{
              lang:"ar"
            }
          },
          sort: {
            published:{
              order:"desc"
            }
          }
				}
			}
    },
    filesystem: {
      root: "/var/kv/data/mq/",
      temp: "/var/kv/data/temp/"
    },
    media: {
      images: {
        thumb: {
          low: {
            w: 80,
            h: 60
          },
          med: {
            w: 160,
            h: 120
          },
          high: {
            w: 320,
            h: 240
          }
        },
        display: {
          low: {
            w: 320,
            h: 240
          },
          med: {
            w: 640,
            h: 480
          },
          high: {
            w: 1280,
            h: 960
          }
        }
      }
    },
    social: [{
      name: 'twitter',
      keys: {
        consumerKey: 'oWD0agalOIJuUBxO1V7ARg',
        consumerSecret: 'rMLe1jgDuytzzW04t767aUIhL6vamQjTkN69byg'
      }
    }, {
      name: 'facebook',
      keys: {
        clientID: '212909598907706',
        clientSecret: 'b8869d0923fc7354d50f8c3b68da912f'
      },
      fields: [
        'id', 'username', 'displayName', 'name', 'gender', 'about', 'emails', 'photos'
      ],
      scope: 'email'
    }, {
      name: 'linkedin',
      keys: {
        consumerKey: '75rz08abec8u5s',
        consumerSecret: 'FQKVc6P5Kpz2jb7Y'
      },
      fields: [ 'id', 'first-name', 'last-name', 'email-address', 'summary', 'pictureUrl' ],
      scope: 'r_emailaddress'
    }],
    jwplayer: {
		  plugin_url: 'http://jwpsrv.com/library/Ut+t9ozkEeOSuyIACrqE1A.js'
	  },
	  googlemaps: {
	    api_key: 'AIzaSyCO0rSBZH6lj-eAojb_B8BaztbQ4HdGBcI'
	  },
    mailing: {
      account: {
        from: 'Maydan Qatar <info@maydan.qa>',
        bcc: 'info@maydan.qa',
        protocol: 'SMTP',
        host: "smtp.maydan.qa",
        secureConnection: false,
        port: 25,
        requiresAuth: true,
        credentials: {
          user: 'info',
          password: 'Qm%3&2022'
        }
      },
      feedback: 'info@maydan.qa',
      templates: './conf/email_templates/',
      locals: {
      	logo: '/i/logo.gif'
      }
    },
  sharing: [{ 
     name: 'twitter',
     url : 'https://twitter.com/intent/tweet?text=|t_140|&url=|u|',
     label: 'Twitter',
     icon: 'icon-twitter'
    }, {
     name: 'facebook',
     url : "http://www.facebook.com/share.php?u=|u|",
     label: 'Facebook',
     icon: 'icon-facebook'
    }, {
     name: 'linkedin',
     url : 'http://www.linkedin.com/cws/share?mini=true&url=|u|',
     label: 'LinkedIn',
     icon: 'icon-linkedin'
    }, {
     name: 'googleplus',
     url : 'https://plusone.google.com/_/+1/confirm?hl=en&url=|u|',
     label: 'Google+',
     icon: 'icon-google-plus'
    }],
    notification : {
    	name : "Maydan",
    	development : {
    		android : {
    			client: {  senderID: '408943962290' },
    			server : { apiKey: 'AIzaSyBDp7LuT8c_K4uI_H1rjYEN7ZUZ0T8p5Fw' }
    		},
    		ios : {
    			client : { 'badge':'true','sound':'true','alert':'true' },
    			server : {  pfx : 'development.p12',  passphrase: '123456' }
    		}
    	},
    	production : {
    		android : {
    			client: {  senderID: '408943962290' },
    			server : { apiKey: 'AIzaSyBDp7LuT8c_K4uI_H1rjYEN7ZUZ0T8p5Fw' }
    		},
    		ios : {
    			client : { 'badge':'true','sound':'true','alert':'true' },
    			server : {  pfx : 'production.p12',  passphrase: '123456' }
    		}
    	}
    },
    tour_video_url: {
    	en:'https://www.youtube.com/watch?v=pYf4DprP-I4&feature=youtu.be',
    	ar:'https://www.youtube.com/watch?v=zhCfiVdaszw&feature=youtu.be'
    },
    resources: {
    	avatars: path.join(__dirname, './conf/avatars/')
    }
  };
};
