$(document).ready(function() {
    
    setprofile();
    
    function setprofile() {
        var testhtml = document.getElementById("profileheader").innerHTML;
        var handlebars = Handlebars.compile(testhtml);
         $.post("/getImage",function(reply,status){
             var object = JSON.parse(reply);
             var okdata = handlebars(object);
             document.getElementById("setProfile").innerHTML=okdata;
             getMyPost();
         });
    }
    
    function getMyPost() {
        var testhtml = document.getElementById("htmlscript").innerHTML;
        var handlebars = Handlebars.compile(testhtml);
        $.post("/sendPostDetail", function(data, status){
            var srtplace = "";
            var stoplace = "";
            var object = JSON.parse(data);
            var okdata = handlebars(object);
            document.getElementById("reEntetPost").innerHTML=okdata;
            $("#flux").val(object.Flux);
            $("#Travel_type").val(object.Travel_type);
            $("#Date").val((object.StartingTime).split(" ")[0]);
            $("#Time").val((object.StartingTime).split(" ")[1]);
            $("#seats").val(object.NumberOFSeats);
            $("#Car").val(object.CarModel);
            $("#luggage").val(object.Luggage);
            for(var i=0;i<(object.StartingPlaces).length;i+=1) {
                if(i==(object.StartingPlaces).length-1) {
                    srtplace+=(object.StartingPlaces)[i];
                    $("#Places1").val(srtplace);
                } else {
                    srtplace = srtplace+(object.StartingPlaces)[i]+",";
                }
            }
            
            
            for (var j=0; j<(object.StopingPlaces).length; j+=1) {
                if(j==(object.StopingPlaces).length-1) {
                    stoplace+=(object.StopingPlaces)[j];
                    $("#Places2").val(stoplace);
                } else {
                    stoplace = stoplace+(object.StopingPlaces)[j]+",";
                }
            }
        });
    }
    
    var postcount = -1;
    $(document).on("click",".next",function() {
        if (postcount < 2) {
            postcount += 1;
        }
        postChange(postcount);
    });
    $(document).on("click",".previous",function() {
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
    $(document).on("click","#submit",function() {
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
            $.post('/editMyPost',
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