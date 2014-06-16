/** @jsx React.DOM */

var TRANSITION_OUT_DURATION = 250;

var Site = React.createClass({

  getInitialState: function(){
    return {
      topper: app.authenticated ? <WelcomeBack/> : <Welcome/>,
      where: undefined,
      height: window.innerHeight,
      mode: window.__mode,
      content: <NoContent/>,
      footer: <span/>,
      menuVisible: false,
      subheader:null,
      startTopper:null,
      startHeader:null
    }
  },

  onRoute : function(ev) {
    this.handleRouteChange(ev.detail.from, ev.detail.to);
  },
  
  componentWillUnmount: function() {
    app.off('route', this.onRoute);
  },

  componentWillMount: function() {
    var that = this;
    app.on('route', this.onRoute);

    that.previous_size = window.__mode.size;
    that.previous_orientation = window.__mode.orientation;
    window.on('resize', function(ev){
      // defer to make sure other resize handlers
      // complete first.
      $.defer(function(){
        if (that.previous_size !== window.__mode.size){
          // unfortunately we need to reload for two reasons:
          // 1) React doesn't realise that anything has changed
          //    because we're cheating and making some decisions
          //    based on external values instead of props/state.
          //    Ideally we should fix that.
          // 2) We are dynamically loading/unloading css files, and
          //    chrome doesn't do a good job of re-rendering and leaves
          //    some elements dangling in strange places. Not much we
          //    can do to fix that(?)
          window.location.reload();
        }
      });
    });

    if (app.currentRoute !== this.state.where)
      this.handleRouteChange(this.state.where, app.currentRoute);

    if (this.state.menuVisible) {
      $.defer(function(){
        that.handleToggleMenu();
      });
    }
  },

  navigate:function(route){
    this.setState({
      menuVisible:false
    });
    route.go();
  },

  handleRouteChange:function(from, to){
    if (from && from.route) {
      switch (from.route.id) {
        case 'search':
        case 'combo_search':
        case 'article_search':
        case 'event_search':
        case 'share_to_user':
          this.hideSubHeader();
          break;
        case 'start':
          this.hideStartTopper();
          break;
        case 'tag_content':
        case 'tag_discuss':
        case 'tag_followers':
          this.hideSubHeader();
          break;
        case 'article':
        case 'event':
          this.hideFooter();
          break;
      }
    }

    if (to) {
      switch (to.route.id) {
        case 'akhbari':
          this.loadAkhbari(to);
          break; 
        case 'messages':
          this.loadMessages(to);
          break;
        case 'article':
          this.loadArticle(to);
          break;
        case 'article_search':
          this.showSearchResultSubHeader(to.params.q);
          this.loadArticleSearchResult(to.params.q);
          break;
        case 'event':
          this.loadEvent(to);
          break;
        case 'event_search':
          this.showSearchResultSubHeader(to.params.q);
          this.loadEventSearchResult(to.params.q);
          break;
        case 'logout':
          this.logout();
          break;
        case 'medani':
          this.loadMedani(to);
          break;
        case 'profile':
          this.loadMedani(to);
          break;
        case 'search':
          this.loadAkhbari(to);
          this.showSearchSubHeader();
          break;
        case 'combo_search':
          this.loadComboSearchResult(to.params.q);
          this.showSearchSubHeader(to.params.q);
          break;
        case 'start':
          this.chooseTagsToFollow(to);
          break;
        case 'tag_content':
          this.loadTagContent(to);
          this.showTagHubSubHeader(to, '?');
          break;
        case 'tag_discuss':
          this.loadTagForum(to);
          this.showTagHubSubHeader(to, '?');
          break;
        case 'tag_followers':
          this.loadTagFollowers(to);
          this.showTagHubSubHeader(to, '?');
          break;
        case 'tour_video':
          this.loadTourVideo(from);
          break;
        case 'settings':
          this.setState({
            where:to,
            content: <Settings />
          });
          break;
        case 'login':
        case 'register':
        case 'noauth_medani':
          this.ensureTopperVisible();
          break;
        case 'reset_password':
          this.loadResetPassword(to);
          break;
        case 'confirm':
          this.loadRegistrationConfirmation(to);
          break;
        case 'share_to_user':
          this.loadToMaydanUser(to);
          break;
        case 'share_message':
          this.loadToMadaniUser(to);
          break;
        case 'compose_message':
          this.loadComposeMessage(to);
          break;
        case 'show_conversation':
          this.loadConversation(to);
          break;
        default:
          console.log("unhandled route in site.jsx: %s - %s", to.route.id, to.route.url);
          // do nothing - we're handling routes in other places too, e.g.
          // the site_header's Topper, so maybe this route was handled there
      }
    }
  },

  loadAkhbari:function(to){
    var cursor = new app.api.Cursor({
      rangeSize: app.config.paging.size,
      load: function(range, callback){
        app.api.akhbari.load({
          range: range,
          ok: callback
        });
      }
    });
    var adapter = function(item){
      return (<PreviewBox key={item.id} item={item} />);
    };
    this.setState({
      where:to,
      content: <InfiniteScroller key={'_' + Date.now()} id="articles" adapter={adapter} cursor={cursor} />
    });
  },

  loadArticle:function(to){
    var that = this;
    var load = function(callback){
      app.api.articles.load(to.params.id, {
        ok: function(data){
          callback(<ContentDetail
            item={data} type="article"
            showFooter={that.showFooter}
            hideFooter={that.hideFooter}/>);
        },
        fail: function(){
          callback(<NoContent/>);
        }
      });
    };
    this.setState({
      where:to,
      content: <Scroller init={load}/>
    });
  },

  ensureTopperVisible:function(){
    Utils.scrollToElement('root');
  },

  loadEvent:function(to){
    var that = this;
    var load = function(callback){
      app.api.events.load(to.params.id, {
        ok: function(data){
          callback(<ContentDetail
            item={data} type="event"
            showFooter={that.showFooter}
            hideFooter={that.hideFooter}/>);
        },
        fail: function(){
          callback(<NoContent/>);
        }
      });
    };
    this.setState({
      where:to,
      content: <Scroller init={load}/>
    });
  },

  loadMedani:function(to){
    var content = (
      <Scroller>
        <Medani key={"medani-"+to.params.id} id={to.params.id}/>
      </Scroller>
    );
    this.setState({
      where:to,
      content: content
    });
  },

  loadMessages:function(to){
    var that = this;
    var load = function(callback){
      app.api.messages.loadInbox({
        ok: function(data){
          callback(<UserMessageInbox messages={data}/>);
        },
        fail: function(){
        }
      });
    };
    this.setState({
      where:to,
      content: <Scroller key="message_inbox" init={load}/>
    });
  },

  loadToMaydanUser:function(to){
    var that = this;
    var content = function(callback){
    var id = to.params.id;
    app.api.articles.load(to.params.id, {
      ok: function(data){
        callback(<ShareArticle data={data} id={id}/>);
      },
      fail: function(){
      }
    });
    };
    this.setState({
      where:to,
      content: <Scroller key="share_to_user" init={content}/>
    });
  },

  loadToMadaniUser: function(to){
    var that = this;
    var me = !to.params.id;
    var content = function(callback){
    app.api.medani.load({
      ok: function(data){
        callback(<ShareMessage user={data} me={me} recipientId={to.params.id}/>);
      },
      fail: function(){
      }
    }, '');
    };
    this.setState({
      where:to,
      content: <Scroller key="share_message" init={content}/>
    });
  },

   loadComposeMessage: function(to){
    var me = !to.params.id;
    var content = function(callback){
      app.api.medani.load({
        ok: function(data){
          callback(<ComposeMessage user={data} me={me} />);
        },
        fail: function(){
        }
      }, '');
    };
    this.setState({
      where:to,
      content: <Scroller key="compose_message" init={content}/>
    });
  },

  loadConversation: function(to){
    var threadId = to.params.id;
    var content = function(callback){
      app.api.messages.load(threadId,{
        ok: function(data){
          callback(<ConversationBox thread={data} />);
        },
        fail: function(){
        }
      }, '');
    };
    this.setState({
      where:to,
      content: <Scroller key="show_conversation" init={content}/>
    });
  },
 
  loadComboSearchResult:function(q){
    var that = this;
    var load = function(callback){
      app.api.search.combo(q, {
        ok: function(data){
          callback(<ComboSearchResult
            q={q} tags={data.tags}
            articles={data.articles}
            events={data.events}/>);
        },
        fail: function(data, msg){
          console.log('error', data, msg);
          callback(<Error/>);
        }
      });
    };
    this.setState({
      content: <Scroller key={q} init={load}/>
    });
  },

  loadArticleSearchResult: function(q){
    this.loadSimpleSearchResult(q, 'article');
  },

  loadEventSearchResult: function(q){
    this.loadSimpleSearchResult(q, 'event');
  },

  loadSimpleSearchResult:function(q, type){
    var cursor = new app.api.Cursor({
      rangeSize: app.config.paging.size,
      load: function(range, callback){
        app.api.search.simple(q, type, {
          range: range,
          ok: callback
        });
      }
    });
    var adapter = function(item){
      return (<PreviewBox key={item.id} item={item} />);
    };
    this.setState({
      content: <InfiniteScroller id="articles" adapter={adapter} cursor={cursor} />
    });
  },

  loadTagContent:function(to){
    var cursor = new app.api.Cursor({
      rangeSize: app.config.paging.size,
      load: function(range, callback){
        app.api.tags.content({
          scheme: to.params.type,
          id: to.params.id
        },{
          range: range,
          ok: callback
        });
      }
    });
    var adapter = function(item){
      return (<PreviewBox key={item.id} item={item} />);
    };
    this.setState({
      where:to,
      content: <InfiniteScroller id="articles" adapter={adapter} cursor={cursor} />
    });
  },

  loadTagFollowers:function(to){
    var cursor = new app.api.Cursor({
      rangeSize: app.config.paging.size,
      load: function(range, callback){
        app.api.tags.followers({
          scheme: to.params.type,
          id: to.params.id,
          label: to.params.label
        },{
          range: range,
          ok: callback
        });
      }
    });
    var adapter = function(item){
      return (<PreviewBox key={item.id} item={item} />);
    };
    this.setState({
      where:to,
      content: <Followers cursor={cursor}/>
    });
  },

  loadTagForum:function(to){
    var that = this;
    var tag = {
      type:to.params.type,
      id:to.params.id,
      label:to.params.label
    };
    var url = app.getUnhashedUrl();
    this.setState({
      where:to,
      content: <Scroller><CommentBox url={url} context={[tag]}/></Scroller>
    });
  },

  loadTourVideo:function(back){
    var that = this;
    var close = function(){
      that.setState({
        lightbox:undefined
      });
      if (back && back.route)
        back.route.go();
    };

    var vwd = 480; // the video is 480px wide?
    var vid = window.innerWidth-30 < vwd ? window.innerWidth-30 : vwd;
    var h = window.innerHeight-60;
    var c = window.innerWidth/2;
    var w = vid/2;
    var style = {
      position:'absolute',
      height: h,
      width: vid,
      top:30,
      left: c-w,
      bottom:30,
      right:c-w,
      textAlign: 'center'
    };
    var url = app.config.tour_video_url[app.language];
    this.setState({
      lightbox: (
        <LightBox style={style} close={close}>
          <Video url={url} aspectw="9" aspecth="16"/>
        </LightBox>
      )
    });
  },
  
  loadResetPassword:function(to){
    this.setState({
      content: <ResetPassword email={to.params.email} time={to.params.time} token={to.params.token}/>
    });
  },
  
  loadRegistrationConfirmation:function(to){
    this.setState({
      content: <RegistrationConfirmation email={to.params.email} token={to.params.token}/>
    })
  },
  
  chooseTagsToFollow:function(to){
    var that = this;
    var load = function(callback){
      app.api.tags.to_follow({
        ok: function(data){
          callback(<Start data={data}/>);
        },
        fail: function(){
          callback(<NoContent/>);
        }
      });
    };
    this.setState({
      where:to,
      content: <Scroller init={load}/>,
      startTopper: <StartTopper />,
      startHeader: <StartHeader />
    });
  },

  logout: function(){
    app.api.auth.logout({
      ok:function(){
        app.trigger('signed_out');
        app.routes.akhbari.go();
      },
      fail:function(e){
        console.log(e);
      }
    });
  },

  hideSubHeader:function(){
    this.setState({
      activeSub:null,
      subheader:null
    });
  },

  showSearchSubHeader:function(q){
    this.setState({
      activeSub:'search',
      subheader:(
        <div className="search_header">
          <SearchForm q={q} search={this.loadComboSearchResult}/>
        </div>
      )
    });
  },

  showSearchResultSubHeader:function(q){
    var cancel = function(){
      app.routes.combo_search.go([{ name:'q', value:q }]);
    };
    this.setState({
      activeSub:'search',
      subheader:(
        <div className="search_header">
          <SearchCriteria q={q} cancel={cancel}/>
        </div>
      )
    });
  },

  showTagHubSubHeader:function(to, followers){
    var tag = {
      type: to.params.type,
      id: to.params.id,
      label: to.params.label
    };
    var css = "taghub " + tag.type;
    var params = [{
      name:'type', value:tag.type
    },{
      name:'id', value:tag.id
    },{
      name:'label', value:tag.label
    }];
    var content_route = function(){
      app.routes.tag_content.go(params);
    }
    var discuss_route = function(){
      app.routes.tag_discuss.go(params);
    }
    var followers_route = function(){
      app.routes.tag_followers.go(params);
    };
    var followers_label = i18n.nav.taghub.followers(followers);
    var maybe_follow = (app.authenticated) ?
        <FollowUnfollow tag={tag}/> : <span/>;

    this.setState({
      activeSub:'tag_hub',
      subheader:(
        <div className={css}>
          <Tag tag={tag}/>
          {maybe_follow}
          <ButtonBar>
            <ButtonBarButton
              active={app.routes.tag_content.active}
              label={i18n.nav.taghub.content}
              action={content_route}/>
            <ButtonBarButton
              active={app.routes.tag_followers.active}
              label={followers_label}
              action={followers_route}/>
            <ButtonBarButton
              active={app.routes.tag_discuss.active}
              label={i18n.nav.taghub.discuss}
              action={discuss_route}/>
          </ButtonBar>
        </div>
      )
    });

    if (followers === '?') {
      var that = this;
      app.api.tags.follower_count(tag, {
        ok: function(data){
          that.showTagHubSubHeader(to, data.followers);
        },
        fail: function(data){
          console.log(data);
        }
      });
    }
  },

  showFooter:function(footer){
    if (this.state.mode.size === 'small'){
      this.setState({
        footer: footer
      });
    }
  },

  hideFooter:function(){
    this.setState({
      footer: <span/>
    });
  },

  handleToggleMenu:function(){
    this.setState({
      menuVisible: !this.state.menuVisible
    });
  },

  hideStartTopper: function(){
    this.setState({
      startTopper: null,
      startHeader: null
    });
  },
  
  render:function(){
    var back = (this.state.where && this.state.where.route.level > 0);
    var title = back ? i18n.site.back : (this.state.where ? (this.state.where.route.label) : '');
    var isStart = (this.state.where && this.state.where.route.id=='start');
    var mainStyle = { height: this.state.height };

    var header = (
        <Header
          title={title}
          back={back}
          authenticated={this.props.authenticated}
          toggleMenu={this.handleToggleMenu}
          activeSub={this.state.activeSub}
          subheader={this.state.subheader}/>
      );
    var nav = null;
    if (isStart) {
      nav = <span/>
    } else {
      nav = (
        <SiteNavigation
          authenticated={this.props.authenticated}
          groups={this.props.nav_groups}
          where={this.state.where}
          go={this.navigate}
          visible={this.state.menuVisible}
          toggleMenu={this.handleToggleMenu}/>
      );
    }

    var header = (
      <div id="chrome">
        {header}
        {this.state.startHeader}
      </div>
    );

    var rootCss = this.state.subheader ? 'has_sub ' : '';
    if (this.state.where && this.state.where.route) {
      rootCss += this.state.where.route.id + '-page'
    }

    return (
      <div id="root" className={rootCss}>
        {this.state.lightbox}
        <Topper
          authenticated={this.props.authenticated}/>
        {this.state.startTopper}
        {nav}
        <div id="main" style={mainStyle}>
          {header}
          <div id="content" ref="content">
            {this.state.content}
          </div>
          {this.state.footer}
        </div>
      </div>
    );
  }

});

var NoContent = React.createClass({
  render:function(){
    // todo: needs work
    return (<div className="no_content"></div>);
  }
});

var Error = React.createClass({
  render:function(){
    // todo: needs work
    return (<div className="error"></div>);
  }
});

var ContentArea = React.createClass({
  render:function(){
    return (
      <div>
        {this.props.content}
      </div>
    );
  }
});