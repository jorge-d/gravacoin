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
      name: 'Nodejs Gravacoin'
    },
    port: 3000
  },
  test: {
    db: {
      url: 'mongodb://localhost/noobjs_test',
      debug: false
    },
    root: rootPath,
    app: {
      name: 'Nodejs Gravatest'
    },
    port: 4004
  },
  production: {}
}
