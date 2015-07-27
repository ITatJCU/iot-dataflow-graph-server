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
var dgram = require('dgram');
var sock = dgram.createSocket('udp4');

//The source identifier
SOURCE_ID = 'file-source'

//The file to read from
SOURCE_FILE = '/dev/null'

//The interval to read at, in milliseconds
READ_INTERVAL = 1000

//Fixed settings, do not modify
MULTICAST_ADDRESS = '224.0.0.114'
MULTICAST_PORT    = 7070

var fs = require('fs');
setInterval(function()
{
	var fileContents = fs.readFileSync(SOURCE_FILE);
	var message = new Buffer(SOURCE_ID + '\n' + fileContents);
	sock.send(message, 0, message.length, MULTICAST_PORT, MULTICAST_ADDRESS, function(err){});
},
READ_INTERVAL);
