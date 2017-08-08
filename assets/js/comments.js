var comments = {
    //this function displays all the saved comments for a particular event
	commentsThread:function(clicked){
		$("#comments").html("");
		//key for the specific listing user clicks on
		var listingKey = $(clicked).attr("data-listing-id");
		//update submit button data attribute so correct listing can be updated on submit comment
		$("#comments-submit").attr("data-listing-id",listingKey);	
		var currentUser = firebase.auth().hc;

		//show selected event name
		firebase.database().ref().child("listings").child(listingKey).once("value", function(snapshot) {
			$("#comments-name").text(" "+ snapshot.val().name);
		});

		//show all comments for the event
		firebase.database().ref().child("listings").child(listingKey).child("comments").on("child_added", function(snapshot) {
			//if no comments have been made yet
			if(snapshot!==null){
				var newComment = snapshot.val();
                var newCommentLine = $("<div>");
                newCommentLine.addClass("margin-bot5");
				newCommentLine.text(newComment);			
				$("#comments").append(newCommentLine);
			}
				
		}, function (errorObject) {
				console.log("The read failed: " + errorObject.code);
		});
	},

	//this function adds new user input to the comments thread with a timestamp
	commentsThreadAdd:function(clicked){
		var listingKey = $(clicked).attr("data-listing-id");
		var currentUser = firebase.auth().hc;
		var currentUsername = null;

		if (currentUser === null){
			alert("user not logged in");
		}
		else{
			//get current user name
			firebase.database().ref().child("users").child(currentUser).once("value", function(snapshot) {
				currentUsername = snapshot.val().username.split("@")[0];
				var newComment = moment().format("MM-DD-YYYY hh:mm A")+" "+ currentUsername + ": " + $("#comments-new").val();
				var newCommentLine = $("<div>");
				$("#comments-new").val("")
				//save new comments to table
				firebase.database().ref().child("listings").child(listingKey).child("comments").push(newComment);
			});
		}
	},
};