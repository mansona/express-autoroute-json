[![Build Status](https://travis-ci.org/stonecircle/express-autoroute-json.svg?branch=master)](https://travis-ci.org/stonecircle/express-autoroute-json)
[![dependencies Status](https://david-dm.org/stonecircle/express-autoroute-json/status.svg)](https://david-dm.org/stonecircle/express-autoroute-json)
[![devDependencies Status](https://david-dm.org/stonecircle/express-autoroute-json/dev-status.svg)](https://david-dm.org/stonecircle/express-autoroute-json?type=dev)
[![Maintainability](https://api.codeclimate.com/v1/badges/3f269374a4293505f284/maintainability)](https://codeclimate.com/github/stonecircle/express-autoroute-json/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/3f269374a4293505f284/test_coverage)](https://codeclimate.com/github/stonecircle/express-autoroute-json/test_coverage)

# Express-Autoroute-JSON - automatically define your JSON:API backend

express-autoroute-json is a handy tool which allows you to declarativly define endpoints for [ExpressJS](https://expressjs.com/) that speak [JSON:API](https://jsonapi.org) natively. It is designed to make use of [_Convention Over Configuration_](https://en.wikipedia.org/wiki/Convention_over_configuration) and your endpoints should have Zero boilerplate code, and only contain the definition of your business logic.

## Quick-start

We have a handy [Yeaman](http://yeoman.io/) generator that will spin up a fully functioning backend for you in an instant. To get started, install yeoman globally and install the [@authmaker/generator-express](https://github.com/authmaker/generator-express) generator globally. Don't worry if you're not using [Authmaker](https://authmaker.com/), you can still use this generator to quickly spin up your app.

```sh
npm install -g yo
npm install -g @authmaker/generator-express
```

the generator **does not** generate a folder for you so create one and run the generator in that folder:

```sh
mkdir my-app-backend
cd my-app-backend
yo @authmaker/express
```

the generator will ask you a series of questions to get started, and it will also ask you for a [MongoDB connection string](https://docs.mongodb.com/manual/reference/connection-string/) and setup that database connection for you.

## Route definitions
If you have run the above quick-start steps you will have a file `server/routes/v1/example.js` that looks like this:

```javascript
const autorouteJson = require('express-autoroute-json');
const { models } = require('../../../models');

module.exports.autoroute = autorouteJson({
  model: models.example,
  resource: 'example', // this will be pluralised in the routes

  // default CRUD
  find: {},
  create: {},
  update: {},
  delete: {},
});
```

there are a few things to note about this example. Firstly this is a **fully functioning** example that will create endpoints to create, retrieve, update and delete _'example'_ resources. When you run the server it will show the following output

```sh
info: creating endpoint: /v1/examples      #find all     - GET
info: creating endpoint: /v1/examples/:id  #find by id   - GET
info: creating endpoint: /v1/examples      #create       - POST
info: creating endpoint: /v1/examples/:id  #update       - PATCH
info: creating endpoint: /v1/examples/:id  #delete       - DELETE
```

you will also notice that the endpoints are prefixed with `/v1/`. This is because express-autroute-json is based on [express-autoroute](https://github.com/stonecircle/express-autoroute) which is designed to give you a nicer way to describe your node endpoints and can auto-prefix endpoints with the folder-names they are contained in.

If you want to create a _find-only_ endpoint i.e. you don't want to allow for the creation or deletion of resources then you can just remove the corresponding create, update and delete blocks from the autoroute definition.


```javascript
const autorouteJson = require('express-autoroute-json');
const { models } = require('../../../models');

module.exports.autoroute = autorouteJson({
  model: models.example,
  resource: 'example', // this will be pluralised in the routes
  find: {},
});
```

will result in:

```sh
info: creating endpoint: /v1/examples      #find all     - GET
info: creating endpoint: /v1/examples/:id  #find by id   - GET
```

## Customising the business logic

The simplest example of business logic that you might need for these endpoints is the ability to define authentication. Here is a simple example that restricts all endpoints in this autoroute definition to just be accessible to admins.

```javascript
const autorouteJson = require('express-autoroute-json');
const { models } = require('../../../models');

function isAdmin(req, res, next) {
    //deny access if the user is not admin
    if (!req.user || !req.user.isAdmin) {
        return res.status(401).send("You are not an admin");
    }
    next();
}

module.exports.autoroute = autorouteJson({
  model: models.example,
  resource: 'example',

  // defining authentication here auto-applies it to all endpoints in this autoroute definition
  authentication: isAdmin,

  find: {},
  create: {},
  update: {},
  delete: {},
});
```

If you wanted to make it so that only admins are allowed to create, update or delete resources but **everyone** is able to retrieve resources then we can define authentication on each action block independently:

```javascript
const autorouteJson = require('express-autoroute-json');
const { models } = require('../../../models');

function isAdmin(req, res, next) {
    if (!req.user || !req.user.isAdmin) {
        return res.status(401).send("You are not an admin");
    }
    next();
}

module.exports.autoroute = autorouteJson({
  model: models.example,
  resource: 'example',

  find: {},
  create: {
    authentication: isAdmin,
  },
  update: {
    authentication: isAdmin,
  },
  delete: {
    authentication: isAdmin,
  },
});
```

## Further Documentation

We are in the process of developing some more in-depth documentation (including courses) as part of the [Authmaker](https://authmaker.com) Curriculum. As I said above you **do not** need to use Authmaker if you want to to use express-autoroute-json, however the current [Authmaker documentation](https://beginner-guides.authmaker.com/current/index) is the most complete documentation of using this entire system in a full-stack application.

There is a tiny bit more documentation on the [wiki](https://github.com/stonecircle/express-autoroute-json/wiki) but if you have any questions or want to request some specific documentation you can reach out to me [on Twitter](https://twitter.com/real_ate)

# Licence
Copyright (c) 2018, Stone Circle <info@stonecircle.ie>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
