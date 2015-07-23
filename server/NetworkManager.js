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
var EventEmitter = require('events').EventEmitter;
var dgram = require('dgram');

//The multicast address and port used by sources
SOURCE_MULTICAST_ADDRESS = '224.0.0.114'
SOURCE_MULTICAST_PORT    = 7070

//The multicast address and port used by sinks
SINK_MULTICAST_ADDRESS   = '224.0.0.115'
SINK_MULTICAST_PORT      = 9090

function NetworkManager()
{
	//Create our UDP socket
	this.sock = dgram.createSocket('udp4');
	
	//Listen for messages on the multicast address used by sources
	var that = this;
	this.sock.bind(SOURCE_MULTICAST_PORT, function()
	{
		that.sock.addMembership(SOURCE_MULTICAST_ADDRESS);
		that.sock.on('message', function(msg, rinfo) { that.sourceMessageHandler(msg); });
	});
	
	//Event emitter for notifying listeners of messages received from sources
	this.sourceEvents = new EventEmitter();
}

//Resets all of the registered source message listeners
NetworkManager.prototype.resetSourceListeners = function() {
	this.sourceEvents = new EventEmitter();
}

//Registers a listener for messages from a given source
NetworkManager.prototype.onSource = function(sourceName, handler) {
	this.sourceEvents.on(sourceName, handler);
}

//Sends a message to the specified source
NetworkManager.prototype.sendToSink = function(sinkName, data)
{
	var message = new Buffer(sinkName + '\n' + data);
	this.sock.send(message, 0, message.length, SINK_MULTICAST_PORT, SINK_MULTICAST_ADDRESS, function(err){});
}

//Internal handler function for incoming datagrams
NetworkManager.prototype.sourceMessageHandler = function(msg)
{
	var message = msg.toString();
	var lines = message.split('\n', 2);
	if (lines.length == 2)
	{
		//The first line is the source name, the second is the payload
		this.sourceEvents.emit(lines[0], lines[1]);
	}
	else {
		console.log('Warning: malformed UDP message "' + message + '"');
	}
}

module.exports = NetworkManager;
