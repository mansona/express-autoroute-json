//setup
var autoroute = require('express-autoroute');
var expect = require('chai').expect;
var express = require('express');
var mongoose = require('mongoose');
var path = require('path');
var request = require('supertest');

//mock the mongoose
require('mockgoose')(mongoose);


var app;

describe('Find', function () {
    beforeEach(function () {
        //reset app
        app = express();
        app.listen(255255);
    })

    it('should return all models when default', function (done) {
        autoroute(app, {
			throwErrors: true,
			routesDir: path.join(process.cwd(), "test", "fixtures", "find")
		});
		
		request(app).get('/chats').expect(200).end(done);
    })
})