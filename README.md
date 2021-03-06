# Gravacoin
[![Donate](http://gravaco.in/doge/458641ed4b2725b16edbf0192ca0b2f2.png)](http://gravaco.in/458641ed4b2725b16edbf0192ca0b2f2)
[![Donate](http://gravaco.in/btc/458641ed4b2725b16edbf0192ca0b2f2.png)](http://gravaco.in/458641ed4b2725b16edbf0192ca0b2f2)

[Gravacoin](http://gravaco.in) is a free open-source service to share your crypto-addresses with the world

## Documentation

Please check the [wiki pages](http://github.com/jorge-d/gravacoin/wiki/_pages).

## Install

Checkout the repo and run `npm install`.

The application requires a running **mongodb** and was developped using **Node v0.10.26**.

To get the mailer working (currently using Mailjet), set the following env variables before runing the application.

```shell
export MAILJET_API_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXX
export MAILJET_SECRET_KEY=XXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

To run the application in development mode:
```shell
$ gulp
```

To run the production mode:
```shell
NODE_ENV=production node app.js
```
## Test

To run the test suite:

```shell
$ mocha
```

## Contributing

1. Fork it.
2. Create a branch (`git checkout -b my_markup`)
3. Commit your changes (`git commit -am "Added Snarkdown"`)
4. Push to the branch (`git push origin my_markup`)
5. Open a Pull Request
6. Enjoy a refreshing Diet Coke and wait
