        $(document).ready(function(){
           $("#signup").click(function(){
              $("#top-div > h1").hide();
              $("#signin-div").hide();
              $("#signup-div").show();
              $("#forget").hide();
           }); 
           $("#top-div").click(function(){
              $("#signup-div").hide();
              $("#signin-div").hide();
              $("#top-div > h1").show();
              $("#forget").hide();
           });
           $("#signin").click(function(){
              $("#signin-div").show(); 
              $("#signup-div").hide();
              $("#top-div > h1").hide();
              $("#forget").hide();
           });
           $("#close").click(function(){
              $("#signup-div").hide();
              $("#top-div > h1").show();
           });
           $("#close1").click(function(){
              $("#signin-div").hide();
              $("#top-div > h1").show();
           });
           $("#close2").click(function(){
              $("#forget").hide();
              $("#top-div > h1").show();
           });
          $("#frget").click(function(){
              $("#forget").show();
              $("#signin-div").hide();
              $("#top-div > h1").hide();
          });
    
    $("#createacc").click(function(){
	var check = true;
	var name = ($("#Name").val()).trim();
	var email = ($("#Email").val()).trim();
	var password = ($("#Password").val()).trim();
	var re_password = ($("#Re-Password").val()).trim();
	var phone = ($("#Phone").val()).trim();
	var url = {'Name':name, 'Email':email, 'Password':password,'Re_Password':re_password, 'Gender':"", 'DOB':"", 'Phone':phone, 'Nick_Name':"", 'Age':"", 'Married_Status':"", 'Personal_Email':"",'Type':"","Status":"Failure","Path":""};

    if(name.length>0 && email.length>0 && password.length>0 && re_password.length>0 && phone.length>0)
    {
	    if(password==re_password)
	    {
	        signup(url);
        }
        else
        {
            $("#instruction").html("Re-Enter password is not Same");
        }
    }
    else
    {
        $("#instruction").html("Enter all values");
    }

	
   });

   function signup(url)
   {
	$.post("/createacc",
	url,
	function(data, status){
	    if(data==="done")
	    {
		    location.href="/home/next";
	    }
	    else if(data=="<script>location.href='/404_not_found_page'</script>") {
	        location.href="/404_not_found_page";
	    }
	    else if(data=="<script>location.href='/zcp.zoho.com/home'</script>") {
	        location.href="/zcp.zoho.com/home";
	    }
	    else
	    {
	         $("#instruction").html(data);
	    }
	});
   }
   
   $("#login").click(function(){
       var name = $("#name").val();
       var email = $("#email").val();
       var password = $("#pass").val();
       var url = {"Email":email,"Password":password};
       
       if(email.length=='0' && password.length=='0')
       {
           $("#errordiv").text("Enter all values");

       }
       else
       {
        	$.post("/login",
        	url,
        	function(data, status){
        	    if(data=="<script>location.href='/home/next'</script>")
        	    {
        	        location.href="/home/next";
        	    }
        	    else  if(data=="<script>location.href='/zcp.zoho.com/home'</script>")
        	    {
        	        location.href="/zcp.zoho.com/home";
        	    }
        	    else if(data=="ok")
        	    {
        	        location.href="/zcp.zoho.com/home/";
        	    }
        	    else if(data=="<script>location.href='/404_not_found_page'</script>") {
        	        location.href="/404_not_found_page";
        	    }
        	    else
        	    {
        	        $("#errordiv").text(data);
        	    }
        	});   
       }
   });
   
   $("#forgot_pass").click(function(){
      var email=$("#Email_id").val();
      if(email.length>0)
      {
          if(email.length>9)
          {
            $.post("/forgotPass",{'Email':email},function(data,status){
                if(data==="done")
                {
                    location.href="/forgotMyPassword";
                }
                else if(data=="<script>location.href='/404_not_found_page'</script>") {
                    location.href="/404_not_found_page";
                }
                else
                {
                    $("#alert").text(data);
                }
            });
          }
          else
          {
              $("#alert").text("Enter proper Email address");
          }
      }
      else
      {
          $("#alert").text("Enter the value in the input box");
      }
   });
   
});