module.exports = {
	site: {
		title: 'Maydan Qatar',
		version: ' - Beta',
		logo_icon: '/i/logo.gif',
		alt_lang: 'عربي',
		tour:{
		  about1:'Find Local News and Events in Qatar',
		  about2:'Sign up to personalise\u2026',
		  about3:'Sign up to network\u2026'
		}
	},
	nav: {
		akhbari: 'Akhbari',
		article: 'Article',
		bookmarks: 'Bookmarks',
		back: 'Back',
		calendar: 'Calendar',
		event: 'Event',
		feedback: 'Give us feedback',
		forgot_password: 'Forgot Password',
		go: 'Go!',
		login: 'Log in',
    logout: 'Log out',
		medani: 'Medani',
		messages: 'Messages',
		post_article: 'Post an article',
		register: 'Sign up!',
		settings: 'Settings',
		taghub:{
		  content:'Content',
      discuss:'Discuss',
      $followers:{
        1: '1 follower',
        '?': 'Followers',
        n: '{0} followers'
      }
		},
		terms: 'Terms',
	  tour_video: 'Take a Tour'
	},
	dates: {
		months:[
			'January', 'February', 'March', 'April', 'May', 'June',
			'July', 'August', 'September', 'October', 'November', 'December'
		],
    $suffix: {
     	1: '{0}st',
     	2: '{0}nd',
     	3: '{0}rd',
     	21: '{0}st',
     	22: '{0}nd',
     	23: '{0}rd',
     	31: '{0}st',
     	n: '{0}th'
    },
		$seconds_ago: {
			0: 'Just now',
			1: 'A second ago',
			n: '{0} seconds ago'
		},
		$minutes_ago: {
			1: 'A minute ago',
			n: '{0} minutes ago'
		},
		$hours_ago: {
			1: 'An hour ago',
			n: '{0} hours ago'
		}
	},
	start: {
		validate: 'We just sent you a confirmation email. Please check your inbox and click on the confirmation link.',
		header: 'Start Following Tags',
		go: 'Go!'
	},
	login: {
	  header: 'Login to your account',
	  form: {
			email: 'Email address',
			password: 'Password',
			remember_password: 'Remember password?',
			button: 'login',
			forgot_password: 'Forgot your password?'
	  },
	  social: {
			sign_in_with: 'login with',
			facebook: 'facebook',
			twitter: 'twitter',
			linkedin: 'linkedin'
		},
		error: {
			user_non_existant: 'This email is not registered',
			user_inactive: 'This user has not been verified yet',
			user_wrong_password: 'The password you entered is incorrect'
		}
	},
	register: {
		header: 'Join Maydan Qatar',
		form: {
			email: 'Email address',
			password: 'Password',
			phone: 'Phone number',
			optional: '(optional)',
			button: 'Get Started'
		},
		error: {
			general: {
				register: 'Could not register user',
				confirmation: 'Registration successful. Sending confirmation email failed',
				login: 'Registration successful. Auto login failed'
			},
			terms: {
				not_accepted: 'You must accept the Terms and Conditions'
			},
			password: {
				short: 'Password should be at least 6 characters'
			},
			email: {
				invalid: 'This is not a valid email',
				existing: 'This email has already been used'
			}
		},
		terms_and_conditions_text: 'By ticking the box I confirm that I have read and accept the',
		terms_and_conditions_link: 'Terms and Conditions',
		login: 'go to Login'
	},
	confirmation: {
		error: {
			already_done: 'This user has already been validated',
			nonexistant: 'This email is not registered',
			expired: 'This confirmation link has expired',
			invalid: 'This link is invalid',
			find: 'Failed to fetch user',
			save: 'Failed to save user',
			send: 'Failed to send validation email',
			loggedin: 'This user is already logged in.',
			not_sent: 'Failed to send validation email'
		},
    done: 'This user has been validated.',
    login_site: 'Proceed to the website',
    login_app: 'or login on your mobile app',
    failure: 'We could not validate this email',
    re_generate: 'Click to generate a new confirmation link',
    re_register: 'Click can register again',
    sent: 'A validation email has been sent to your account'
	},
	reset_password: {
    header: 'Reset your password',
    form: {
      email: 'Email address',
      button: 'send'
    },
    error: {
      user_non_existant: 'This email is not registered',
      link_invalid: 'This reset password link is invalid',
      link_expired: 'This reset password link has expired'
    },
    done: 'We just sent you an email to reset your password. Please check your inbox and click the password reset link',
    login: 'back to Login',
    resend: 'Send a new password reset email?'
	},
	change_password: {
		form:{
			password: 'New password',
			button: 'save'
		},
		error:{
			invalid: 'This password is not acceptable',
			user_non_existant: 'This email is not registered'
		},
		success: 'Your password has been changed',
		failed: 'Failed to change password'
	},
	terms_and_conditions: {
    header: 'Terms and Conditions',
    content: 'Bla bla bla bla bla, blablabla bla bla blabla.Bla bla bla blablabla blabla.',
    back: 'back to Sign Up'
	},
	content:{
		bookmark: 'Bookmark',
		add_to_calendar: 'Add to Calendar',
		share:{
			article: 'Share Article',
			event: 'Share Event'
		},
		recommended: {
			header: 'Recommended for you',
			loading: 'Loading ...',
			none: 'No recommendations',
			failed: 'Could not fetch recommendations'
		},
		read_full: 'Read Full Article',
		read_aloud: 'Read Aloud',
		follow: 'follow',
		unfollow: 'unfollow',
		comments: 'Comments',
		my_location: 'My Location'
	},
	forum : {
	 	readmore : 'Read More',
	 	reply : 'reply',
	 	saysomething : 'Have your say...',
	 	login : 'Sign in to join the discussion!',
	 	notavailable : 'Comments are temporarily unavailable',
	 	submit: 'submit',
	 	$likes: {
	 	  1: '1 like',
	 	  n: '{0} likes'
	 	}
 	},
 	settings : {
 		client_statement: "Published by Qatar News Agency",
 		kv_statement: "Powered by KnowledgeView ltd.",
 		feedback: 'Send us your feedback'
 	},
 	medani : {
 		title: 'Medani',
 		posts: 'Posts',
 		tags: 'Tags',
 		profile: {
 			about: 'About',
 			message: 'send message',
 			follow: 'follow'
 		},
 		avatar: {
 			header: 'Select a User Avatar'
 		}
 	},
 	search:{
 	  $tags: {
 	    1: '1 Related Tag',
 	    n: '{0} Related Tags'
 	  },
    $articles: {
      1: '1 News Story',
      n: '{0} News Stories'
    },
    $events: {
      1: '1 Event',
      n: '{0} Events'
    }
 	},
 	common: {
 		browse: 'browse',
 		cancel: 'Cancel',
 		edit: 'edit',
 		see_all: 'see all',
 		see_less: 'see less',
 		loading: 'Loading ...',
 		save: 'save',
 		select: 'Select',
 		submit: 'submit',
 		$possessive_form: {
 			first_person: 'My {2}',
 			third_person: '{1}\'s {2}'
 		}
 	},
 	messages: {
        messagehead: "Messages",
        article_share: "Share to Maydan User",
        form: {
            recipients: "Send To",
            send_to_placeholder: "Search medani username",
            message_body_placeholder: "Optional message",
            messahe_lable: "Message",
            send_button: "Send"
        },
        share: {
        	header: "Share",
        	sendto: "Send To",
        	message: "Message",
        	placeholder: "Enter message",
        	button: "Send Message",
        	limit:"The text limit should not be more than 1000 characters",
        	addRecipient: "Please add atleast one recipient"
        },
        inbox: {
        	compose_link: "Compose"
        },
        conversation: {
        	conversation_with: "Conversation with",
        	conversation_glue: "and",
        	conversation_other: "others"
        }
    },
    share: {
        to_maydan_user: "Share to Maydan User"
    }
};

