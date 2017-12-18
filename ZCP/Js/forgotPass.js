 $(document).ready(function(){
     getmyname();
     
     function getmyname(){
     $.post("/getmyname",function(data,status){
         if(data =="<script>location.href='/404_not_found_page'</script>"){
             loction.href="/404_not_found_page";
         }
         else
         {
             $("#namediv").text(data);
         }
     });
     }
     
    $("#forgotPass").click(function(){
        var otp=$("#OTP").val();
        var new_pass = $("#new").val();
        var re_new_pass = $("#re_new").val();
        
        if(otp.length>0 && new_pass.length>0 && re_new_pass.length>0){
            if(new_pass===re_new_pass){
                $.post("/ForgotMyPass",{'OTP':otp,'Password':new_pass,'Re_Password':re_new_pass},
                function(data,status){
                    if(data==="done"){
                    } else if(data=="<script>location.href='/home'</script>"){
                        location.href='/home';
                    
                    } else if(data=="<script>location.href='/404_not_found_page'</script>"){
                        location.href='/404_not_found_page';
                    } else{
                        $("#summa").text(data);
                    }
                });
            } else{
                $("#summa").text("Re-enter Password is wrong");
            }
        } else{
            $("#summa").text("Enter all values");
        }
    });
    $("#resend").click(function(){
        var name=$("#namediv").text();
        $.post("/resendotp",{"Username":name},
        function(data, status){
            if(data=="done") {
                $("#summa").text("OTP send for your Email");
             } else if(data=="<script>location.href='/home'</script>"){
                 location.href='/home';
             }else {
                 location.href='/404_not_found_page';
             }
        });
    });
    
    
});