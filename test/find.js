//setup
var autoroute = require('express-autoroute');
var expect = require('chai').expect;
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var request = require('supertest');
var _ = require('underscore')._;

//mock the mongoose
var mockgoose = require('mockgoose');
mockgoose(mongoose);

//internal bits
var authorisationFunction = require('../lib/authorisation');
var queryFunction = require('../lib/query');
var Chat = require('./models/chat');

var app;
var server;

describe('the find block', function () {
    beforeEach(function (done) {
        //reset app
        app = express();
        server = app.listen(255255);
        //load mockgoose data
        require('./fixtures/loadData')(done)
    });

    afterEach(function () {
        server.close();
        mockgoose.reset();
    })

    it('should return return status 200 when find is present', function (done) {
        autoroute(app, {
            throwErrors: true,
            routesDir: path.join(process.cwd(), "test", "fixtures", "find")
        });

        request(app).get('/chats').expect(200).end(done);
    })

    it('should return 404 when there is no find object', function (done) {
        autoroute(app, {
            throwErrors: true,
            routesDir: path.join(process.cwd(), "test", "fixtures", "modelOnly")
        });

        request(app).get('/chats').expect(404).end(done);
    })

    it('should return return all models when find is present', function (done) {
        autoroute(app, {
            throwErrors: true,
            routesDir: path.join(process.cwd(), "test", "fixtures", "find")
        });

        request(app).get('/chats').expect(200).expect(function (res) {
            expect(_.size(res.body)).to.equal(10);
        }).end(done);
    })
    
    it('should return only return models that fit the query', function (done) {
        autoroute(app, {
            throwErrors: true,
            routesDir: path.join(process.cwd(), "test", "fixtures", "findQuery")
        });

        request(app).get('/chats?min=3').expect(200).expect(function (res) {
            expect(_.size(res.body)).to.equal(7);
        }).end(done);
    })
    
    it('should return a sorted array of objects', function (done) {
        autoroute(app, {
            throwErrors: true,
            routesDir: path.join(process.cwd(), "test", "fixtures", "sortDown")
        });

        request(app).get('/chats?sortup=true').expect(200).expect(function (res) {
            expect(res.body).to.deep.equal(_.sortBy(res.body, function(item){
                return item.count
            }));
        }).end(done);
    })
    
    it('should return a reverse sorted array of objects', function (done) {
        autoroute(app, {
            throwErrors: true,
            routesDir: path.join(process.cwd(), "test", "fixtures", "sortDown")
        });

        request(app).get('/chats?sortdown=true').expect(200).expect(function (res) {
            expect(res.body).to.deep.equal(_.sortBy(res.body, function(item){
                return 1 - item.count
            }));
        }).end(done);
    })
    
    it('should allow authenticated users to get objects', function(done){
        autoroute(app, {
            throwErrors: true,
            routesDir: path.join(process.cwd(), "test", "fixtures", "authentication")
        });

        request(app).get('/chats?userlevel=max').expect(200).expect(function (res) {
            expect(_.size(res.body)).to.equal(10);
        }).end(done);
    })
    
        
    it('should not allow authenticated users to get objects', function(done){
        autoroute(app, {
            throwErrors: true,
            routesDir: path.join(process.cwd(), "test", "fixtures", "authentication")
        });

        request(app).get('/chats?userlevel=noob').expect(401).end(done);
    })
    
    //TODO remove branch reference for mockgoose in package.json
    it('should should only allow me to see the number of users i am allowed to see', function(done){
        autoroute(app, {
            throwErrors: true,
            routesDir: path.join(process.cwd(), "test", "fixtures", "authorisation")
        });

        request(app).get('/chats?userlevel=6').expect(function (res) {
            expect(_.size(res.body)).to.equal(5);
        }).end(done);
    })

    //TODO remove branch reference for mockgoose in package.json
    it('should restrict a query to only allow me to see the number of users i am allowed to see', function(done){
        autoroute(app, {
            throwErrors: true,
            routesDir: path.join(process.cwd(), "test", "fixtures", "authorisation")
        });

        request(app).get('/chats?userlevel=6&min=3').expect(function (res) {
            expect(_.size(res.body)).to.equal(2);
        }).end(done);
    })
    
    //TODO maybe kill this test when $and is supported https://github.com/mccormicka/Mockgoose/issues/28
    it('should build an $and query when there are competing restrictions', function () {
        var options = {
            model: require('./models/chat'),
            find: {
                authorisation: function (req) {
                    if (req.query.userlevel) {
                        return {
                            count: {
                                "$lt": req.query.userlevel
                            }
                        };
                    }
                },
                query: function (req) {
                    if (req.query.min) {
                        return {
                            count: {
                                "$gt": req.query.min
                            }
                        };
                    }
                }
            }
        }
        var req = {
            query: {
                userlevel: 6,
                min: 3
            }
        }
    
        authorisationFunction(options)(req, {}, function () {}),
        queryFunction(options)(req, {}, function () {}),
    
        expect(req.autorouteQuery).to.deep.equal({
            '$and': [{
                count: {
                    '$lt': 6
                }
            }, {
                count: {
                    '$gt': 3
                }
            }]
        });
    })
    
    it('should return return status 200 when find is present for ids', function (done) {
        
        var chat = new Chat({name: "unique person!!" , count: 42});
        chat.save(function(err, chatObj){
            
            autoroute(app, {
                throwErrors: true,
                routesDir: path.join(process.cwd(), "test", "fixtures", "find")
            });
            
            request(app).get('/chats/' + chatObj._id).expect(200).expect(function(res){
                expect(_.omit(res.body, '__v')).to.deep.equal({name: "unique person!!" , count: 42, _id: chatObj.id})
            }).end(done);
        })
    })
    
    it('should run the results object through the process funciton if present', function(done){
        autoroute(app, {
            throwErrors: true,
            routesDir: path.join(process.cwd(), "test", "fixtures", "process")
        });

        request(app).get('/chats').expect(200).expect(function (res) {
            expect(_.size(res.body)).to.equal(1);
            expect(_.size(res.body.chats)).to.equal(10);
        }).end(done);
    })
})