$(document).ready(function() {
    
    setprofile();
    
    function setprofile() {
        var testhtml = document.getElementById("profileheader").innerHTML;
        var handlebars = Handlebars.compile(testhtml);
         $.post("/getImage",function(reply,status){
             var object = JSON.parse(reply);
             var okdata = handlebars(object);
             document.getElementById("setProfile").innerHTML=okdata;
         });
    }
    
    var postcount = -1;
    $(".next").click(function() {
        if (postcount < 2) {
            postcount += 1;
        }
        postChange(postcount);
    });
    $(".previous").click(function() {
        if (postcount >= 0) {
            postcount -= 1;
        }
        postChange(postcount);
    });

    function postChange(postcount) {
        if (postcount === -1) {
            $(".previous").css("display", "none");
            $("#first").css("display", "block");
            $("#second").css("display", "none");
            $(".next").css("display", "block");
            $(".nextsubmit").css("display", "none");
        } else if (postcount === 0) {
            $(".previous").css("display", "inline-block");
            $("#first").css("display", "none");
            $("#second").css("display", "block");
            $("#third").css("display", "none");
            $("#fourth").css("display", "none");
            $(".next").css("display", "block");
            $(".nextsubmit").css("display", "none");
        } else if (postcount === 1) {
            $("#first").css("display", "none");
            $("#second").css("display", "none");
            $("#third").css("display", "block");
            $("#fourth").css("display", "none");
            $(".next").css("display", "block");
            $(".nextsubmit").css("display", "none");
        } else if (postcount === 2) {
            $("#first").css("display", "none");
            $("#second").css("display", "none");
            $("#third").css("display", "none");
            $("#fourth").css("display", "block");
            $(".next").css("display", "none");
            $(".nextsubmit").css("display", "block");
        }
    }

    $("#submit").click(function() {
        var Name = $("#Name").text();
        var Email = $("#Email").text();
        var car = $("#Car").val();
        var from = ($("#From").val()).trim();
        var to = ($("#To").val()).trim();
        var via = ($("#via").val()).trim();
        var place1 = ($("#Places1").val()).trim();
        var place2 = ($("#Places2").val()).trim();
        var date = $("#Date").val();
        var time = ($("#Time").val()).trim();
        var lugg = $("#luggage").val();
        var seat = Number($("#seats").val());
        var nDate = new Date().toString();
        var flux = $("#flux").val();
        var Travel_type = $("#Travel_type").val();
        var male = Number($("#male").val());
        var female = Number($("#female").val());
        var child = Number($("#child").val());
        var list = nDate.split(" ");
        var asdf = list[0] + ", " + list[1] + " " + list[2] + " " + list[3] + " " + list[4];
        var my_obj = {'Name': Name,
            'Email': Email,
            'CarModel': car,
            'From': from,
            'To': to,
            'Via':via,
            'PostingTime': asdf,
            'StartingTime': date + " " + time,
            'StartingPlaces': place1,
            'StopingPlaces': place2,
            'Flux': flux,
            'NumberOFSeats': seat,
            'Luggage': lugg,
            'Travel_type': Travel_type,
            'Male': male,
            'Female': female,
            'Child': child,
            'CarPath':"",
            'Private_Driver':'No'
        };

        if (($("#carImage").val()).length > 0) {
            var checkbox = document.getElementById("chkPrivate");
            if(checkbox.checked) {
                my_obj.Private_Driver="Yes";
            }
            $.post('/addaRide',
                my_obj,
                function(data, status) {
                    if (data === 'ok') {
                        document.getElementById("CarImage").submit();
                    } else if(data=="<script>location.href='/404_not_found_page'</script>") {
                        location.href="/404_not_found_page";
                    }else if(data=="<script>location.href='/home'</script>") {
                        location.href="/home";
                    } else {
                        $("#error").text(data);
                    }
                });
        } else {
            $("#error").text("Upload your Car image");
        }

    });
    
    
    $("#Travel_type").click(function(){
        var a = $("#Travel_type").val();
        if(a=="Ladies Only"){
            $("#male").css("display", "none");
            $("#female").css("display", "block");
            $("#child").css("display", "block");
            $("#third > input").css("margin-left", "5%");
            $("#third > input").css("margin-bottom", "3%");
        } else if(a=="Gents Only"){
            $("#female").css("display", "none");
            $("#male").css("display", "block");
            $("#child").css("display", "block");
            $("#third > input").css("margin-left", "5%");
            $("#third > input").css("margin-bottom", "3%");
        } else {
            $("#female").css("display", "block");
            $("#male").css("display", "block");
            $("#child").css("display", "block");
            $("#third > input").css("margin-left", "5%");
            $("#third > input").css("margin-bottom", "3%");
        }
    });
});