$.on('ready', function(){

  (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
  (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
  m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
  })(window,document,'script','//www.google-analytics.com/analytics.js','ga');

  ga('create', 'UA-50290815-1', 'maydan.qa');

  // This is a single-page website, so tracking events are programmatically
  // generated and dispatched
  $(app).on('post-route', function(ev){
    var page = window.location.toString();
    page = page.replace('#/', '');
    ga('send', 'pageview', {
      'page': page,
      'title': window.title
    });
  });

});