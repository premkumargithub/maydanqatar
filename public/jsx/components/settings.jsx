/** @jsx React.DOM */


var Settings = React.createClass({
  render : function() {
    return (
      <div className="Settings">
        <div>
        <div className="qna-logo"></div>
        <span>
        {i18n.settings.client_statement}
        </span>
        </div>
        <div>
        <div className="kv-logo"></div>
        <span>
        {i18n.settings.kv_statement}
        </span>
        </div>
        <div className="feedback">
          <Route route={app.routes.feedback} css="light_button">
            <span>{i18n.settings.feedback}</span>
          </Route>
        </div>
      </div>
    );
  }
});

