//watcher to change what nav buttons are displayed based on whether user is logged in or not
firebase.auth().onAuthStateChanged(function(user) {
	if (user) {
		login.changeUserStatus();
	}
});

//listener to initiate a search which populates list and map with new pins
$(document).on("click","#search", function(){
	app.search();
});

//listener to log that a user is "attending" a selected event
$(document).on("click", ".js-rsvp", function (event) {
	event.preventDefault();
	app.rsvp(this);
});

//listener to open the login popup or log out user depending on userStatus
$(document).on('click', '#login', function() {
	if($("#login").text() === "Login"){
		// $("#login-popup").show();
	}
	else{
		login.logoutUser();
	}	
});

//listener to open the new user popup if that is selected on first login screen
$(document).on('click', '#add-user-submit', function() {
	$('#login-popup').modal('toggle');
});

//listener to initiate the login process, checking account information and displaying error or completing login
$(document).on('click', '#login-user-submit', function() {
	login.loginUser()
});

//listener to initiate the login process, checking account information and displaying error or completing login
$(document).on('click', '#password-reset', function() {
	login.resetPassword();
});

//listener to initiate the new user process, checking login and password (and displaying any errors) before saving to DB
$(document).on('click', '#create-user-submit', function() {
	login.addNewUser();
});

//listener to show expanded details on a selected event
$(document).on('click', '.js-expand', function() {
	var key = "#expand-"+($(this).attr("data-listing-id"));
	var imageKey ="#image-"+($(this).attr("data-listing-id"));
	var imageLink=$(imageKey).attr("data-url");
	$(imageKey).attr("src",imageLink);

	if($(this).attr("data-visibility")==="hide"){	
		$(key).show();
		$(this).attr("data-visibility","show");
		$(this).text("Collapse Extra Information");
	}
	else{
		$(this).attr("data-visibility","hide");
		$(key).hide();
		$(this).text("Show More Information");
	}
});

//listener to open user profile if the user is logged in.  Alternate clicks will close profile
$(document).on('click', '#profile', function() {
		profile.populateProfile();
});

//listener to update profile "about me" section for each user
$(document).on('click', '#profile-update', function(event) {
	event.preventDefault();
	profile.profileDescriptionUpdate();
});

//listener to log that a user is "attending" a selected event
$(document).on("click", ".js-comments", function () {
	comments.commentsThread(this);
});

//listener to submit comments on popup
$(document).on('click', '#comments-submit', function(event) {
	event.preventDefault();
	comments.commentsThreadAdd(this);
});

//listener to cancel event if you are organizer
$(document).on('click', '.js-cancel-event', function(event) {
	event.preventDefault();
	app.cancelEvent(this);
});

//submit new event
$(document).on('click', '#submit', function(event) {
	$('#event').modal('toggle');
	popup.validateField().then(function(results) {
		popup.submit();
		if(document.getElementById('fileInput').files[0]!==undefined){
			popup.imageUploader().then(function(results) {
				popup.apiCall();
			});
		}
		else{
			popup.object.imgURL = null;
			popup.apiCall();
		}
		
	})
});
