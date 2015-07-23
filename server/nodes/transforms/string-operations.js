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
module.exports = [
	
	{
		'id':        'append-text',
		'label':     'Append Text To Input',
		'inputs':    1,
		'fields':    { 'Text':'' },
		'validate':  function(node)
		{
			//The text must have a nonzero length
			if (node.fields['Text'].length == 0) {
				throw new Error('No value supplied for the text to append');
			}
		},
		'transform': function(node)
		{
			//Append the user-supplied text
			return node.inputValues[0] + node.fields['Text'];
		}
	},
	
	{
		'id':        'join-2-inputs',
		'label':     'Join 2 Inputs as Strings',
		'inputs':    2,
		'fields':    { 'Delimiter':'' },
		'validate':  function(node) {},
		'transform': function(node)
		{
			//Join the upstream input values
			var values = Object.keys(node.inputValues).map(function(key) { return node.inputValues[key]; });
			return values.join(node.fields['Delimiter']);
		}
	},
	
	{
		'id':        'join-3-inputs',
		'label':     'Join 3 Inputs as Strings',
		'inputs':    3,
		'fields':    { 'Delimiter':'' },
		'validate':  function(node) {},
		'transform': function(node)
		{
			//Join the upstream input values
			var values = Object.keys(node.inputValues).map(function(key) { return node.inputValues[key]; });
			return values.join(node.fields['Delimiter']);
		}
	}
	
];
