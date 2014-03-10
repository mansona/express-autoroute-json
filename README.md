# Express Autoroute JSON
This package will provide a helper function that builds an [Express Autoroute](https://github.com/Blooie/express-autoroute) routing table for a particular Mongoose model. This is again subscribes heavily to the [convention over configuration](http://en.wikipedia.org/wiki/Convention_over_configuration) methodology and has been created with the goal of preventing bad habits during authentication and authorization middlewares for json endpoints.

## WARNING ABOUT NOT FINISHED PACKAGE
In an effort to make a good API for this package I wrote the Readme first, I see this as akin to TDD for API development. Currently not all the "tests" are passing because the code hasn't been completed. 

**What works: ** find, authentication and authorisation
Why they are working: because that is all we need for the time being internally. Sorry it is the case but we are a busiess after all.

**What doesn't work: ** any writing endpoints like put, post or delete

**What to do if you want support for these: ** create an issue and explain your case for wanting them, if there is enough interest we will probably get around to it. Otherwise pull requests are welcome!

## Installation
```js
npm install express-autoroute
```

## Usage
This is not a required module, everything that can be done with this helper can be done with [Express Autoroute](https://github.com/Blooie/express-autoroute) but this helper will keep your code a bit more [DRY](http://en.wikipedia.org/wiki/Don't_repeat_yourself)

### What it looks like with express-autoroute
```js
module.exports.autoroute = {
    //get
    get: {
        '/chats': [authentication, authorization, getAll],
        '/chats/:id': [authentication, authorization, getOne],
    },
    //update
    put: {
        '/chats/:id': [authentication, authorization, updateOne]
    },
    //create
    post: {
        '/chats': [authentication, authorization, create]
    }
}

function authentication(req, res, next){
    //fuction to reject if not logged in
}

function authorisation(req, res, next){
    //some way to limit access to particular objects 
}

//then the actual logic
function getAll(){}
function getOne(){}
function updateOne(){}
function create(){}
```

If you are working with lots of different mongoose models you will find yourself repeating very similar things in the CRUD functions at the end. With express-autoroute-json you actually don't need to define the CRUD functions at all. Here is an example

```js
module.exports.autoroute = autorouteJson({
    model: Chats, //actual mongoose model object
    authentication: function(req){
        //fuction to reject if not logged in
    }, 
    authorisation: function(req){
        //some way to limit access to particular objects 
    },
    find: {
        query: function (req, query) {
            //add extra query options specific to your business logic
            query.length = { "$gt" : 5 };
        },
        sort: function (req, sort) {
            //update the sorting function
            sort.updatedAt = -1
        }
    },
    update: {}, //all default - not currently supported
    create: {} //all default - not currently supported
})
```

And that's it! nothing more required. Everything else has been generalised away for you. The interesting thing about the above example is that there is nothing missing, there is no hidden boiler plate code like the first example. Even with the most of the actual code missing the first example is longer than the entire express-autoroute-json segment.

### Options

```resource: String``` gives a new name to the resource, usually will default to the mongoose collection

# Licence
Copyright (c) 2013, Andrew Manson <andrew@bloo.ie>, Blooie Limited <info@bloo.ie>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.