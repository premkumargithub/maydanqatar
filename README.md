# NewsPad / MaydanQatar

The Maydan Qatar "NewsPad" project is a social news application that delivers highly personalised news to registered users through simple user-experiences like "following" tags.

The site is "responsive", in that it renders differently for 3 different categories of screen - large, medium and small (or desktop, tablet and mobile if you like). We have a design document for the site, including more screens than are currently implemented ... no doubt we will share the design documents with you in due course.

The aim is for the site to work in web-browsers as you would expect, but we also wrap the website in a native shell for deployment via app-stores. We are using PhoneGap to wrap the site - we have Android and iOS versions already available in the Apple app store and Google Play.

There are two types of content in the system: Articles and Events. Articles are, as you would expect, typical news stories with images, videos, text, tags, dates, and other meta-data. Events are a specialised type of Article which include a special venue tag with geo-location, and event-schedule metadata.

The social aspects of the site to date are:

- You can register/authenticate with social accounts
- You can register/authenticate with an email account
- You can comment on articles and events
- You can "follow" tags
- You can comment on tag forums
- Contextual maps (maps show pins for the event you are reading about but also for yourself)

High on the priority list are further social aspects:

- Voting on comments
- Gamification (by ranking users per comment forum by number of votes received)
- User submitted content

... and of course more and more as we progress.

## Technology Stack

The software is built on the following technology stack:

* Node.js + Express
* MongoDB (Transactional data - user-accounts and so forth)
* ElasticSearch (Non-transactional article data, full-text querying in English and Arabic)
* React.js (client js UI framework from Facebook)

Deployment is on Linux VM's in Microsoft's Azure cloud, fronted with Nginx.

There is also a back-office editorial system from which we ingest the Article and Event content - you probably won't need to worry about that except to run the "ingest" node app to collect some data to populate your ElasticSearch index (the ingest app pulls content from the editorial system via JSON^HTTP api's).

### The Application

Here's a quick run-down of how we're using the tech-stack ...

#### Node.js

Node.js runs all your code on a single event loop. To all intents and purposes it is single-threaded.

To make full use of available CPU cores we are using node's `cluster` module, which forks child processes as workers, leaving the parent process to monitor and restart crashed workers.

For development 1 worker is easily sufficient (this can be specified in your personal config file - see below).

The important thing to remember is: workers are separate child processes and do not share state. We do not and can not safely cache data in the node worker processes, as that data will not be kept in sync.

#### ElasticSearch

ElasticSearch is superb for the read-heavy / search-heavy nature of the main news content, but not so good for content that needs atomic modification at the sub-document level (it is not transactional, and only supports updates by delete-and-re-add).

#### MongoDB

MongoDB only recently got full-text search, and the support for Arabic is not going to meet our needs. With ElasticSearch we can relatively easily plug-in our own stemming (and exemptions), tokenisation, stop-words, etc.

We're using mongo for the transactional data, since it does support atomic partial updates of existing documents, and is much more suited to working with "real-time" updates.

For development you should only need a default install of elastic and a default install of mongo - everything should then "just work".

##### Mongoose

