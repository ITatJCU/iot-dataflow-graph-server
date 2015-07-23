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
function ValidateFieldAsNumber(fieldName)
{
	return function(node)
	{
		if (isNaN(parseFloat(node.fields[fieldName]))) {
			throw new Error('The value for "' + fieldName + '" to must be a number');
		}
	}
}

module.exports = [
	
	{
		'id':        'condition-equals-value',
		'label':     'Condition: Input == Value',
		'inputs':    1,
		'fields':    { 'Value':'' },
		'validate':  function(node) {},
		'transform': function(node)
		{
			//Determine if the upstream value is equal to the specified value
			return node.inputValues[0] == node.fields['Value'];
		}
	},
	
	{
		'id':        'condition-not-equals-value',
		'label':     'Condition: Input != Value',
		'inputs':    1,
		'fields':    { 'Value':'' },
		'validate':  function(node) {},
		'transform': function(node)
		{
			//Determine if the upstream value is not equal to the specified value
			return node.inputValues[0] != node.fields['Value'];
		}
	},
	
	{
		'id':        'condition-less-than-value',
		'label':     'Condition: Input < Value',
		'inputs':    1,
		'fields':    { 'Less Than':'' },
		'validate':  ValidateFieldAsNumber('Less Than'),
		'transform': function(node)
		{
			//Determine if the upstream value is less than the specified value
			return parseFloat(node.inputValues[0]) < parseFloat(node.fields['Less Than']);
		}
	},
	
	{
		'id':        'condition-greater-than-value',
		'label':     'Condition: Input > Value',
		'inputs':    1,
		'fields':    { 'Greater Than':'' },
		'validate':  ValidateFieldAsNumber('Greater Than'),
		'transform': function(node)
		{
			//Determine if the upstream value is greater than the specified value
			return parseFloat(node.inputValues[0]) > parseFloat(node.fields['Greater Than']);
		}
	}
	
];
