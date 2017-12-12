 
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
            }
            $("#logout").click(function(){
                $.post("/logout",function(data, status){
                    client.hdel('cookieDetail',cookie);
                    client.hdel('cookieDetail',cookie);
                    location.href='/home';
                });
            });
            
            $("#searchEmail").keypress(function(event){
                var keycode = event.keyCode;
                if(keycode===13) {
                    var searchEmail = $("#searchEmail").val();
                    var Name = $("#Name").text();
                    var Email = $("#Email").text();
                    var person_object = {"Name":Name, "Email":Email, "viewEmail":searchEmail};
                    $.post("/viewAnyProfile", person_object, function(data, status){
                        if(data=='exist'){
                            $.post("/get_His_Name",{"Email":searchEmail}, function(data, status){
                                if(data.indexOf('{"Name"')!==-1){
                                    var testhtml = document.getElementById("viewProfiles").innerHTML;
                                    var handlebars = Handlebars.compile(testhtml);
                                    var values = handlebars(JSON.parse(data));
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
                                else if(data == "<script>location.href='/404_not_found_page'<"+"/script>"){
                                    location.href='/404_not_found_page';
                                }
                                else{
                                    alert(data);
                                }
                            });
                        }
                        else if(data == "<script>location.href='/404_not_found_page'<"+"/script>"){
                            location.href='404_not_found_page';
                        }
                        else{
                            alert(data);
                        }
                    });
                }
            });

            $("#my123").click(function(){
                var Name = $("#Name").text();
                var Email = $("#Email").text();
                var from = $("#from").val();
                var to = $("#to").val();
                var my_object = {'Name':Name, 'Email':Email, 'from':from, 'to':to};
                $.post("/findMyRide", my_object, function(data, status){
                    if(data=="no_results"){
                        alert(data);
                        $("#from").val("");
                        $("#to").val("");
                        $(".post").css("display","none");
                        $("#no_trips").css("display","block");
                    }
                    else if(data.indexOf("[{")!==-1){
                        var obj = JSON.parse(data);
                    }
                    else if(data == "<script>location.href='/404_not_found_page'<"+"/script>"){
                        location.href='404_not_found_page';
                    }
                    else{
                        //$("#poda").text(data);
                        alert(data);
                    }
                });
            });
            
            if(document.URL=="http://zohocarpooling.zcodeusers.com/zcp.zoho.com/home"){
                $.post("/getAllPost",function(reply,status){
                    if(reply=="no_post") {
                        $("#no_trips").css("display","block");
                    }
                    else {
                        var theTemplateScript = $("#postscript").html();
                        var theTemplate = Handlebars.compile(theTemplateScript);
                        var posts = JSON.parse(reply);
                        var theCompiledHtml = theTemplate(posts);
                        $(".postwhlediv").append(theCompiledHtml);
                    }
                    
                });
            }
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

       $(".ride").click(function(){
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
                                        else{
                                            location.href='/404_not_found_page';
                                        }
                                    });
                                }
                            }
                            else if(data == "<script>location.href='/404_not_found_page'<"+"/script>"){
                                location.href='/404_not_found_page';
                            }
                            else{
                                alert(data);
                            }
                        });
                    }
                    else if(data == "<script>location.href='/404_not_found_page'<"+"/script>"){
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
                else if(reply=="<script>location.href='/home'</script>") {
                    location.href = "/home";
                }
                else {
                    location.href = "/404_not_found_page";
                }
            });
       });
       $(".home").click(function(){
           $(".viewprofile").css("display","none");
           $(".feedsdiv").css("display","block");
           $(".post").css("display","block");
           $("#no_trips").css("display","none");
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
          $(".viewmap,.viewmapdiv").css("display","none");
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
              } else {
                  //location.href = result;
              }
          });
          
       });
      $("#edit").click(function(){
          $("#change").css("visibility","visible");
          $("#edit").css("visibility","hidden");
          $(".editpro>input").prop('disabled', false);
          $(".editpro>select").prop('disabled', false);
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
            else {
                $("#return_val").text(data);
            }
        });
      });
       
      $(".editProfile").click(function(){
          $(".editProfile,.editpro").css("display","none")
      });
      
      
      $(document).on("click", "#mapView", function(){
          $(".viewmap,.viewmapdiv").css("display","block");
          var thisId = $(this).attr("data-ember-action");
          $.post("/mapView", {'Id':thisId}, function(data, status){
              if(data.indexOf('{"From":')!==-1) {
                var testhtml = $("#ViewMap").html();
                var handlebars = Handlebars.compile(testhtml);
                var okdata = handlebars(JSON.parse(data));
                $(".viewmapdiv").html(okdata); 
              }
              else {
                  location.href = reply;
              }
          });
          
      });
      
      
      
      
      
      
    });