We are using the Mongoose library (http://mongoosejs.com/) to create the domain model classes and do the mapping to mongodb. It works like hibernate, in that you can modify the objects and then flush the changes back to the db.


#### Express

We are using Express as the server-side web-framework, with hogan (hjs) templates where necessary. Most of the user-interface is NOT implemented by server-side templating, it is implemented with a client-side javascript framework (React.js).

Server-side hjs templates are used in a few places:

* To deliver the initial page and references to static files (js, css, images)
* To deliver a few specific sub-pages which are always loaded in iframes (e.g. maps and videos)

More importantly, Express routes are used to create restful API's serving JSON over HTTP. The React.js components communicate with these API's to GET & POST data. There is a single pure js client script (public/js/api.js) that encapsulates the bulk of the actual API communication.

#### React.js

React.js is a client-side UI framework created by Instagram and now operated by Facebook. We are building the vast majority of the Maydan Qatar user-interface using React.js components.

There is a nice Google Chrome plugin available that lets you inspect the component hierarchy - highly recommended.

Coding React components makes clever use of javascript's native xml markup language (e4x) to allow us to write html tags directly in the javascript code. This requires a compilation step to convert the html tags to pure js. 

When the MaydanQatar application is running in "debug" mode (a setting in config.js) the React client-side compiler is used, and you can make changes and refresh the page in your browser and immediately see the change. 

When the application runs in production mode we do the compilation step at startup only. You should only run production mode on your development box when testing for a release.

#### Client-side scripts

In addition to the React components we have several client-side scripts, providing support services such as ajax requests, a client-side javascript-api to the server-side rest API's, and a few other bells and whistles.

There is simple support for some of the commonly used jquery capabilities, but we _DO NOT_ import jquery and we _WILL NOT_ import jquery. Jquery is far too fat and bloated to be used on a mobile site where every byte counts.

If you need some specific javascript capabilities that we don't currently support, please discuss it with the team - _DO NOT_ import 3rd party scripts without consultation.

We currently import 3rd party scripts for three things only:

1. Analytics (Google)
2. Video (jsw player)
3. Maps (Google)

Scripts for Video and Maps are loaded at the last possible second by rendering into an iframe, to defer heavy 3rd-party script loading until we absolutely must load them.

#### Internationalisation & Localisation / i18n & l10n

The application is internationalised, and currently localised to English and Arabic.

For the design of the web-site (and therefore for the CSS), supporting a left-to-right language (English) and a right-to-left language (Arabic) means that we have to separate out styling by directionality. The project includes specific RTL and LTR stylesheet variants to support this.

The localisations are provided as js files in the `/conf/i18n/` directory. At _startup-time_ (for both production and debug modes) these files are used to generate client side js objects that can be used to insert translations into the UI. Simple pluralisation support is available. 

To use translations in jsx code within a React component you need only reference them, like this:

    <div id="some_component">
      <h1>{i18n.site.title}</h1>
    </div>

#### Icons

We are using a custom icon font for all application icons (but not for the logo). It works just like font-awesome, but is a much smaller font file because it only includes the icons we need.

### Configuration

When configuring your development box you can create a "personal" configuration file to override just those parts of the main configuration that apply to your local setup, for example the connection strings and ports for elastic and mongo. 

If you want to bind your node process to a port number below 1024 you will need to sudo (or be root) so you should name your config file `root-config.js` and place it in the project root.

*Please do not check in your personal config* because it will almost certainly conflict with someone else's.

##### debug mode vs production mode

There are two operational modes for the application - 'debug' and 'production'. These are set in `config.js` and can be overridden in your local `<username>-config.js` file.

'Debug' mode exposes the javascript, jsx (react components) and css files to your browser exactly as they are in your /public directory. This means you can directly edit those files and refresh to see the changes. It also means that the browser must request each file separately, making a very large number of network round-trips.

There is no external "build" step for this application. We do not use grunt or gulp or make or any such tool. Instead, 'production' mode does some work at start-up time:

- Compiles the React components to pure js, merges them into a single file for better compression and to minimise network round-trips
- Collects CSS files into several bundles specific to each browser and language configuration (e.g. small-right-to-left, large-left-to-right) so that for any given browser configuration there is only _one_ css file to download. 
- Collects JS files and merges them into a single file for better compression and to minimuse network round-trips
- The resulting js, jsx, and CSS files are given _permanently cacheable_ names - that is, they are [content-addressable](http://en.wikipedia.org/wiki/Content-addressable_storage), and very long expires headers, so that client browsers and caching proxies can _permanently_ cache these files.

It is also worth noting that we have taken great care to ensure that static files and images can be served from different domains, so that we can easily map their urls to a CDN. The application config files specify the domains for static and image resources in the 'urls' sub-section of the config.

### Sessions

We have long-lived sessions. They use encrypted cookies as the key to session objects stored in mongodb. The user associated with the session is automatically retrieved for all requests, populating the req object with a user
(as defined by /lib/models/user.js).

The application supports social login via Facebook, LinkedIn, Twitter, and potentially others in future. For this we use the excellent [passport.js](http://passportjs.org/) module.

For social login to work correctly for you during development you can either:

* Register your own applications at Twitter, Facebook and LinkedIn, or
* Set your machine up to think that it is www.maydan.qa

I highly recommend the 2nd approach.

Configure your /etc/hosts file to map your local ip (or loopback) to *.maydan.qa, e.g.:

    127.0.0.1 www.maydan.qa
    127.0.0.1 images.maydan.qa
    127.0.0.1 static.maydan.qa

There is one additional address you may want to map, which is the address of the editorial system from which we are pulling content:

    137.135.66.208 rb.maydanqatar.com

### Ingest

To populate the site with data we have a separate process, built on the exact same technology stack and sharing the project source code, called "ingest.js". It can be run from within the same MaydanQatar project by invoking `node ingest`.

It will pull content from the afore-mentioned rb.maydanqatar.com and populate your ElasticSearch. It will also place some static content (images) on disk, in the location described by your configuration file in the "filesystem" section.

The ingest application polls the editorial system looking for new content on a 15 second schedule. You can leave it running if you want to continuously get new content, or just run it from time to time. Fair warning: if you start up with an empty elasticsearch index it will pull *everything* ever published. Currently that isn't really a lot, but over time it will increase dramatically.

## Getting Started (Environment / Deployment)

Pre-requisites (correct @ 27/05/2014):

* Install Node v0.10.20 / npm 1.3.11 (you may want to use [nvm](https://github.com/creationix/nvm) for this)
* Install MongoDB v2.4.10
* Install ElasticSearch v0.90.13

Make sure you have access to the MaydanQatar project on BitBucket (presumably you do, since you are reading this), but you will want to make sure that your SSH key is uploaded so that npm install's work smoothly.

Clone the MaydanQatar project from BitBucket:

    git clone git@bitbucket.org:kv-development/maydanqatar.git mq

Install the dependencies:

    cd mq
    npm install

Set your local machine up to believe itself to _be_ maydan.qa. See the "sessions" section above, specifically with regard to updating your hosts file.

Create a local configuration for yourself, so that you can override the default config settings. The default config file is `config.js` in the root of the project. You can create a "personal" config file that overrides just the parts of the default config that you care about.

To do this, create a file named <username>-config.js in the root of the project. If you intend to run node on a port below 1024 (e.g. port 80), and you are running a unix OS you'll need to call the file root-config.js. Make sure that there is an entry in .gitignore matching your new config file's name so that you _do not check this file in to BitBucket, as you will stomp over other people's configs_. Override the config properties you care about, e.g. perhaps:

- the port number, 
- the "mode" (you want debug mode!) 
- the configuration of elastic and mongo
- the location of the local storage (repository)

Run the ingest to populate elasticsearch with some data:

    node ingest

Run the app... on unix binding to port 1024 or lower:

    sudo node app

... or on windows, or unix binding a higher port number:

    node app

You should see no errors in your terminal. Browse the site using Google Chrome, be sure to register using an email address or social auth and play with all the features. You should still see no errors in your terminal.

## Getting Started (Development)

The application launched by `node app` is largely a typical node-express application. There are a handful of differences that may be worth a short description:

1. Node Cluster
2. NewsPad
3. /lib/plugins
4. index.hjs and React.js
5. client-side routing
6. client-side api

### Node Cluster

We use [cluster](http://nodejs.org/api/cluster.html) so that we can take advantage of multiple cpu cores.

In `app.js` we have a conditional statement that looks like this:

    if (cluster.isMaster){
        // ... launch and manage workers
    } else {
        // ... run the actual application
    }

The process you launch _is_ the master. The master process will launch and manage a bunch of child-processes (workers), each of which enters the else branch and runs its own separate copy of the application.

You cannot easily debug a clustered process because you will likely connect to the master which isn't running the majority of the application code so you'll never hit your break-points.

### NewsPad

NewsPad is the name of an internal kv initiative to develop a platform for mobile and web-apps using a plugin architecture. We have borrowed and modified much of that code to suit our needs in this project.

The files in `/lib/core`, particularly `newspad.js`, embody the code that would typically be found in app.js in a "normal" express application: setting up the view engine, initialising the `app` object, binding connect middleware and express routes, connecting to databases, etc., etc.

In other words, `newspad.js` sets up and initialises almost everything that the application needs. 

Before doing any initialisation, the newspad object sets itself up as an eventdispatcher and during the initialisation process dispatches quite fine-grained events so that listeners have an opportunity to do additional set up work.

A complete list of events can be generated by adding the following code to app.js immediately following the line that begins `var newspad = ...`:

    newspad.on(/.*/, function(name){
      console.log(name);
    });

And if you wish to know the parameters to the events:

    newspad.on(/.*/, function(){
      console.log(arguments);
    });

The main `app.js` file uses these events to do additional application-specific tasks during initialisation, e.g. registering connect middleware's to set CORS and cache-control headers, and binding application-specific routes.

### /lib/plugins

As previously mentioned, the NewsPad initiative uses a system of plugins to compose functionality into an application. 

In the MaydanQatar project we are not using the plugin functionality except as a way to bootstrap some components. We will slowly migrate away from the /lib/plugin/ folder structure and move towards a more typical express-like app structure.

The important things to be aware of are:

* plugins are registered in /conf/plugin_defs.js
* plugins expose a few callback methods that the framework invokes during initialisation, the most important being `init(opts)`
* plugins receive the application configuration, the eventbus, a connection to mongoose, and the newspad `service` object in the `opts` object passed to `init`.
* plugins can register with the eventbus for any events they want to listen to.

### index.hjs and React.js

There is only one server-side template of any significance: `index.hjs`.

The express routes that map urls to `index.hjs` can be found in /routes/common.js

`index.hjs` renders a bootstrapping page that does the following things:

1. detects change in window size/orientation and loads/unloads css to achieve a "responsive design" without using media queries (because media queries always load all css, which is wasteful).
2. loads static javascript resources (very efficiently when run in production mode) and bootstraps the client scripts via `public/js/application.js` (which creates a local `app` object)
3. writes a sanitised "user" object into local script scope, attached to the `app` object
4. loads React jsx components (again, efficiently in production mode) and bootstraps the client-side application `public/jsx/pages/index.jsx`.

### Client-side application and routing

MaydanQatar is a single page client-side web application, populated with data from an API provided by the node server, served as JSON over HTTP. The application bootstraps when the user first arrives at a url on the maydan.qa domain by setting up a javascript object called `app` in the global scope.

You can explore the "live" app object in Google Chrome's developer console like this:

    > window.app
    Object {on: function, off: function, trigger: function, hasClass: function, addClass: function…}

The `app` object provides some functionality that will be familiar to jquery users in the form of the `$` object:

* Element lookup functions (e.g. `$('.myclass')` or `$('#myid')`) 
* Event-listening and triggering functionality: `on`, `off`, `trigger`, e.g. app.on('ready', function(ev, data){ ... }); app.trigger('ready', data)
* Some handy functional programming constructs: `each`, `map`, `reduce`, `find`, `any`, `filter` (so you can e.g. $('.myclass').each(function(el){ ... });
* ajax support via $.ajax

*Important*: Please be aware that while we are using the familiar `$` and some of the constructs are similar to jquery we are *NOT* using jquery!

#### index.jsx

The React application is bootstrapped by `public/jsx/pages/index.jsx` when the application's 'ready' event is fired. The `index.jsx` file itself is not very interesting. Most of the real work takes place in `/public/jsx/components/site.jsx`.

The most interesting method in site.jsx is `handleRouteChange`, which coordinates what the local application does in response to the browser navigating to a particular url...

#### Routing

In order to provide familiar navigation using back and forward browser buttons, bookmarkable and shareable urls, etc., the client application uses url hash fragments to denote significant "places" within the application. 

The important thing to realise with these urls is that everything after the hash (#) is _not_ sent to the server but _is_ part of the browser's history state.

For example:

* http://maydan.qa/#/akhbari
* http://maydan.qa/#/article-search/test*/

For these urls to "work" when shared or bookmarked, we have to register something to expect and respond to them, just like we do when we register routes on the server-side to respond to incoming http requests.

These "client-side routes" are set up by code in the file `/public/js/routing.js`. These routes have several properties, but the really interesting one is the url which starts from the #, e.g. '#/akhbari/'.

Whenever the browser navigates to a url matching `/#/akhbari/` a 'route' event is fired, specifying the route that we are navigating away from, and the route that we are navigating to.

***These events are listened to by the `Site` component in `site.jsx`'s `handleRouteChange` method, making it the primary entry-point for handling just about anything of any significance in the client app!***

The typical response to a route change is to unload the previous route then load new data to display corresponding to the new route.

If we take the example of navigating from "/#/search/" to "/#/akhbari/", we would first unload the search page (which just hides the search sub-header), then we would load the akhbari page (which loads some data via the api and displays it).

The set of routes defined in the application can be explored live in the Chrome developer console like this:

    > app.routes
    Object {arabic: Object, english: Object, akhbari: Object, medani: Object, noauth_medani: Object…}

Routes also have a "go" method, so in code you can get a route and then cause the application to navigate to it by invoking 'go()'. You can try this in Chrome's dev console:

    > app.routes.akhbari.go();
    > app.routes.search.go();

Client-side routes can also be parameterised. Examples include the tag-hub urls and article/event search urls, which have the following patterns:

* /#/tags/content/:type/:id/:label/
* /#/tags/discuss/:type/:id/:label/
* /#/article-search/:q/
* /#/event-search/:q/

You can also try these out live in the Chrome developer console:

    > app.routes.article_search.go([{ name:'q', value:'test' }]);

Which will take you to `/#/article-search/test/`

One last thing about routes: the application object `window.app` "knows" which route is currently active, so it is possible to query that using window.app.currentRoute

    > window.app.currentRoute
    Object {route: Object, params: Array[0]}
      params: Array[0]
      length: 0
      q: "qatar*"
    ...

#### client side api.js

Most of the work of communicating with the server-side api is encapsulated in a single place on the client in `/public/js/api.js`. 

It uses the `public/js/ajax.js` library to communicate with the server.

Some support for "infinite scroll" is provided via the `more` function. This is used extensively throughout the application, e.g. to load data for the akhbari, tag-hub, and search results.
