var login = {

    //function to populate user section of the database
	addNewUser:function(){
		var newUsername =$("#newUsername").val();
		var newPassword =$("#newPassword").val();
		var confirmPassword =$("#confirmNewPassword").val();		
		$("#error-submit").text("");
		if(newPassword === confirmPassword){
			firebase.auth().createUserWithEmailAndPassword(newUsername, newPassword).then(function(result){
				login.updateUsers();
				$("#newUser-popup").hide();
				var user = firebase.auth().currentUser;
				$('#newUser-popup').modal('toggle');

				user.sendEmailVerification().then(function() {
  					// Email sent.
  					console.log("email sent")
				}, function(error) {
  					// An error happened.
				});
			}).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				$("#error-submit").text(errorMessage);
			});
		}
		else{
			$("#error-submit").text("Passwords do not match.  Please submit again");
		}		
    },

    //this function updates the page display based on on if a user is logged in or not
	changeUserStatus:function(){
		if(firebase.auth().hc===null){
			$("#login").text("Login");
			$("#profile").attr("style","visibility: hidden");
		}
		else{
			$("#login").text("Logout");
			$("#profile").attr("style","visibility: visible");
		}
    },
    
	//this function will attempt to authenticate user based on login information.  if successful will resolve value for get user data
	loginUser:function(){
			var username =$("#username").val();
			var password =$("#password").val();

			firebase.auth().signInWithEmailAndPassword(username, password).then(function(result){
				$('#login-popup').modal('toggle');

			}).catch(function(error) {
				// Handle Errors here.
				var errorCode = error.code;
				var errorMessage = error.message;
				// ...
				$("#error-login").text(errorMessage);
			});	
	},

	//this function logs out user from firebase authentication tool
	logoutUser:function(){
		firebase.auth().signOut().then(function() {
			// Sign-out successful.
			$("#profile").attr("style","visibility:hidden");
			$("#login").text("Login");
		}).catch(function(error) {
			// An error happened.
		});
    },
    
    //this function sends an email to the user to reset his/her password if the account exists 
	resetPassword:function(){
		var emailAddress = $("#username").val();
		if (emailAddress===""){
			$("#error-login").html("Please enter your email address in the user field and click the 'Forgot Password' button");
		}
		else{
			firebase.auth().sendPasswordResetEmail(emailAddress).then(function() {
  				$("#error-login").html("Please check your email for steps to finish resetting your password");
			}, function(error) {
  		 		//An error happened.
  		 		$("#error-login").text(error);
			});
		}
    },

	//this function updates users portion of firebaseDB with newUser ID
	updateUsers:function(){
		var newUsername =$("#newUsername").val();
		var key = firebase.auth().hc;
		//write whatever initial information we want for the user
		firebase.database().ref().child("users").child(key).set({
			"username": newUsername,
			"email": newUsername,
			"rating": 0,
			"numReviews":0,
		}).then(function(){
			$("#popup").hide();
		});	
	},
};