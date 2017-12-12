            $(document).ready(function(){
                getUser();
                function getUser()
                {
                   $.post("/getUserName",
                   function(data,status){
                       if(data=="<script>location.href='/home'</script>")
                       {
                           location.href='/home';
                       }
                       else
                       {
                           $("#username").text(data);
                       }
                   });
                }
                $("#ok").click(function(){
                    var username=$("#username").text();
                   var val=$("#otp").val();
                   var date=$("#DOB").val();
                   console.log(date);
                   var type=$("#Type").val();
                   var gender=$("#Gender").val();
                   var photo=$("#Photo").val();
                   var details = {"Type":type, "DOB":date, "otp":val,"Gender":gender, 'check_name':username};
                   if(val.length>0 && date.length>0 && photo.length>0)
                   {
                       console.log(gender);
                       console.log(type);
                       if(gender!==undefined && type!==undefined)
                       {
                           $.post("/verify",
                           details,
                           function(data, status){
                               if(data=="go_to_home")
                               {
                                   document.getElementById("proFile").submit();
                               }
                               else if(data=="<script>location.href='/home'</script>")
                               {
                                   location.href='/home';
                               }
                               else
                               {
                                   $(".errordiv").text(data);
                               }
                            });
                       }
                       else
                       {
                           $(".errordiv").text("Enter Proper your Position (or) Gender");
                       }

                   }
                   else
                   {
                       $(".errordiv").text("Enter all values");
                   }
                });
                
                $("#resend").click(function(){
                    var name=$("#username").text();
                    $.post("/resend",
                        {"Username":name},
                        function(data, status){
                            if(data=="ok")
                                $(".errordiv").text("OTP send for your Email");
                            else
                                location.href="/home";
                    });
                });
                

            });