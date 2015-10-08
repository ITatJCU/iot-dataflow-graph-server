#!/usr/bin/env iojs
/*
  IoT Dataflow Graph Server
  Copyright (c) 2015, Adam Rehn
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
  
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
  SOFTWARE.
*/

var GraphManager = require('./GraphManager.js');
var express      = require('express');
var bodyParser   = require('body-parser')
var open         = require('open');
var graph        = new GraphManager();
var app          = express();

//Parse JSON requests
app.use(bodyParser.json());

//Serve the static files in the client directory
app.use(express.static('client'));

//Handle requests for the /availableNodes endpoint
app.get('/availableNodes', function(req, res)
{
	//Send the list of available nodes
	var availableNodes = graph.listAvailableNodes();
	res.setHeader('Content-Type', 'text/javascript');
	res.send('window.availableNodes = ' + JSON.stringify(availableNodes) + ';');
});

//Handle requests for the /nodeValues endpoint
app.get('/nodeValues', function(req, res)
{
	//Send the list of cached node values
	res.setHeader('Content-Type', 'text/javascript');
	res.send(JSON.stringify( graph.listCachedValues() ));
});

//Handle requests for the /apply endpoint
app.post('/apply', function(req, res)
{
	//Unless an error occurs, we assume processing was successful
	var response = {'status': 'success'};

	//Attempt to process the submitted flow graph description
	try
	{
		graph.processGraphSubmission(req.body);
	}
	catch (e)
	{
		response = {
			'status': 'error',
			'error':  e.message
		};
	}

	//Send the response to the client
	res.setHeader('Content-Type', 'text/javascript');
	res.send(JSON.stringify(response));
});

//Listen on port 8080
var server = app.listen(8080, function()
{
	//Open the user's web browser
	open('http://127.0.0.1:8080');
});
