var max = {
	popup: function() {
		    $('#popup').html('<div style="position:absolute; width:800px; margin:5%; background-color: green;">centered content</div>')
	}
}

$(document).on('click', '#button', function() {
	max.popup()
});