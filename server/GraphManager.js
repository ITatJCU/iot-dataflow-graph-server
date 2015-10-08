/*
//  IoT Dataflow Graph Server
//  Copyright (c) 2015, Adam Rehn
//  
//  Permission is hereby granted, free of charge, to any person obtaining a copy
//  of this software and associated documentation files (the "Software"), to deal
//  in the Software without restriction, including without limitation the rights
//  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
//  copies of the Software, and to permit persons to whom the Software is
//  furnished to do so, subject to the following conditions:
//  
//  The above copyright notice and this permission notice shall be included in all
//  copies or substantial portions of the Software.
//  
//  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
//  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
//  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
//  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
//  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
//  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
//  SOFTWARE.
*/
var fs             = require('fs');
var DirectedGraph  = require('./DirectedGraph.js');
var NetworkManager = require('./NetworkManager.js');
var TransformNodes = require('./TransformNodes.js');

function GraphManager(network)
{
	//The network manager
	this.network = new NetworkManager();
	
	//The list of intervals for "value-source" nodes
	this.intervals = [];
	
	//The flow graph itself
	this.graph = new DirectedGraph();
	
	//Instantiate the transform nodes
	this.transformNodes = new TransformNodes();
	
	//Read the source and sink JSON files
	this.sourceNodes = JSON.parse(fs.readFileSync(__dirname + '/nodes/sources.json'));
	this.sinkNodes   = JSON.parse(fs.readFileSync(__dirname + '/nodes/sinks.json'));
	
	//Annotate the source and sink nodes with their types
	this.sourceNodes.forEach(function(node) { node.type = 'source'; });
	this.sinkNodes.forEach(function(node)   { node.type = 'sink';   });
	
	//We cache the most recent values associated with source and sink nodes
	this.cachedValues = {};
	
	//Register our network message intercepts to perform value caching
	var that = this;
	var interceptCallback = function(node, data)
	{
		that.cachedValues[node] = {
			'value': data,
			'timestamp': Date.now()
		};
	};
	this.network.interceptIncoming(interceptCallback);
	this.network.interceptOutgoing(interceptCallback);
	
	//Set the initial cached values to null
	this.listAvailableNodes().map(function(node)
	{
		if (node.id != 'value-source' && (node.type == 'source' || node.type == 'sink')) {
			that.cachedValues[ node.id ] = null;
		}
	});
}

//Lists the available nodes
GraphManager.prototype.listAvailableNodes = function()
{
	return [].concat(
		this.sourceNodes,
		this.sinkNodes,
		this.transformNodes.listNodes()
	);
}

//Returns the cached values associated with source and sink nodes
GraphManager.prototype.listCachedValues = function() {
	return this.cachedValues;
};

//Processes a submitted graph description
GraphManager.prototype.processGraphSubmission = function(graphDetails)
{
	//Remove any existing source data listeners
	this.network.resetSourceListeners();
	this.intervals.forEach(clearInterval);
	this.intervals = [];
	
	//Reset our graph
	this.graph = new DirectedGraph();
	
	//Build the graph from the submitted description
	
	//Add the vertices
	var that = this;
	var vertexIndexMappings = {};
	graphDetails.vertices.forEach(function(vertexDescription, originalIndex) {
		vertexIndexMappings[ originalIndex ] = that.graph.addVertex(vertexDescription);
	});
	
	//Add the edges
	graphDetails.edges.forEach(function(edgeDescription)
	{
		var sourceVertexNewIndex = vertexIndexMappings[edgeDescription.source];
		var targetVertexNewIndex = vertexIndexMappings[edgeDescription.target];
		that.graph.addEdge(sourceVertexNewIndex, targetVertexNewIndex);
	});
	
	//Verify that the flow graph is valid
	this.validateGraph();
	
	//Create the function that represents each node's action when evaluated
	this.graph.forEachVertex(function(node, index)
	{
		//Retrieve the adjacent vertices
		var incomingNodes = that.graph.getVertices( that.graph.getEdgeSources(index) );
		var outgoingNodes = that.graph.getVertices( that.graph.getEdgeTargets(index) );
		
		//Determine which type of node we are dealing with, and generate its function accordingly
		if (node.type == 'source') {
			node.evaluate = that.createSourceNodeFunction(node, outgoingNodes);
		}
		else if (node.type == 'sink') {
			node.evaluate = that.createSinkNodeFunction(node, incomingNodes);
		}
		else if (node.type == 'transform') {
			node.evaluate = that.transformNodes.functionForNode(node, incomingNodes, outgoingNodes);
		}
	});
}

//Validates that the current flow graph is valid
GraphManager.prototype.validateGraph = function()
{
	////DEBUG: DUMP GRAPH
	//console.log(JSON.stringify(this.graph, true, 1));
	
	//Build the list of recognised source and sink nodes
	var recognisedSourceNodes = this.sourceNodes.map(function(n) { return n.id; });
	var recognisedSinkNodes   = this.sinkNodes.map(function(n)   { return n.id; });
	
	//Iterate over each of the nodes
	var that = this;
	this.graph.forEachVertex(function(node, index)
	{
		//All nodes must have a valid ID (nonzero length, no newlines)
		if (
			node.id === undefined ||
			node.id === null      ||
			node.id.length == 0   ||
			node.id.indexOf('\n') != -1
		) {
			throw new Error('Invalid node identifer "' + node.id + '"');
		}
		
		//Determine which type of node we are validating
		if (node.type == 'source')
		{
			//Source node identifiers must be from our recognised list
			if (recognisedSourceNodes.indexOf(node.id) == -1) {
				throw new Error('Unrecognised source node type "' + node.id + '"');
			}
		}
		else if (node.type == 'sink')
		{
			//Sink node identifiers must be from our recognised list
			if (recognisedSinkNodes.indexOf(node.id) == -1) {
				throw new Error('Unrecognised sink node type "' + node.id + '"');
			}
		}
		else if (node.type == 'transform')
		{
			//Transform nodes require custom validation
			that.transformNodes.validateNode(node);
		}
	});
}

//Creates the function for evaluating a source node
GraphManager.prototype.createSourceNodeFunction = function(node, outgoingNodes)
{
	//Determine if we are dealing with the special "value-source" source node
	if (node.id == "value-source")
	{
		//Register an interval to generate the specified value
		this.intervals.push( setInterval(function()
		{
			//Pass the source data to all downstream nodes
			outgoingNodes.forEach(function(targetNode) {
				targetNode.evaluate(targetNode, node, node.fields['Value']);
			});
			
		}, 500) );
	}
	else
	{
		//Register the evaluation function as a source data listener
		this.network.onSource(node.id, function(data)
		{
			//Pass the source data to all downstream nodes
			outgoingNodes.forEach(function(targetNode) {
				targetNode.evaluate(targetNode, node, data);
			});
		});
	}
	
	//Since source nodes never get called by upstream nodes (just the event trigger),
	//we don't actually need to store the function on the node itself
	return function(){};
}

//Creates the function for evaluating a sink node
GraphManager.prototype.createSinkNodeFunction = function(node, incomingNodes)
{
	var that = this;
	return function(thisNode, incomingNode, data)
	{
		//Broadcast the data to our sink
		that.network.sendToSink(node.id, data);
	};
}

module.exports = GraphManager;
