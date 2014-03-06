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


var app;
var server;

describe('Find', function () {
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
})