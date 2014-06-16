/** @jsx React.DOM */
var ContentDetail = React.createClass({
  getInitialState:function(){
    return {
      url: app.getUnhashedUrl()
    }
  },
  componentDidMount:function(){
    this.props.showFooter(
      <footer id="toolbar">
        <Collect id={this.props.item.id} type={this.props.type}/>
        <TextToSpeech id={this.props.item.id}/>
        <ShareButton
          type={this.props.type}
          url={this.state.url}
          text={this.props.item.title}/>
      </footer>
    );
  },
  createCommentContext: function(){
    var result = [];
    if (!!this.props.item){
      if (!!this.props.item.tags){
        if (!!this.props.item.tags.special)
          result = result.concat(this.props.item.tags.special);
        if (!!this.props.item.tags.source)
          result = result.concat(this.props.item.tags.source);
        if (!!this.props.item.tags.topic)
          result = result.concat(this.props.item.tags.topic);
      }
      if (!!this.props.item.venue)
        result = result.concat(this.props.item.venue);
    }
    return result;
  },
  render:function(){
    var css = 'full_content ' + this.props.type;
    var comment_context = this.createCommentContext();
		return (
			<article className={css}>
				<Head
					title={this.props.item.title}
					schedule={this.props.item.schedule}
					venue={this.props.item.venue}/>

				<MetaContent
					id={this.props.item.id}
					type={this.props.type}
					published={this.props.item.published}
					comment_count={this.props.item.comment_count}
					tags={this.props.item.tags}/>

				<Body
				 	summary={this.props.item.summary}
				 	source={this.props.item.article_source}
					body={this.props.item.body}
					media={this.props.item.media}
					video={this.props.item.video}
					location={this.props.item.venue} />

				<section id="share">
					<ShareBox
						id={this.props.item.id}
						type={this.props.type}
						url={this.state.url}
						text={this.props.item.title}/>
				</section>

				<section className="widget" id="comments">
					<CommentBox
					  url={this.state.url}
					  context={comment_context} />
				</section>

				<section id="recommended">
					<Recommendations id={this.props.item.id}/>
				</section>

			</article>
		);
	}
});

var Head = React.createClass({
	render:function(){
		if (this.props.schedule){
			return (
				<div>
					<Title title={this.props.title}/>
					<CalendarThumbnail date={this.props.schedule.start_date}/>
					<Tag type="venue" tag={this.props.venue} />
					<DateRange from={this.props.schedule.start_date} to={this.props.schedule.end_date} />
 					<TimeRange from={this.props.schedule.start_date} to={this.props.schedule.end_date} />
				</div>
			);
		} else {
			return <Title title={this.props.title}/>
		}
	}
});

var Title = React.createClass({
  render:function(){
  	return (
  		<header>
  			<h1>{this.props.title}</h1>
  		</header>
  	);
  }
});

var MetaContent = React.createClass({
	render:function(){
		return (
			<section id="meta">
				<Collect id={this.props.id} type={this.props.type}/>
				<div>
					<RelativeDate date={this.props.published} />
        	<span className="comments">
        		<i className="ic icon-comment"></i>
        		{this.props.comment_count}
        	</span>
        </div>
				<Tags
				  special={this.props.tags.special}
        	topic={this.props.tags.topic}
        	source={this.props.tags.source}/>
			</section>
		);
	}
});

var ShareButton = React.createClass({
  share:function() {
    var that = this;
    app.platformApi.isNative(function(isNative) {
      if (isNative) {
        if (window.plugins &&  window.plugins.knowledgeview) {
          window.plugins.knowledgeview.sharing.share(that.props.text, that.props.text, null, that.props.url);
        } else {
          plugins.socialsharing.share(that.props.text, that.props.text, null, that.props.url)
        }
      }
      else {
        var sharebox = that.refs.sharebox.getDOMNode();
        var display = sharebox.style.display;
        sharebox.style.display = (display == 'none') ? '' : 'none';
      }
    });
  },
  render:function(){
    var text = this.props.type === 'event' ?
      i18n.content.share.event : i18n.content.share.article;
    var shareBoxStyle = {display : 'none' };
    return (
        <div className="sharecontainer" >
          <Button
            id="sharebutton"
            icon="ic icon-share"
            text={text}
            action={this.share}/>
          <div ref="sharebox" className="sharebox-popup" style={shareBoxStyle}>
            <ShareBox url={this.props.url} text={this.props.text} />
          </div>
       </div>
    );
  }
});

