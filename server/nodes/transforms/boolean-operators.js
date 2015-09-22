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
function convertToBool(val)
{
	var numericValue = parseFloat(val);
	return (val === true || val == "true" || (!isNaN(numericValue) && numericValue != 0));
}

module.exports = [
	
	{
		'id':        'and-operator',
		'label':     'Condition: Input 1 AND Input 2',
		'inputs':    2,
		'validate':  function(node) {},
		'transform': function(node)
		{
			//Apply the boolean AND operator to the upstream values
			return convertToBool(node.inputValues[0]) && convertToBool(node.inputValues[1]);
		}
	},
	
	{
		'id':        'or-operator',
		'label':     'Condition: Input 1 OR Input 2',
		'inputs':    2,
		'validate':  function(node) {},
		'transform': function(node)
		{
			//Apply the boolean OR operator to the upstream values
			return convertToBool(node.inputValues[0]) || convertToBool(node.inputValues[1]);
		}
	},
	
	{
		'id':        'xor-operator',
		'label':     'Condition: Input 1 XOR Input 2',
		'inputs':    2,
		'validate':  function(node) {},
		'transform': function(node)
		{
			//Apply the bitwise XOR operator to the upstream values
			return convertToBool(node.inputValues[0]) ^ convertToBool(node.inputValues[1]);
		}
	},
	
	{
		'id':        'not-operator',
		'label':     'NOT Input',
		'inputs':    1,
		'validate':  function(node) {},
		'transform': function(node)
		{
			//Apply the boolean NOT operator to the upstream value
			return !convertToBool(node.inputValues[0]);
		}
	}
	
];
