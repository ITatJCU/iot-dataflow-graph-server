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

function GraphManager(jsPlumb) {
	this.jsPlumb = jsPlumb;
}

//Retrieves the bounds of an element
GraphManager.prototype.ElementBounds = function(elem)
{
	var wrapped = $(elem);
	return {
		x: wrapped.offset().left,
		y: wrapped.offset().top,
		w: wrapped.outerWidth(),
		h: wrapped.outerHeight()
	};
}

//Determines if a node is overlapping the deletion zone
GraphManager.prototype.OverlapsDeletionZone = function(elem)
{
	var zoneBounds = this.ElementBounds('#deleteDropZone');
	var elemBounds = this.ElementBounds(elem);
	var pos = {
		x: elemBounds.x + (elemBounds.w / 2),
		y: elemBounds.y + (elemBounds.h / 2)
	};
	
	return (
		pos.x >= zoneBounds.x && pos.x <= (zoneBounds.x + zoneBounds.w) &&
		pos.y >= zoneBounds.y && pos.y <= (zoneBounds.y + zoneBounds.h)
	);
}

//Retrieves the data payload of a node
GraphManager.prototype.RetrieveNodeData = function(node)
{
	var data = $(node).attr('data');
	return ((data !== undefined) ? JSON.parse(data) : {});
}

//Creates a node and adds it to the graph
GraphManager.prototype.CreateNode = function(data, x, y)
{
	var that = this;
	
	//Create the node element
	var node = $(document.createElement('div'));
	node.attr('class', 'node ' + data.type);
	node.append($(document.createElement('p')).text(data.label));
	node.attr('data', JSON.stringify(data));
	$('#container').append(node);
	
	//If the node has any user-supplied fields, add the inputs for them
	if (data.fields !== undefined)
	{
		var table = $(document.createElement('table'));
		var tbody = $(document.createElement('tbody'));
		
		Object.keys(data.fields).forEach(function(fieldName)
		{
			//Create a new table row
			var row = $(document.createElement('tr'));
			
			//Create the field label
			var labelCell = $(document.createElement('td'));
			labelCell.append(document.createTextNode(fieldName));
			row.append(labelCell);
			
			//Create the field input
			var inputCell = $(document.createElement('td'));
			var input = $(document.createElement('input')).attr('type', 'text');
			input.val(data.fields[fieldName]);
			input.change(function()
			{
				//When the field value changes, update the node's data payload
				var updatedData = that.RetrieveNodeData(node);
				updatedData.fields[fieldName] = input.val();
				node.attr('data', JSON.stringify(updatedData));
			});
			inputCell.append(input);
			row.append(inputCell);
			
			//Append the table row
			tbody.append(row);
		});
		
		table.append(tbody);
		node.append(table);
	}
	
	//If a position was specified for the created node, apply it
	if (x !== undefined && y !== undefined)
	{
		node.css('top', y + 'px');
		node.css('left', x + 'px');
	}
	
	//Make the node draggable
	jsPlumb.draggable(node, {
		
		containment: 'parent',
		
		drag: function (e)
		{
			//Show the deletion zone
			$('#deleteContainer').show();
			
			//Highlight the deletion zone if we are hovering over it
			if (that.OverlapsDeletionZone(e.el)) {
				$('#deleteDropZone').attr('class', 'highlighted');
			}
			else {
				$('#deleteDropZone').attr('class', '');
			}
		},
		
		stop: function(e)
		{
			//Determine if the node has been dropped in the deletion zone
			if (that.OverlapsDeletionZone(e.el))
			{
				//Delete the node, removing all associated connections
				jsPlumb.remove(e.el);
			}
			
			//Hide the deletion zone
			$('#deleteContainer').hide();
		}
	});
	
	//Determine which type of node we are creating
	if (data.type == 'source')
	{
		//Source node
		jsPlumb.addEndpoint(node, { anchor: 'Right' }, { isSource: true, isTarget: false });
	}
	else if (data.type == 'sink')
	{
		//Sink node
		jsPlumb.addEndpoint(node, { anchor: 'Left' }, { isSource: false, isTarget: true });
	}
	else
	{
		//Transform node
		
		//Add the output endpoint
		jsPlumb.addEndpoint(node, { anchor: 'Right' }, { isSource: true,  isTarget: false });
		
		//Determine how many input endpoints the node has
		if (data.inputs == 3)
		{
			//Three inputs
			jsPlumb.addEndpoint(node, { anchor: 'TopLeft'    }, { isSource: false, isTarget: true });
			jsPlumb.addEndpoint(node, { anchor: 'Left'       }, { isSource: false, isTarget: true });
			jsPlumb.addEndpoint(node, { anchor: 'BottomLeft' }, { isSource: false, isTarget: true });
		}
		else if (data.inputs == 2)
		{
			//Two inputs
			jsPlumb.addEndpoint(node, { anchor: 'TopLeft'    }, { isSource: false, isTarget: true });
			jsPlumb.addEndpoint(node, { anchor: 'BottomLeft' }, { isSource: false, isTarget: true });
		}
		else
		{
			//Single input
			jsPlumb.addEndpoint(node, { anchor: 'Left' }, { isSource: false, isTarget: true });
		}
	}
}

//Sorts connections based on target endpoint location
GraphManager.connectionSort = function(a, b)
{
	var aLoc = a.endpoints[1].canvas.offsetTop;
	var bLoc = b.endpoints[1].canvas.offsetTop;
	
	if (aLoc < bLoc) {
		return -1;
	}
	else if (aLoc > bLoc) {
		return 0;
	}
	else {
		return 0;
	}
};

//Builds the flow graph from the jsPlumb graph
GraphManager.prototype.RebuildGraph = function()
{
	var that = this;
	
	var vertexIndices = [];
	var vertexData = [];
	var edges = [];
	
	//Iterate over each of the connections in the jsPlumb graph
	var connections = jsPlumb.getAllConnections();
	connections.sort(GraphManager.connectionSort);
	connections.forEach(function(connection)
	{
		//If the source element is not already in the list of seen vertices, add it
		if (vertexIndices.indexOf(connection.source) == -1)
		{
			//Add the vertex index
			vertexIndices.push(connection.source);
			
			//Retrieve the vertex data payload
			vertexData.push( that.RetrieveNodeData(connection.source) );
		}
		
		//If the target element is not already in the list of seen vertices, add it
		if (vertexIndices.indexOf(connection.target) == -1)
		{
			//Add the vertex index
			vertexIndices.push(connection.target);
			
			//Retrieve the vertex data payload
			vertexData.push( that.RetrieveNodeData(connection.target) );
		}
		
		//Add the edge
		edges.push({ 'source': vertexIndices.indexOf(connection.source), 'target': vertexIndices.indexOf(connection.target) });
	});
	
	return {
		'vertices': vertexData,
		'edges': edges
	};
}
