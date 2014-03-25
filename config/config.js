var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')

module.exports = {
  development: {
    db: {
      url: 'mongodb://localhost/noobjs_dev',
      debug: true
    },
    root: rootPath,
    app: {
      name: 'Gravacoin'
    },
    send_emails: true,
    port: 3000
  },
  test: {
    db: {
      url: 'mongodb://localhost/noobjs_test',
      debug: false
    },
    root: rootPath,
    app: {
      name: 'Gravatest'
    },
    send_emails: false,
    port: 4004
  },
  production: {
    db: {
      url: 'mongodb://localhost/noobjs_production',
      debug: false
    },
    root: rootPath,
    app: {
      name: 'Gravacoin'
    },
    send_emails: true,
    port: 8080
  }
}
