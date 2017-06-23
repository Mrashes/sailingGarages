$(document).ready(function() {

	var app ={
		
		//function to populate listing section of the database.
		addNewListing:function(){
			//Title of Listing

			var newName =$('#title').val();
			//Description
			var newDescription = $('#description').val('');
			//Address - need to verify format required for Google Maps
			var newAddress = $('#location').val('');
			//Date of Event
			var newDate = $('#date').val('');;
			//Keywords - assume we have array of keywords
			var newKeywords = $('#keyword').val();
			//times - need to agree on proper format
			var newStartTime = max.object.start = $('#start').val();
			var newEndTime = max.object.end = $('#end').val();

		
			//Below are data fields that we may want to have once we add users functionality.  I've added these to the tree, we can use placeholder for time being.
			//organizer - username of listing organizer.  placeholder for now.
			var newOrganizer="placeholder";
			var newAttendeesCount = 0;

			//get a unique key to add a listings child.  I did this so we could iterate through arrays for 2nd children
			var key = firebase.database().ref().child("listings").push().getKey();
			
			//set basic variables for new child in firebase
			firebase.database().ref().child("listings/"+key).set({
				"name": newName,
				"description": newDescription,
				"date": newDate,
				"start_time":newStartTime,
				"end_time":newEndTime,
				"address":newAddress,
				"organizer":newOrganizer,
				"attendees_count":newAttendeesCount,
		  	});
			
			//set database for each keyword in keyword array
			for (var i=0;i<newKeywords.length;i++){
				var keyword = newKeywords[i];
			  	firebase.database().ref().child("listings/"+key+"/keywords").push().set(keyword);
			};
			max.clearInput();

		},

		//function to populate user section of the database
		addNewUser:function(){
			//All of this is placeholder information for now, just getting it set up so we can add to the DB easily when we finalize functionality
			var newUsername ="tstorti";
			var newPassword ="password";
			//Contact Info - not important for functionality we've discussed, may be useful for display purposes
			var newFirstName="Tony";
			var newLastName="Storti";
			var newEmail = "tonystorti@gmail.com";
			
			//Listings - create array with any listings that user posted
			var userListings = [];
			//Attending - have array with any listings that user is attending
			var userAttending = [];
		
			//rating - just a placeholder value for now
			var newRating = 0;
			
			//set basic variables for new child in firebase
			firebase.database().ref().child("users").push().set({
				"username": newUsername,
				"password": newPassword,
				"contact": {
					"first_name": newFirstName,
					"last_name": newLastName,
					"email":newEmail,
				},
				"rating":newRating,
		  	});
		},
		//this function generates the list of all of the sales in the firebase DB.
		generateList: function(){
			
			var ref =firebase.database().ref("listings").on("child_added",function(snapshot){

				//key of child branch (any buttons can have this as a data address to target this element in firebaseDB)
				var key = snapshot.getKey();

				//Container for a single list item
				var newListContainer = $("<div>");
				//sections to be included in container
				var title=$("<div>");
				var description=$("<div>");
				var date =$("<div>");
				var address=$("<div>");
				var time=$("<div>");
				var organizer =$("<div>");
				var rsvpBtn =$("<button>");
				var attendeesCount =$("<div>");

				//append different sections into container
				newListContainer.append(title);
				newListContainer.append(description);
				newListContainer.append(date);
				newListContainer.append(address);
				newListContainer.append(time);
				newListContainer.append(organizer);
				newListContainer.append(rsvpBtn);
				newListContainer.append(attendeesCount);

				rsvpBtn.attr("data-listing-id",key);
				rsvpBtn.addClass("js-rsvp");

				//set values in html tags
			 	title.text(snapshot.val().name);
			 	description.text(snapshot.val().description);
			 	date.text(snapshot.val().date);
			 	address.text(snapshot.val().address);
			 	time.text(snapshot.val().start_time +" to " + snapshot.val().end_time);
			 	organizer.text(snapshot.val().organizer);
			 	rsvpBtn.text("RSVP!");
			 	attendeesCount.text(snapshot.val().users_attending);
				
				//append section to list container
				$("#list").append(newListContainer);
			});
		},
		
		//this function adds one to the attendees count when user clicks RSVP button
		rsvp:function(){
			//listener function for all of the rsvp buttons
			$('body').on("click", ".js-rsvp", function () {
				
				//key for the specific listing user clicks on
				var listingKey = $(this).attr("data-listing-id");
				var attendeesCount=null;

				firebase.database().ref().child("listings/"+listingKey).on("value", function(snapshot) {
  					attendeesCount = snapshot.val().attendees_count;
				}, function (errorObject) {
  					console.log("The read failed: " + errorObject.code);
				});

				attendeesCount++;

				firebase.database().ref().child("listings/"+listingKey).update({
						attendees_count:attendeesCount,
					});
			});
		},

	};
	
	firebase.initializeApp(config);
	
	//app.addNewListing();
	//app.addNewUser();
	// app.generateList();
	app.rsvp();


});