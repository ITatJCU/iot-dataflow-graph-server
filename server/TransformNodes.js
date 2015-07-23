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
var transforms = require('./nodes/transforms.js');

function TransformNodes()
{
	//Our supported transform nodes (specified in transforms.js)
	this.nodes = transforms;
	
	//Build our transform function and validation function mappings
	var that = this;
	this.transformMappings = {};
	this.validationMappings = {};
	this.nodes.forEach(function(node)
	{
		//Move the transform function into the mappings object
		that.transformMappings[ node.id ] = node.transform;
		node.transform = undefined;
		
		//Move the validation function into the mappings object
		that.validationMappings[ node.id ] = node.validate;
		node.validate = undefined;
		
		//Add the 'type' field to make the node object suitable for passing to the client
		node.type = 'transform';
	});
}

//Verifies that a node is well-formed and has valid inputs
TransformNodes.prototype.validateNode = function(node)
{
	//Check that the node ID is in our list of recognised nodes
	if (Object.keys(this.transformMappings).indexOf(node.id) == -1) {
		throw new Error('Unrecognised transform node type "' + node.id + '"');
	}
	
	//Retrieve and run the node-specific validation function
	var validationFunc = this.validationMappings[ node.id ];
	validationFunc(node);
}

//Generates the evaluation function for a node
TransformNodes.prototype.functionForNode = function(node, incomingNodes, outgoingNodes)
{
	//Retrieve the node-specific transform function itself
	var transformFunc = this.transformMappings[ node.id ];
	
	//Generate the generic evaluation function that handles input management
	node.inputValues = {};
	return function(thisNode, incomingNode, data)
	{
		//Store the supplied input value
		thisNode.inputValues[ incomingNodes.indexOf(incomingNode) ] = data;
		
		//If we have cached values for all of our inputs, proceed
		if (Object.keys(thisNode.inputValues).length == thisNode.inputs)
		{
			//Perform the transform itself
			var transformedData = transformFunc(thisNode);
			
			//Pass the transformed data to all downstream nodes
			outgoingNodes.forEach(function(targetNode) {
				targetNode.evaluate(targetNode, thisNode, transformedData);
			});
		}
	};
}

TransformNodes.prototype.listNodes = function() {
	return this.nodes;
}

module.exports = TransformNodes;
