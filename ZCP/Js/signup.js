

$(document).ready(function(){
    $("#createacc").click(function(){
	var check = true;
	var username = document.getElementById("").value;
	var email_id = document.getElementById("").value;
	var password = document.getElementById("").value;
	var gender = document.getElementById("").value;
	var age = document.getElementById("").value;
	var ph_number = document.getElementById("").value;
	var captcha = document.getElementById("").value;
	var url = {'Name':username, 'Email':email_id, 'Password':password, 'Gender': gender, 'Age':age, 'Phone':ph_number};
	
	if(checkname.test(username))
	{
		for(var i of mail)
		{
			if(i.test(email_id))
			{
				if(gender!==GENDER && gender===MALE || gender===FEMALE || gender===OTHERS)
				{
					if(age>14)
					{
						if(ph.test(ph_number))
						{
							signup(url);
						}
						else
						{
							document.getElementById("").innerHTML="Enter Proper your phone number";
						}
					}
					else if(age<15 && age>120)
					{
						document.getElementById("").innerHTML="The Age is in-valid";
					}
					else
					{
						document.getElementById("").innerHTML="Enter Proper your Age";
					}
				}
				else
				{
					document.getElementById("").innerHTML="Enter Proper your Gender";
				}
			}
		}
		if(check===false)
		{
			document.getElementById("").innerHTML="Enter Proper your Email";
		}
	}
	else
	{
		document.getElementById("").innerHTML="Enter Proper your Name";
	}
   });

   function signup(url)
   {

	$.post("/createacc",
	url,
	function(data, status){
		alert("Data: " + data + "\nStatus: " + status);
	});
   }
});



function random()
{
    var result = '';
    var value = ['a','b','c','d','e','f','g','h','i','j','k','l','m','n','o','p','q','r','s','t','u','v','w','x','y','z',1,2,3,4,5,6,7,8,9,0];
    for(var i=0;i<3;i+=1)
    {
        var val=Math.floor(Math.random()*value.length);
        result+=value[val];
    }
    document.getElementById("").innerHTML=result;
}