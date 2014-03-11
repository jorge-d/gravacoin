var path = require('path')
  , rootPath = path.normalize(__dirname + '/..')

module.exports = {
  development: {
    db: 'mongodb://localhost/noobjs_dev',
    root: rootPath,
    app: {
      name: 'Nodejs Gravacoin'
    }
  },
  test: {
    db: 'mongodb://localhost/noobjs_test',
    root: rootPath,
    app: {
      name: 'Nodejs Gravatest'
    }
  },
  production: {}
}
