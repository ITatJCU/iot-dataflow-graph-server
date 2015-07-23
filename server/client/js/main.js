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

jsPlumb.ready(function()
{
	window.graph    = new GraphManager(jsPlumb);
	window.server   = new ServerCommunicationManager();
	window.uiEvents = new UIEvents(window.graph, window.server);
	
	//Conifgure the default jsPlumb settings
	jsPlumb.setContainer($('#container'));
	jsPlumb.importDefaults({
		Endpoint:      [ 'Dot', { radius: 15 } ],
		PaintStyle:    { lineWidth: 4, strokeStyle: '#ffbf23', outlineColor: '#000', outlineWidth: 1 },
		EndpointStyle: { fillStyle: '#ffbf23', lineWidth: 1, strokeStyle: '#000' },
		ConnectionOverlays:[ 
			[ 'Arrow', { width:30, length:40, location:0.5, paintStyle: { strokeStyle:'#000' } } ]
		]
	});
	
	//Populate the node menu and wire up the UI events
	window.uiEvents.PopulateNodeMenu(window.availableNodes);
	window.uiEvents.SetupEvents();
});