var TextToSpeech = React.createClass({
  readAloud:function(){
    // TODO: actually read
    console.log('read aloud %s', this.props.id);
  },
  render:function(){
    return (
      <Button
        id="texttospeech"
        icon="ic icon-tts"
        text={i18n.content.read_aloud}
        action={this.readAloud}/>
    );
  }
});

var Collect = React.createClass({
	collect:function(){
	  // TODO: actually bookmark
	  console.log('bookmark %s', this.props.id);
	},
	render:function(){
		return (this.props.type === 'event') ?
  		<AddToCalendar id={this.props.id} action={this.collect}/>:
  		<Bookmark id={this.props.id} action={this.collect}/>;
  }
});

var Bookmark = React.createClass({
  render:function(){
		return (
		  <Button
		 id="bookmark"
        icon="ic icon-bookmark-outline-thin"
        text={i18n.content.bookmark}
        action={this.props.action}/>
		);
	}
});

var AddToCalendar = React.createClass({
  render:function(){
		return (
		  <Button id="bookmark"
		    icon="ic icon-calendar"
		    text={i18n.content.add_to_calendar}
		    action={this.props.action}/>
		);
	}
});

var ReadMore = React.createClass({
  openFullArticle: function() {
    var url = this.props.source; 
    var windowName = '_target';
    var windowSettings = 'location=no,status=no,menubar=no,transitionstyle=fliphorizontal,width=900,height=1000,closebuttoncaption='+i18n.nav.back;
    var res = window.app.platformApi.openWindow(url,windowName,windowSettings);
  },
  render: function(){
  	var icon = "ic icon-rss-"+app.direction;
    return ( 
      <span className="button link tag rss" onClick={this.openFullArticle}>
				<span className="text"><i className={icon}></i><span>{i18n.content.read_full}</span></span>
			</span>
    );
  }
});

var Body = React.createClass({
	getMedia: function( media, video ){
	  var medias = [];
	  var slideInterval=10000;
		if (video){
		  // disable sliding
			slideInterval = undefined;
		  // add a card for the video
			medias.push(<Video key="video" url={video.url}/>);
		}
		if (media && media.length > 0){
			$(media).each(function(m){
	  	  medias.push(<Media key={m.id} id={m.id} modified={m.modified}/>);
		  });
		}
		if (medias.length > 0) {
      return(
        <Slider className="media" slideInterval={slideInterval}>
          {medias}
        </Slider>
      );
    } else {
      return undefined;
    }
	},
	render:function(){
	  var media = this.getMedia( this.props.media, this.props.video );

		var body = this.props.body.map(function(paragraph, index){
			return (<p key={'_'+index}>{paragraph}</p>);
		});

		var map = (this.props.location) ?
			<Map location={this.props.location} /> : <div/>;
			
		var readMore = (this.props.source) ? 
		  <ReadMore source={this.props.source} /> : undefined;
		  
		return (
			<section id="body">
				{ window.__mode.size == 'small' ? media : undefined }
				<p className="summary">{this.props.summary}</p>
				{ window.__mode.size == 'small' ? undefined : media }
				<div>
					{body}
				</div>
				{readMore}
				{map}
			</section>
		);
	}
});

var Media = React.createClass({
	render:function(){
		var src = app.getImageUrl(this.props.id, this.props.modified, 640, 480);
		return (<Image src={src}/>);
	}
});