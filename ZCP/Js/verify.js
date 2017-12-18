            $(document).ready(function(){
                getUser();
                function getUser()
                {
                   $.post("/getUserName",
                   function(data,status){
                       if(data=="<script>location.href='/404_not_found_page'</script>")
                       {
                           location.href='/404_not_found_page';
                       }
                       else
                       {
                           $("#username").text(data);
                       }
                   });
                }
                $("#ok").click(function(){
                    var username=$("#username").text();
                   var val=($("#otp").val()).trim();
                   var date=$("#DOB").val();
                   var type=$("#Type").val();
                   var gender=$("#Gender").val();
                   var photo=$("#Photo").val();
                   var details = {"Type":type, "DOB":date, "otp":val,"Gender":gender, 'check_name':username};
                   if(photo.length>0) {
                   if(val.length>0 && date.length>0)
                   {
                       if(gender!==undefined && type!==undefined)
                       {
                           $.post("/verify",
                           details,
                           function(data, status){
                               if(data=="go_to_home") {
                                   document.getElementById("proFile").submit();
                               } else if(data=="<script>location.href='/404_not_found_page'</script>") {
                                   location.href='/404_not_found_page';
                               } else if(data=="<script>location.href='/home'</script>") {
                                   location.href="/home";
                               } else if (data=="poo"){
                                   location.href = "/zcp.zoho.com";
                               } else {
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
                   } else {
                       $(".errordiv").text("Add your profile picture");
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