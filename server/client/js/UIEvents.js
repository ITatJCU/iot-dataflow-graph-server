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

function UIEvents(graph, server)
{
	this.graph  = graph;
	this.server = server;
}

//Creates menu items for each supported node type
UIEvents.prototype.PopulateNodeMenu = function(availableNodes)
{
	var that = this;
	
	//Iterate over the available nodes
	availableNodes.forEach(function(node)
	{
		//Determine what type of node we are dealing with
		var parentList = null;
		if (node.type == 'source') {
			parentList = $('#sourceNodes ul');
		}
		else if (node.type == 'sink') {
			parentList = $('#sinkNodes ul');
		}
		else if (node.type == 'transform') {
			parentList = $('#transformNodes ul');
		}
		
		//Check that the node type is supported
		if (parentList !== null)
		{
			var listItem = $(document.createElement('li'));
			listItem.text(node.label);
			listItem.html( listItem.html().replace(/ /g, '&nbsp;') );
			
			//Store a callback on the DOM element for creating the specified node
			listItem.get(0).nodeCreationCallback = function(x, y) {
				that.graph.CreateNode(node, x, y);
			};
			
			//Set the list item as draggable
			listItem.attr('draggable', 'true');
			listItem.get(0).addEventListener('dragstart', function(event) {
				event.dataTransfer.setData('text/plain',null);
			});
			
			parentList.append(listItem);
		}
	});
	
	//Set document-wide the drag handlers
	var dragged;
	
	document.addEventListener("dragstart", function(event)
	{
		dragged = event.target;
		event.target.style.opacity = 0.5;
	}, false);
	
	document.addEventListener("dragend", function(event) {
		event.target.style.opacity = 1.0;
	}, false);
	
	//Set the drop handlers for the container area
	document.addEventListener("dragover", function(event) {
		event.preventDefault();
	}, false);
	
	document.addEventListener("drop", function(event)
	{
		event.preventDefault();
		if (event.target.id == "container")
		{
			var offset = $('#container').offset();
			dragged.nodeCreationCallback(
				event.clientX - offset.left,
				event.clientY - offset.top
			);
		}
	}, false);
}

UIEvents.prototype.resizeMargins = function()
{
	$('#container').css('margin-left', $('#toolbox').outerWidth() + 'px');
	$('#deleteContainer').css('padding-left', ($('#toolbox').outerWidth() / 2) + 'px');
	
	//Resize the height of the node list
	var listHeight = $('#toolbox').innerHeight() - $('#controlButtons').innerHeight();
	$('#nodeList').css('height', Math.floor(listHeight) + 'px');
}

UIEvents.prototype.enableApplyButton = function()
{
	$('#processGraph').removeAttr('disabled');
	$('#processGraph').text('Apply Changes');
}

UIEvents.prototype.disableApplyButton = function()
{
	$('#processGraph').attr('disabled', 'disabled');
	$('#processGraph').text('Applying Changes...');
}

//Wires up the UI events
UIEvents.prototype.SetupEvents = function()
{
	var that = this;
	
	//Register the server response handler
	this.server.dataReceived(function(response)
	{
		//Determine if the server reported success
		if (response.status !== 'success')
		{
			alert('Server reported error:\n\n' + response.error);
			that.enableApplyButton();
		}
		else
		{
			//Since server communication is usually extremely fast,
			//introduce a delay to enable the user to see the state change
			setTimeout(function() {
				that.enableApplyButton();
			}, 1000);
		}
	});
	
	//Register the communication error handler
	this.server.communicationError(function()
	{
		alert('Error: failed to communicate with the server!');
		that.enableApplyButton();
	});
	
	//Add the event handler for the 'Apply' button
	$('#processGraph').click(function()
	{
		//alert(JSON.stringify(that.graph.RebuildGraph(), true, 1));
		that.disableApplyButton();
		that.server.sendRequest( that.graph.RebuildGraph() );
	});
	
	//Add the event handler for the status toggle button
	$('#toggleStatus').click(function() {
		$('#status').toggle();
	});
	
	//Adjust the working area to reflect the new toolbox width
	this.resizeMargins();
	$(window).resize(function() {
		that.resizeMargins();
	});
}
