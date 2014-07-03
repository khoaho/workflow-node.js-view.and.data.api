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

var express = require('express');
var api = require('./api');

var app = express();

app.configure(function () {
    /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.logger('dev'));     
    app.use(express.bodyParser());
});

/////////////////////////////////////////////////////////////////////////////////
//  Webpages server
//
/////////////////////////////////////////////////////////////////////////////////
app.use('/nodeview', express.static(__dirname + '/../RibbonClient'));
//app.use('/nodeview', express.static(__dirname + '/../Client'));

/////////////////////////////////////////////////////////////////////////////////
//  Rest API
//
/////////////////////////////////////////////////////////////////////////////////
app.get('/nodeview/api/token', api.getToken);
app.get('/nodeview/api/models', api.findAll);
app.get('/nodeview/api/model/:id', api.findById);
app.post('/nodeview/api/model', api.post);
app.put('/nodeview/api/model/:id', api.put);
app.delete('/nodeview/api/models/:id', api.delete);

//API use
//Get all models:
//curl -i -X GET http://hostname:3000/nodeview/api/models

//Get model with _id:
//curl -i -X GET http://hostname:3000/nodeview/api/model/_id

//Delete model with _id:
//curl -i -X DELETE http://hostname:3000/nodeview/api/_id

//Add a new model:
//curl -i -X POST -H 'Content-Type: application/json' -d '{"name": "Plane", "urn": "dgddhdjdjdjdjdkdk"}' http://hostname:3000/nodeview/api/model

//Modify model with _id:
//curl -i -X PUT -H 'Content-Type: application/json' -d '{"name": "Plane", "urn": "hfhfjfkgklglg"}' http://hostname:3000/nodeview/api/model/_id

/////////////////////////////////////////////////////////////////////////////////
//  
//
/////////////////////////////////////////////////////////////////////////////////
app.listen(process.env.PORT || 3000);

console.log('Listening on port 3000...');
