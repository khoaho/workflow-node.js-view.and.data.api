
/////////////////////////////////////////////////////////////////////////////////
// Copyright (c) Autodesk, Inc. All rights reserved 
// Written by Philippe Leefsma 2014 - ADN/Developer Technical Services
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted, 
// provided that the above copyright notice appears in all copies and 
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting 
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS. 
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC. 
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
/////////////////////////////////////////////////////////////////////////////////

var CONSUMER_KEY = "****** place holder - replace with your creds ******";
var CONSUMER_SECRET = "****** place holder - replace with your creds ******";
var BASE_URL = "https://developer.api.autodesk.com";

var request = require('request');
var mongo = require('mongodb');
var fs = require('fs');
var path = require('path');
var process = require('child_process');

var Server = mongo.Server,
    Db = mongo.Db,
    BSON = mongo.BSONPure;

var server = new Server('localhost', 27017, { auto_reconnect: true });

db = new Db('NodeViewDb', server);

/////////////////////////////////////////////////////////////////////////////////
//  
//
/////////////////////////////////////////////////////////////////////////////////
db.open(function (err, db) {

    if (!err) {

        console.log("Connected to 'NodeViewDb' database");

        db.collection('models', { strict: true }, function (err, collection) {
            if (err) {
                console.log("The collection doesn't exist. Creating it with sample data...");
                populateDB();
            }
        });
    }
});

/////////////////////////////////////////////////////////////////////////////////
//  
//
/////////////////////////////////////////////////////////////////////////////////
exports.getToken = function (req, res) {

    var params = {
        client_id: CONSUMER_KEY,
        client_secret: CONSUMER_SECRET,
        grant_type: 'client_credentials'
    }

    request.post(BASE_URL + '/authentication/v1/authenticate',
        { form: params },
        function (error, response, body) {
            if (!error && response.statusCode == 200) {
                
                var authResponse = JSON.parse(body);

                res.send(authResponse.access_token);
            }
        });
};

/////////////////////////////////////////////////////////////////////////////////
//  
//
/////////////////////////////////////////////////////////////////////////////////
exports.findById = function (req, res) {
    var id = req.params.id;

    console.log('Retrieving item: ' + id);

    db.collection('models', function (err, collection) {
        collection.findOne({ '_id': new BSON.ObjectID(id) }, function (err, item) {
            res.send(item);
        });
    });
};

/////////////////////////////////////////////////////////////////////////////////
//  
//
/////////////////////////////////////////////////////////////////////////////////
exports.findAll = function (req, res) {

    console.log('Retrieving all items');

    db.collection('models', function (err, collection) {
        collection.find().toArray(function (err, items) {
            res.send(items);
        });
    });
};

/////////////////////////////////////////////////////////////////////////////////
//  
//
/////////////////////////////////////////////////////////////////////////////////
exports.post = function (req, res) {

    var item = req.body;

    console.log('Adding model: ' + JSON.stringify(wine));

    db.collection('models', function (err, collection) {
        collection.insert(item, { safe: true }, function (err, result) {
            if (err) {
                res.send({ 'error': 'An error has occurred' });
            } else {
                console.log('Success: ' + JSON.stringify(result[0]));
                res.send(result[0]);
            }
        });
    });
}

/////////////////////////////////////////////////////////////////////////////////
//  
//
/////////////////////////////////////////////////////////////////////////////////
exports.put = function (req, res) {

    var id = req.params.id;
    var item = req.body;

    console.log('Updating model: ' + id);
    console.log(JSON.stringify(item));

    db.collection('models', function (err, collection) {
        collection.update({ '_id': new BSON.ObjectID(id) }, item, { safe: true }, function (err, result) {
            if (err) {
                console.log('Error updating model: ' + err);
                res.send({ 'error': 'An error has occurred' });
            } else {
                console.log('' + result + ' document(s) updated');
                res.send(item);
            }
        });
    });
}

/////////////////////////////////////////////////////////////////////////////////
//  
//
/////////////////////////////////////////////////////////////////////////////////
exports.delete = function (req, res) {

    var id = req.params.id;

    console.log('Deleting model: ' + id);

    db.collection('models', function (err, collection) {
        collection.remove({ '_id': new BSON.ObjectID(id) }, { safe: true }, function (err, result) {
            if (err) {
                res.send({ 'error': 'An error has occurred - ' + err });
            } else {
                console.log('' + result + ' document(s) deleted');
                res.send(req.body);
            }
        });
    });
}

/////////////////////////////////////////////////////////////////////////////////
// Populate database with sample data 
// You'd typically not find this code in a real-life app, 
// since the database would already exist.
//
/////////////////////////////////////////////////////////////////////////////////
var populateDB = function () {

    var items = [
    {
        'name': 'Seat',
        'urn': 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZHJvcG53YXRjaGJ1Y2tldC9DYXIrU2VhdC5kd2Y='
    },
    {
        'name': 'Chassis',
        'urn': 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZHJvcG53YXRjaGJ1Y2tldC9DaGFzc2lzLmR3Zg=='
    },
    {
        'name': 'Suspension',
        'urn': 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZHJvcG53YXRjaGJ1Y2tldC9TdXNwZW5zaW9uLmR3Zg=='
    },
    {
        'name':'Trailer',
        'urn': 'dXJuOmFkc2sub2JqZWN0czpvcy5vYmplY3Q6ZHJvcG53YXRjaGJ1Y2tldC9UcmFpbGVyLmR3Zg=='
    }];

    db.collection('models', function (err, collection) {
        collection.insert(items, { safe: true }, function (err, result) { });
    });
};