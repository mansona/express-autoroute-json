[![Build Status](https://travis-ci.org/Blooie/express-autoroute-json.png?branch=master)](https://travis-ci.org/Blooie/express-autoroute-json)
[![devDependency Status](https://david-dm.org/Blooie/express-autoroute-json/dev-status.svg?theme=shields.io)](https://david-dm.org/Blooie/express-autoroute-json#info=devDependencies)

# Express Autoroute JSON
This package will provide a helper function that builds an [Express Autoroute](https://github.com/Blooie/express-autoroute) routing table for a particular Mongoose model. This is again subscribes heavily to the [convention over configuration](http://en.wikipedia.org/wiki/Convention_over_configuration) methodology and has been created with the goal of preventing bad habits during authentication and authorization middlewares for json endpoints.

## WARNING ABOUT NOT FINISHED PACKAGE
In an effort to make a good API for this package I wrote the Readme first, I see this as akin to TDD for API development. Currently not all the "tests" are passing because the code hasn't been completed. 

**What works: ** find, authentication and authorisation
Why they are working: because that is all we need for the time being internally. Sorry it is the case but we are a busiess after all.

**What doesn't work: ** any writing endpoints like put, post or delete

**What to do if you want support for these: ** create an issue and explain your case for wanting them, if there is enough interest we will probably get around to it. Otherwise pull requests are welcome!

## Note about NodeJS version
For some reason the tests are running strangely on node 0.8 i.e. they pass when run individually but fail when run all together. I have done some investigation and as far as I can tell I am doing all the teardown stuff correctly. I've even played around with being more strict in the setup and teardown using a promise chain. 

For this reason we are currently **not** supporting node 0.8.x . If you can help us figure out what we are doing wrong then contributions are welcome and we are always willing to learn.

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
    authentication: function(req, res, next){
        //fuction to reject if not logged in
    }, 
    authorisation: function(req){
        //some way to limit access to particular objects 
    },
    find: {
        query: function (req) {
            //add extra query options specific to your business logic
            return { length : { "$gt" : 5 }};
        },
        sort: function (req) {
            return {updatedAt : -1}
        }
    },
    update: {}, //all default - not currently supported
    create: {} //all default - not currently supported
})
```

And that's it! nothing more required. Everything else has been generalised away for you. The interesting thing about the above example is that there is nothing missing, there is no hidden boiler plate code like the first example. Even with the most of the actual code missing the first example is longer than the entire express-autoroute-json segment.

### Options
Current working options: 
```
{
    model: Mongoose#Model, 
    resource: String, //optional
    authentication: function(req, res, next){}, 
    authorisation: function(req){},
    find: {
        query: function (req){},
        sort: function (req){}
    }
}
```

#### ```model: Mongoose#Model``` 
Actual mongoose model to use. Usually the name of the endpoint will be derived from the collection name ```model.collection.name```

#### ```resource: String``` 
if defined autoroute-json will use this string as the endpoint name

#### ```authentication: function(req, res, next)``` 
normal express style middleware to be used for any authentication needs. **remember** to call ```next()```

#### ```authorisation: function(req)``` 
method called to add to the query. This can be used to make sure that the mongoose model will always be queried with a particular parameter. Any conflicting parameters with that of ```find.query``` will be automaically combinded with an ```$and``` operator. This function must return a query object if it wants to effect the query. 

example: 
```
autorouteJson({
    authorisation: function(req){
        // minimimum count of 4
        return { count: { "$gte": 4 } };
    },
    find: {
        query: function (req){
            return { count: { "$lte": 8 } };
        },
    }
})

// results in query between 4 and 8
{
    "$and" : [
        { count: { "$gte": 4 } },
        { count: { "$lte": 8 } }
    ]
}
```

#### ```find.query: function(req)``` 
returns a query object to use as part of the mongoose find()

#### ```find.sort: function(req)``` 
returns a sort object to use during find()

# Licence
Copyright (c) 2013, Andrew Manson <andrew@bloo.ie>, Blooie Limited <info@bloo.ie>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.