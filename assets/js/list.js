
$(document).ready(function() {

	var app ={
		
		addNewListing:function(){
			//Title of Listing
			newName ="Cub's Garage Sale";
			//Description
			newDescription = "Free sporting memorabilia";
			//Address - need to verify format required for Google Maps
			newAddress ="1060 W Addison St, Chicago, IL 60613";
			//Date of Event
			newDate = "7/4/17";
			//Keywords - assume we have array of keywords
			newKeywords = ["sports", "used", "free"];
			//times - need to agree on proper format
			newStartTime = "11:00 AM";
			newEndTime = "2:00 PM";
		
			//Below are data fields that we may want to have once we add users functionality.  I've added these to the tree, we can use placeholder for time being.
			//organizer - username of listing organizer.  placeholder for now.
			newOrganizer="placeholder";

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
				"newOrganizer":newOrganizer,
		  	});
			
			//set database for each keyword in keyword array
			for (var i=0;i<newKeywords.length;i++){
				var keyword = newKeywords[i];
			  	firebase.database().ref().child("listings/"+key+"/keywords").push().set(keyword);
			};
			
		},

		addNewUser:function(){
			//All of this is placeholder information for now, just getting it set up so we can add to the DB easily when we finalize functionality
			newUsername ="jbutler";
			newPassword ="password";
			//Contact Info - not important for functionality we've discussed, may be useful for display purposes
			newFirstName="Jimmy";
			newLastName="Butler";
			newEmail = "jimmy@bulls.com";
			
			//Listings - create array with any listings that user posted
			userListings = [];
			//Attending - have array with any listings that user is attending
			userAttending = [];
		
			//rating - just a placeholder value for now
			newRating = 0;
			
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
	};
	
	firebase.initializeApp(config);
	
	app.addNewListing();
	app.addNewUser();


});