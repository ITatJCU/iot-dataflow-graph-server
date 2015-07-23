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

//An adjacency-list based directed graph implementation
//Note: edges only support direction, not weighting or other data payload
function DirectedGraph()
{
	this.vertices = [];
	this.edges = {};
}

//Adds a vertex
DirectedGraph.prototype.addVertex = function(vertexData)
{
	this.vertices.push(vertexData);
	return this.vertices.length - 1;
}

//Adds an edge
DirectedGraph.prototype.addEdge = function(source, target)
{
	//Add the edge, checking to prevent duplicates
	this.initListForVertex(source);
	if (this.edges[source].indexOf(target) == -1) {
		this.edges[source].push(target);
	}
}

//Iterates over the list of vertices
DirectedGraph.prototype.forEachVertex = function(callback) {
	this.vertices.forEach(callback);
}

//Retrieves a vertex
DirectedGraph.prototype.getVertex = function(index) {
	return this.vertices[index];
}

//Retrieves a list of vertices
DirectedGraph.prototype.getVertices = function(indices)
{
	var retrievedVertices = [];
	
	var that = this;
	indices.forEach(function(index) {
		retrievedVertices.push( that.vertices[index] );
	});
	
	return retrievedVertices;
}

//Retrieves the vertices that are edge targets for the specified source vertex
DirectedGraph.prototype.getEdgeTargets = function(source)
{
	this.initListForVertex(source);
	return this.edges[source];
}

//Retrieves the vertices that are edge sources for the specified target vertex
DirectedGraph.prototype.getEdgeSources = function(target)
{
	var sources = [];
	
	var that = this;
	Object.keys(this.edges).forEach(function(source)
	{
		if (that.edges[source].indexOf(target) != -1) {
			sources.push(source);
		}
	});
	
	return sources;
}

//Internal function to initialise a vertex's adjacency list
DirectedGraph.prototype.initListForVertex = function(source)
{
	if (this.edges[source] === undefined) {
		this.edges[source] = [];
	}
}

module.exports = DirectedGraph;
