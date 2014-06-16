/** @jsx React.DOM */
var PreviewBoxes = React.createClass({
	render:function(){
		var boxes = $(this.props.data).map(function(item){
			return <PreviewBox key={item.id} item={item} />
		});
		return (
			<section id="articles">
				{boxes}
			</section>
		);
	}
});


var PreviewBox = React.createClass({
	render:function(){
		var route, thumbnail, summary, event_summary = null;
		var css = 'preview link ';
		if (this.props.item.venue) {
			css += 'event';
			route = app.routes.event;
			thumbnail = <CalendarThumbnail date={this.props.item.schedule.start_date}/>;
			event_summary = <EventSummary data={this.props.item}/>;
		} else {
			css += 'article';
			route = app.routes.article;
			if (this.props.item.media && this.props.item.media.length > 0 ){
				thumbnail = <ImageThumbnail src={this.props.item.media[0]}/>
		  } else if (this.props.item.video) {
		    var url = app.config.urls.image + '/i/video-placeholder.png';
        thumbnail = <Image src={url}/>
			} else {
				thumbnail = null;
			}
			summary = <p>{this.props.item.summary}</p>;
		}
		var smallVenueTag = (window.__mode.size == "small" && this.props.item.venue) ? this.props.item.venue : undefined;
		var params = [{ name: 'id', value: this.props.item.id }];
    return (
      <Route route={route} params={params}>
    	  <article className={css}>
    	    {thumbnail}
    	    <div>
            <h2>{this.props.item.title}</h2>
            {event_summary}
            <PreviewMeta data={this.props.item}/>
            {summary}
				  </div>
				  <Tags
				  	venue={smallVenueTag}
				    special={this.props.item["tags.special"]}
				    topic={this.props.item["tags.topic"]}
				    source={this.props.item["tags.source"]}/>
    	  </article>
    	</Route>
		);
	}
});


var EventSummary = React.createClass({
	render:function(){
		var venueTag = (window.__mode.size == "small") ? undefined : <Tag type="venue" tag={this.props.data.venue} />;
    return (
      <div className="summary">
        <DateRange from={this.props.data.schedule.start_date} to={this.props.data.schedule.end_date} />
        <TimeRange from={this.props.data.schedule.start_date} to={this.props.data.schedule.end_date} />
        {venueTag}
      </div>
    );
	}
});


var PreviewMeta = React.createClass({
	render:function(){
		return (
			<div className="meta">
				<RelativeDate date={this.props.data.published}/>
				<span className="comments"><i className="ic icon-comment"></i><span className="count">{this.props.data.commentCount}</span></span>
			</div>
		);
	}
});


var CalendarThumbnail = React.createClass({
	render:function(){
		return (
			<div className="calendar thumb">
				<div className="month">{i18n.dates.months[this.props.date.getMonth()]}</div>
				<div className="date">{this.props.date.getDate()}</div>
			</div>
		);
	}
});


var ImageThumbnail = React.createClass({
	render:function(){
		var url = app.getImageUrl(this.props.src.id, this.props.src.modified, 160, 120);
		return (
			<Image src={url}/>
		);
	}
});