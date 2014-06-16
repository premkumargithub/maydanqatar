module.exports = function(){
  return {
    app: {
      port: 80,
      mode: 'debug',
      pageSize: 15,
      scrollLimit: 200,
      ingest_interval: 5000
    },
    domain: "maydan.qa",
    urls: {
      www: "http://maydan.qa",
      image: "http://images.maydan.qa",
      static: "http://static.maydan.qa"
    },
    rb: {
      url: 'http://rb.maydanqatar.com/newsbrowser/',
      username: 'mqd-node',
      password: 'mqd'
    },
    filesystem: {
      temp: "/tmp/kv/data/temp/"
    }
  };
}
