        $(document).ready(function(){
            getImage();
            function getImage(){
                var testhtml = document.getElementById("helloworld").innerHTML;
                var handlebars = Handlebars.compile(testhtml);
                $.post("/getImage",function(reply,status){
                    var object = JSON.parse(reply);
                    if(object.Type!=="Car-Owner") {
                        $(".Addcar").css("display","none");
                    }
                    var okdata = handlebars(object);
                    document.getElementById("test").innerHTML=okdata;
                });
                if(document.URL=="http://zohocarpooling.zcodeusers.com/zcp.zoho.com/home"){
                    $.post("/getAllPost",function(reply,status){
                        if(reply=="no_post") {
                            let theTemplateScript = $("#no_posts").html();
                            let theTemplate = Handlebars.compile(theTemplateScript);
                            let theCompiledHtml = theTemplate();
                            $(".postwhlediv").html(theCompiledHtml);
                        }
                        else {
                            var theTemplateScript = $("#postscript").html();
                            var theTemplate = Handlebars.compile(theTemplateScript);
                            var posts = JSON.parse(reply);
                            var theCompiledHtml = theTemplate(posts);
                            $(".postwhlediv").html(theCompiledHtml);
                            var checking = posts['post'];
                            postCheck(checking);
    
                        }
                        
                    });
                }
            }
            $("#logout").click(function(){
                $.post("/logout",function(data, status){
                    location.href='/home';
                });
            });
            
            $("#searchEmail").keypress(function(event){
                var keycode = event.keyCode;
                if(keycode===13) {
                    var searchEmail = ($("#searchEmail").val()).trim();
                    var Name = $("#Name").text();
                    var Email = $("#Email").text();
                    var person_object = {"Name":Name, "Email":Email, "viewEmail":searchEmail};
                    $.post("/viewAnyProfile", person_object, function(data, status){
                        if(data=='exist'){
                            $.post("/get_His_Name",{"Email":searchEmail}, function(data, status){
                                if(data.indexOf('{"Name"')!==-1){
                                    var hisObject = JSON.parse(data);
                                    var testhtml = document.getElementById("viewProfiles").innerHTML;
                                    var handlebars = Handlebars.compile(testhtml);
                                    var values = handlebars(hisObject);
                                    $("#viewdiv").html(values);
                                    if(hisObject.Type=="Owner"){
                                        $.post("/get_His_Ride", {"Email":hisObject.Email}, function(data, status){
                                            if(data==="no_results"){
                                                //$("#no_trips").css("display","block");
                                            }
                                            else if(data.indexOf('[{"Name"')!==-1){
                                                var object = JSON.parse(data);
                                            }
                                            else{
                                                location.href='/404_not_found_page';
                                            }
                                        });
                                    }
                                }
                                else if(data == "<script>location.href='/404_not_found_page'</script>"){
                                    location.href='/404_not_found_page';
                                }
                                else{
                                    alert(data);
                                }
                            });
                        }
                        else if(data == "<script>location.href='/404_not_found_page'</script>"){
                            location.href='404_not_found_page';
                        }
                        else if(data == "<script>location.href='/home'</script>"){
                            location.href="/home";
                        }
                    });
                }
            });

            $("#my123").click(function(){
                var Name = $("#Name").text();
                var Email = $("#Email").text();
                var from = ($("#from").val()).trim();
                var to = ($("#to").val()).trim();
                var my_object = {'Name':Name, 'Email':Email, 'from':from, 'to':to};
                $.post("/findMyRide", my_object, function(data, status){
                    if(data=="no_results"){
                        $("#from").val("");
                        $("#to").val("");
                        let theTemplateScript = $("#no_posts").html();
                        let theTemplate = Handlebars.compile(theTemplateScript);
                        let theCompiledHtml = theTemplate();
                        $(".postwhlediv").html(theCompiledHtml);
                    }
                    else if(data.indexOf("[{")!==-1){
                        $("#from").val("");
                        $("#to").val("");
                        var obj = JSON.parse(data);
                        var theTemplateScript = $("#postscript").html();
                        var theTemplate = Handlebars.compile(theTemplateScript);
                        var theCompiledHtml = theTemplate(obj);
                        $(".postwhlediv").html(theCompiledHtml);
                        var checking = obj['post'];
                        postCheck(checking);
                    }
                    else if(data == "<script>location.href='/404_not_found_page'</script>"){
                        location.href='/404_not_found_page';
                    }
                    else if(data == "<script>location.href='/home'</script>"){
                        location.href='/home';
                    }
                    else{
                        //$("#poda").text(data);
                        alert(data);
                    }
                });
            });
            

        // / ---- star ----/
        // $(".star").css("display","block");
        // $(".star1").css("display","block");
        // $(".star2").css("display","block");
        // ---- Search div ----
        $(".profile").click(function(){
            $(".ratingdiv").css({"transform":"translateX(400px)","transition":"1s"});
            $(".profilediv").css({"transform":"translateX(-17px)","transition":"1s"});
        });
        $(".Rating").click(function(){
            $(".profilediv").css({"transform":"translateX(400px)","transition":"1s"});
            $(".ratingdiv").css({"transform":"translateX(-17px)","transition":"1s"});
        });
        $(".change").click(function(){
           var from = document.getElementById("from").value;
           var to = document.getElementById("to").value;
           document.getElementById("from").value= to;
           document.getElementById("to").value= from;
        });
        $(".feedsdiv,.viewprofile").click(function(){
            $(".profilediv").css({"transform":"translateX(400px)","transition":"1s"});
            $(".ratingdiv").css({"transform":"translateX(400px)","transition":"1s"});
        });
        
        $(".Help").click(function(){
            window.open('http://bit.ly/2Br8uso', '_blank');
        });

       $("#ride").click(function(){
            $(".viewprofile").css("display","block");
            $(".feedsdiv").css("display","none");
            if (($("#viewProfileName").text().length)===0) {
                var Name = $("#Name").text();
                var Email = $("#Email").text();
                var searchEmail = $("#Email").text();
                var obj = {'Name':Name, 'Email':Email, "viewEmail":searchEmail};
                $.post("/viewAnyProfile", obj, function(data, status){
                    if(data=='exist'){
                        $.post("/get_His_Name",{"Email":searchEmail}, function(data, status){
                            if(data.indexOf('{"Name"')!==-1){
                                var testhtml = document.getElementById("viewProfiles").innerHTML;
                                var handlebars = Handlebars.compile(testhtml);
                                var values = handlebars(JSON.parse(data));
                                $("#viewdiv").html(values);
                                if(JSON.parse(data).Type=="Owner"){
                                    $.post("/get_His_Ride", {"Email":JSON.parse(data).Email}, function(data, status){
                                        if(data==="no_results"){
                                            $("#no_trips").css("display","block");
                                        }
                                        else if(data.indexOf('[{"Name"')!==-1){
                                            var object = JSON.parse(data);
                                        }
                                        else if(data=="<script>location.href='/404_not_found_page'</script>"){
                                            location.href='/404_not_found_page';
                                        }
                                        else if(data == "<script>location.href='/home'</script>"){
                                            location.href='/home';
                                        }
                                    });
                                }
                            }
                            else if(data == "<script>location.href='/404_not_found_page'</script>"){
                                location.href='/404_not_found_page';
                            }
                            else if(data == "<script>location.href='/home'</script>"){
                                location.href='/home';
                            }
                            else{
                                alert(data);
                            }
                        });
                    }
                    else if(data == "<script>location.href='/home'</script>"){
                        location.href='/home';
                    }
                    else if(data == "<script>location.href='/404_not_found_page'</script>"){
                        location.href='404_not_found_page';
                    }
                    else{
                        alert(data);
                    }
                });
            }
       });
       $("#change_my_pass").click(function(){
            var Name = $("#Name").text();
            var Email = $("#Email").text();
           var curnt_pass = $("#crt_pass").val();
           var new_pass = $("#new_pass").val();
           var re_new_pass = $("#re_new_pass").val();
           var url = {'Name':Name,'Email':Email,'Old':curnt_pass,'New':new_pass, 'Re_New':re_new_pass};
           if(curnt_pass.length>0 && new_pass.length>0 && re_new_pass.length>0) {
               $.post("/changeMyPassword", url, function(data, status){
                   if (data=="ok") {
                       $("#instruction").text("Password is changed");
                       $("#crt_pass").val("");
                       $("#new_pass").val("");
                       $("#re_new_pass").val("");
                   } else {
                       $("#instruction").text(data);
                   }
               });
           } else{
               $("#instruction").text("Enter all values");
           }
       });
       $(".Addcar").click(function(){
            var Name = $("#Name").text();
            var Email = $("#Email").text();
            var obj = {'Name':Name, 'Email':Email};
            $.post("/go_to_ride", obj, function(reply, status){
                if(reply=="true") {
                    location.href="/add_my_ride";
                }
                else if(reply=="<script>location.href='/404_not_found_page'</script>") {
                    location.href = "/404_not_found_page";
                } else if (reply=="<script>location.href='/home'</script>") {
                    location.href = "/home"
                }
            });
       });
       $(".home").click(function(){
           $(".viewprofile").css("display","none");
           $(".feedsdiv").css("display","block");
           //$(".postwhlediv").css("display","block");
       });
       $(".chngpass").click(function(){
           $(".profilediv").css({"transform":"translateX(400px)","transition":"1s"});
          $(".chng").css("display","block");
          $(".changepass").css("display","block");
       });
      $(".chng").click(function(){
          $(".chng").css("display","none");
          $(".changepass").css("display","none");
      });
      $(document).on("click","#more",function(){
          $(this).children("div").toggle();
        });
      $(document).on("click", ".viewmap", function(){
          $(".viewmap,.viewmapdiv,.viewtravels").css("display","none");
      });
      $(".edit").click(function(){
          var Name = $("#Name").text();
          var Email = $("#Email").text();
          $(".profilediv").css({"transform":"translateX(400px)","transition":"1s"});
          $(".editpro").css("display","block");
          $(".editProfile").css("display","block");
          $("#change").css("visibility","hidden");
          $("#edit").css("visibility","visible");
          $(".editpro>input").prop('disabled', true);
          $(".editpro>select").prop('disabled', true);
          
          $.post("/getMyDetail", {'Email':Email,'Name':Name}, function(result, status){
              if(result.indexOf('{"Name":')!==-1) {
                  var result = JSON.parse(result);
                  //$("#E-Name").val(result.Name);
                  $("#Nick_Name").val(result.Nick_Name);
                  $("#Phone").val(result.Phone);
                  $("#status").val(result.Married_Status);
                  $("#Type").val(result.Type);
                  $("#Personal_Email").val(result.Personal_Email);
              } else if (result=="<script>location.href='/404_not_found_page'</script>") {
                  location.href = '/404_not_found_page';
              }
          });
          
       });
      $("#edit").click(function(){
          $("#change").css("visibility","visible");
          $("#edit").css("visibility","hidden");
          $(".editpro>input").prop('disabled', false);
          $(".editpro>select").prop('disabled', false);
      });
      
      
        $(document).on("click", "#proFileChange", function(){
            $(".profilediv").css({"transform":"translateX(400px)","transition":"1s"});
            $(".changepro , .changeprodiv").css("display" , "block")
        })
        $(".changepro").click(function(){
            $(".changepro , .changeprodiv").css("display" , "none")
        });
      
      $("#change").click(function(){
        var Name = $("#Name").text();
        var Email = $("#Email").text();
        var Nick_Name = $("#Nick_Name").val();
        var Phone = $("#Phone").val();
        var status = $("#status").val();
        var Type = $("#Type").val();
        var Personal_Email = $("#Personal_Email").val();
        var details = {'Name':Name,'Email':Email,'Phone':Phone, 'Married_Status':status, 'Nick_Name':Nick_Name,"Type":Type, "Personal_Email":Personal_Email};
        $.post("/EditMyDetail", details, function(data, status){
            if(data=="done"){
                location.href="/zcp.zoho.com/home";
            }
            else if(data=="<script>location.href='/404_not_found_page'</script>") {
                location.href = '/404_not_found_page';
            }
            else if(data == "<script>location.href='/home'</script>"){
                location.href='/home';
            }
        });
      });
       
      $(".editProfile").click(function(){
          $(".editProfile,.editpro").css("display","none")
      });
      
      
      $(document).on("click", "#mapView", function(){
          $(".viewmap,.viewmapdiv").css("display","block");
          var thisId = $(this).attr("mapId");
          $.post("/mapView", {'Id':thisId}, function(data, status){
              if(data.indexOf('{"From":')!==-1) {
                var testhtml = $("#ViewMap").html();
                var handlebars = Handlebars.compile(testhtml);
                var okdata = handlebars(JSON.parse(data));
                $(".viewmapdiv").html(okdata); 
              }
              else if(data=="<script>location.href='/404_not_found_page'</script>"){
                  location.href ='/404_not_found_page';
              }
              else if(data == "<script>location.href='/home'</script>"){
                location.href='/home';
              }
          });
      });
      
      $(document).on("click", "#viewTravellers", function(){
          
          var thisId = $(this).attr("viewId");
          var Name = $("#Name").text();
          var Email = $("#Email").text();
          $.post("/viewMembers", {"Name":Name, "Email":Email, "Id":thisId}, function(data, status){
              if(data=="No-Members") {
                  var obj = {"Rider":data}
                  var handlebars = Handlebars.compile("<div style='font-size: 22px; text-align: center; height: 35px; width: 100%;'>{{Rider}}</div>");
                  var okdata = handlebars(obj);
                  $("#travelNames").html(okdata);
                  $(".viewmap,.memberdiv,.viewtravels").css("display","block");
              } else if((data.indexOf('{"riders":'))!==-1){
                  var html = $("#member_Names").html();
                  var handlebar = Handlebars.compile(html);
                  $("#travelNames").html(handlebar(JSON.parse(data)));
                  $(".viewmap,.viewtravels,.memberdiv").css("display","block");
              } else if(data=="<script>location.href='/404_not_found_page'</script>") {
                  location.href ='/404_not_found_page';
              } else if (data=="<script>location.href='/home'</script>") {
                  location.href ='/home';
              } else {
                  alert(data);
              }
          });
          
      });
      
    $(document).on("click", "#cancelARide", function(reply, status){
        
        var check = confirm("Press a button!");
        if(check===true) {
            var Name = $("#Name").text();
            var Email = $("#Email").text();
            var thisId = $(this).attr("cancelId");
            $.post("/cancelARide", {"Name":Name, "Email":Email, "Id":thisId}, function(data, status){
                if(data=="Cancelled") {
                    location.href = "/zcp.zoho.com/home";
                } else if(data=="<script>location.href='/404_not_found_page'</script>"){
                  location.href ='/404_not_found_page';
                } else if(data=="<script>location.href='/home'</script>"){
                  location.href ='/home';
                } else {
                    alert(data);
                }
            });
        }
      });
      
      $(document).on("click", "#bookRide", function(){
        var Name = $("#Name").text();
        var Email = $("#Email").text();
        var thisId = $(this).attr("bookId");
        $.post("/joinWithARide", {'Name':Name,'Email':Email,'Id':thisId}, function(result, status){
            if(result=="true") {
                location.href="/bookingPage";
            } else if(result=="<script>location.href='/404_not_found_page'</script>"){
                location.href = "/404_not_found_page";
            } else if(result=="<script>location.href='/home'</script>"){
                  location.href ='/home';
            } else {
                alert(result);
            }
        });
      });
      
    $(".selectiondiv").click(function () {
		$(this).children(".dropdowndiv").toggle();
	});
	$(".option1").click(function () {
		var a = $(this).text();
		$(this).parent().parent().children(".text").text(a);
		if(a!='Click the criteria') {
		    $.post("/getAllPost", {'need':a}, function(result, status){
		        
                if(result=="no_post") {
                    var theTemplateScript = $("#no_posts").html();
                    var theTemplate = Handlebars.compile(theTemplateScript);
                    var theCompiledHtml = theTemplate();
                    $(".postwhlediv").html(theCompiledHtml);
                }
                else {
                    var posts = JSON.parse(result);
                    var theTemplateScript = $("#postscript").html();
                    var theTemplate = Handlebars.compile(theTemplateScript);
                    var theCompiledHtml = theTemplate(posts);
                    $(".postwhlediv").html(theCompiledHtml);
                    var checking = posts['post'];
                    postCheck(checking);
                }
		    });
		}
	});
	
	$("#chandeMyProfile").click(function(){
	    var imagepath = $("#ImagePath").val();
	    if(imagepath.length>0) {
	        document.getElementById("proFile").submit();
	    }
	});
	
	$(document).on("click", "#editPost", function(){
        var check = confirm("Press a button!");
        if(check===true) {
            var Name = $("#Name").text();
            var Email = $("#Email").text();
            var thisId = $(this).attr("editId");
            var smlobj ={'Name':Name, 'Email':Email, 'Id':thisId};
            $.post("/EditMyPost", smlobj, function (data, status){
                if (data=='true') {
                    location.href="/editPost"
                } else if (data=="<script>location.href='/home'</script>") {
                    location.href = "/home";
                } else if (data=="<script>location.href='/404_not_found_page'</script>") {
                    location.href="/404_not_found_page";
                } else {
                    alert(data);
                }
            });
        }
	});
	
	$(document).on("click", "#deletePost", function(){
        var check = confirm("Press a button!");
        if(check===true) {
        var Name = $("#Name").text();
        var Email = $("#Email").text();
        var thisId = $(this).attr("deleteId");
        var smlobj ={'Name':Name, 'Email':Email, 'Id':thisId};
        $.post("/deleteMyPost", smlobj, function(result, status){
            if (result==="deleted") {
                location.href="/zcp.zoho.com/home";
            } else if (result=="<script>location.href='/home'</script>") {
                location.href = "/home";
            } else if (result=="<script>location.href='/404_not_found_page'</script>") {
                location.href="/404_not_found_page";
            }else {
                alert(result);
            }
        });
        }
	});
	
	$("#deleteacc").click(function(){
        var check = confirm("Press a button!");
        if(check===true) {
        var Name = $("#Name").text();
        var Email = $("#Email").text();
        var obj = {"Name":Name, "Email":Email};
	    $.post("/deleteMyAcc",obj,function(result, status){
	        if(result=="Account Closed") {
	            location.href = "/home";
	        } else if (result=="<script>location.href='/404_not_found_page'</script>") {
	            location.href="/404_not_found_page";
	        } else if (result=="<script>location.href='/home'</script>") {
	            location.href = "/home"
	        }
	    });
        }
	});
	
	function postCheck(checking) {
        var checkDate = new Date();
        var todayDate = checkDate.getDate() + 1;
        var thisMonth = Number(checkDate.getMonth()) + 1;
        var thisYear = checkDate.getFullYear();
	    var Email = $("#Email").text();
	    for(var k of checking) {
            if(k.Me=="yes") {
                $("[bookId="+k.Id+"]").prop("disabled", "true");
                $("[bookId="+k.Id+"]").css("visibility", "hidden");
            } else {
                $("[viewbar="+k.Id+"]").prop("disabled", "true");
                $("[viewbar="+k.Id+"]").css("visibility", "hidden");
            }
        }
        for(var j of checking) {
            var thisDate = j.StartingTime.split(" ")[0];
            var DateCheck = (thisDate).split("-");
            if (j.Book=="Yes") {
                if (DateCheck[2] <= todayDate && DateCheck[1] <= thisMonth && DateCheck[0] <= thisYear) {
                    $("[cancelId="+j.Id+"]").prop("disabled", "true");
                    $("[cancelId="+j.Id+"]").css("display", "none");
                }
                $("[bookId="+j.Id+"]").prop("disabled", "true");
                $("[bookId="+j.Id+"]").css("display", "none");
                $("[fullId="+j.Id+"]").prop("disabled", "true");
                $("[fullId="+j.Id+"]").css("display", "none");
                $("[viewId="+j.Id+"]").prop("disabled", "true");
                $("[viewId="+j.Id+"]").css("display", "none");
            } else if(j.Book=="No") {
                if (DateCheck[2] <= todayDate && DateCheck[1] <= thisMonth && DateCheck[0] <= thisYear) {
                    $("[bookId="+j.Id+"]").prop("disabled", "true");
                    $("[bookId="+j.Id+"]").css("display", "none");
                }
                $("[cancelId="+j.Id+"]").prop("disabled", "true");
                $("[cancelId="+j.Id+"]").css("display", "none");
                $("[fullId="+j.Id+"]").prop("disabled", "true");
                $("[fullId="+j.Id+"]").css("display", "none");
                $("[viewId="+j.Id+"]").prop("disabled", "true");
                $("[viewId="+j.Id+"]").css("display", "none");
            } else if (j.Book=="Full") {
                $("[bookId="+j.Id+"]").prop("disabled", "true");
                $("[bookId="+j.Id+"]").css("display", "none");
                $("[cancelId="+j.Id+"]").prop("disabled", "true");
                $("[cancelId="+j.Id+"]").css("display", "none");
                $("[viewId="+j.Id+"]").prop("disabled", "true");
                $("[viewId="+j.Id+"]").css("display", "none");
            } else {
                $("[bookId="+j.Id+"]").prop("disabled", "true");
                $("[bookId="+j.Id+"]").css("display", "none");
                $("[cancelId="+j.Id+"]").prop("disabled", "true");
                $("[cancelId="+j.Id+"]").css("display", "none");
                $("[fullId="+j.Id+"]").prop("disabled", "true");
                $("[fullId="+j.Id+"]").css("display", "none");
            }
        }
        for (var i of checking) {
                var a = new Date();
                a1= a.getDate();
                b1 = a.getMonth()+1;
                c1 = a.getFullYear();
                var thisDate = c1+'-'+b1+'-'+a1;
                var today = (i.StartingTime).split(" ")[0];
                if(today==thisDate) {
                    if(i['Rating'][Email]===undefined && i['Riders'][Email]!==undefined) {
                        $("[bookingId="+i.Id+"]").css("display", "none");
                        $("[ratingId="+i.Id+"]").css("display", "block");
                    }
                }
        }
	}
	
	$(document).on("click","#ratingbut", function(){
	    var background = $(this).prev().css("backgroundImage");
	    var perOfRating = Number(background.substring(background.indexOf("gold ")+5, background.indexOf("%")));
	    var Rating = Number(perOfRating/20);
        var Name = $("#Name").text();
        var Email = $("#Email").text();
        var thisId = $(this).attr("ratingId");
        var ratingobj ={'Name':Name, 'RaingValue':Rating, 'Email':Email, 'Id':thisId};
        $.post("/rateHisPost", ratingobj, function(data, status){
            if (data=="success") {
                location.href="/zcp.zoho.com/home";
            } else if (data=="") {
                location.href="/404_not_found_page";
            } else if (data == "") {
                location.href="/home";
            } else {
                alert(data);
            }
            
        });
	});
   
    });
    
function ratingStar(a) {
	document.getElementById("starDiv").style.backgroundImage = "linear-gradient(to right ,gold "+a*20+"% , #ddd 0%)"
}