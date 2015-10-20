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

//Performs an AJAX query to retrieve status data from a server endpoint
function query(url, handler)
{
	$.ajax({
		url:         url,
		type:        'GET',
		dataType:    'json',
		contentType: 'application/json',

		success: function(response) {
			handler(response);
		},
		error: function(jqXHR, textStatus, errorThrown) {
			alert('AJAX Error: ' + textStatus + ' ' + errorThrown);
			window.jqXHR = jqXHR;
		}
	});
}

//Creates a table cell with the given text
function createCell(text, isTH)
{
	var cell = $(document.createElement( isTH === true ? 'th' : 'td' ));
	cell.text(text);
	return cell;
}

$(document).ready(function()
{
	setInterval(function()
	{
		//Only update the status values when the status output is visible
		if ($('#status').is(':visible'))
		{
			query('/nodeValues', function(nodeValues)
			{
				$('#nodeValues').empty();
				var table  = $(document.createElement('table'));
				var thead  = $(document.createElement('thead'));
				var tbody  = $(document.createElement('tbody'));
				var header = $(document.createElement('tr'));
				header.append(createCell('Node', true));
				header.append(createCell('Last Value', true));
				header.append(createCell('Last Timestamp', true));

				var currTime = Date.now();
				Object.keys(nodeValues).map(function(node)
				{
					//Extract the most recent node value, and its corresponding timestamp
					var nodeValue     = (nodeValues[node] !== null) ? nodeValues[node].value : null;
					var nodeTimestamp = (nodeValues[node] !== null) ? nodeValues[node].timestamp : null;

					//If a timestamp value is present, determine how much time has elapsed since
					if (nodeTimestamp !== null)
					{
						var elapsed = Math.floor((currTime - nodeTimestamp) / 1000);
						nodeTimestamp = elapsed + ' seconds ago';
					}

					//Create the table row
					var tr = $(document.createElement('tr'));
					tr.append(createCell(node));
					tr.append(createCell(nodeValue));
					tr.append(createCell(nodeTimestamp));
					tbody.append(tr);
				});

				thead.append(header);
				table.append(thead);
				table.append(tbody);
				$('#nodeValues').append(table);
			});
		}
	}, 10);
});
