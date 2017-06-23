var max = {
	object: {},
	popup: function() {
		$('#popup').html('<div class="popup"><p>Title</p><input type="text" name="title" id="title"><p>Description</p><input type="text" name="description" id="description"><p>Dates</p><input type="date" name="date" id="date"><p>Start Time</p><input type="time" name="start" id="start"><p>End Time</p><input type="time" name="end" id="end"><p>Location</p><input type="text" name="location" id="location"><p>Keywords</p><input type="text" name="keyword" id="keyword"><button id="submit">submit</button></div>')
	},
	submit: function() {
		max.object.title = $('#title').val();
		max.object.description = $('#description').val();
		max.object.date = $('#date').val();
		max.object.start = $('#start').val();
		max.object.end = $('#end').val();
		max.object.location = $('#location').val();
		max.object.keyword = $('#keyword').val();
	},
	clearInputs: function() {
		$('#keyword').val('');
		$('#location').val('');
		$('#end').val('');
		$('#start').val('');
		$('#date').val('');
		$('#description').val('');
		$('#title').val('');
		
	},
	clearPopup: function(){
		$('#popup').html('');
	}
}

$(document).on('click', '#button', function() {
	max.popup()
});

$(document).on('click', '#submit', function() {
	// max.submit();
	app.addNewListing();
	max.clearPopup()
	setTimeout(clearInputs, 1000)
});