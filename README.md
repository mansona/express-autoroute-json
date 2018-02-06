[![Build Status](https://travis-ci.org/stonecircle/express-autoroute-json.svg?branch=master)](https://travis-ci.org/stonecircle/express-autoroute-json)
[![dependencies Status](https://david-dm.org/stonecircle/express-autoroute-json/status.svg)](https://david-dm.org/stonecircle/express-autoroute-json)
[![devDependencies Status](https://david-dm.org/stonecircle/express-autoroute-json/dev-status.svg)](https://david-dm.org/stonecircle/express-autoroute-json?type=dev)
[![Maintainability](https://api.codeclimate.com/v1/badges/6a18031f88d7a4a2dd8f/maintainability)](https://codeclimate.com/repos/57a89b665a0b980c9200543d/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/6a18031f88d7a4a2dd8f/test_coverage)](https://codeclimate.com/repos/57a89b665a0b980c9200543d/test_coverage)

# Documentation Pending
We have just completed the rewrite and express-autoroute-json now speaks [JSON:API](https://jsonapi.org)

We will be working on documentation over the coming weeks

```
npm install express-autoroute-json@prerelease
```

and use this in your route file just like before:

```
var autorouteJson = require('express-autoroute-json');

//get your mongoose models
var models = rootRequire('./db/models');

function isAdmin(req, res, next) {
    //deny access if the user is not admin
    if (!req.user || !req.user.isAdmin) {
        return res.status(401).send("You are not an admin");
    }
    next();
}

module.exports.autoroute = autorouteJson({
    model: models.account,
    resource: 'account', //this will be pluralised in the routes
    authentication: isAdmin, //this is used for all the following functions

    //default CRUD
    find: {},
    create: {},
    update: {},
    delete: {}
});
```

# Licence
Copyright (c) 2016, Stone Circle <info@stonecircle.ie>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
