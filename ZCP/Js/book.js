$(document).ready(function(){
    getThisRideDetail();
    $(document).on("click", ".plusone", function(){
        $(".sndbook > .extraone").css("display","inline-flex");
        $(".plustwo , .canone").css("display","inline-block");
    });
    $(document).on("click", ".canone", function(){
        $(".sndbook > .extraone").css("display","none");
        $(".plustwo , .canone").css("display","none");
    });
    $(document).on("click", ".plustwo", function(){
        $(".sndbook > .extratwo").css("display","inline-flex");
        $(".plustwo , .cantwo").css("display","inline-block");
    });
    $(document).on("click", ".cantwo", function(){
        $(".sndbook > .extratwo").css("display","none");
        $(".cantwo").css("display","none");
    });
    $(document).on("click", "#home", function(){
        location.href="/zcp.zoho.com/home";
    });
    $(document).on("click", ".book", function(){
        var Name = $("#Name").text();
        var Email = $("#Email").text();
        var Id = $(this).attr("data-ember-action");
        var Pickup = $("#Pickup").val();
        var Drop = $("#Drop").val();
        var NoOfSeats = Number(($("#seat").val()).trim());
        var personname1 = ($("#ex_name1").val()).trim();
        var personage1 = ($("#ex_age1").val()).trim();
        var personname2 = ($("#ex_name2").val()).trim();
        var personage2 = ($("#ex_age2").val()).trim();
        var bookObj = {'Name':Name,'Email':Email,'Id':Id, 'Pickup':Pickup,'Drop':Drop, 'NoOfSeats':NoOfSeats, 'PersonName1':personname1, 'PersonName2':personname2, 'PersonAge1':personage1, 'PersonAge2':personage2};
        $.post("/BookARide", bookObj, function (data, status){
            if (data === "booked") {
                location.href = "/zcp.zoho.com";
            } else if(data=="<script>location.href='/home'</script>") {
                location.href ="/home";
            } else if(data=="<script>location.href='/404_not_found_page'</script>") {
                location.href ="/404_not_found_page";
            } else {
                $(".error").text(data);
            }
        });
    });
    function getThisRideDetail() {
        $.post("/getThisRideDetail", function(data, status){
            var list1 = [];
            var list2 = [];
            var testhtml = document.getElementById("booking").innerHTML;
            var handlebars = Handlebars.compile(testhtml);
            if(data.indexOf('{"Name":')!==-1) {
                var result = JSON.parse(data);
                var startlist = result.StartingPlaces;
                var stoplist = result.StopingPlaces;
                for(var i of startlist) {
                    var Place = {};
                    Place.Place = i;
                    list1.push(Place);
                }
                for(var j of stoplist) {
                    var Place1 = {};
                    Place1.Place = j;
                    list2.push(Place1);
                }
                var startObj = {'street':list1};
                var stopObj = {'street':list2};
                delete result.StopingPlaces;
                delete result.StartingPlaces;
                var values = handlebars(result);
                $("#bookPage").html(values);
                var start = document.getElementById("Options").innerHTML;
                var handlebars1 = Handlebars.compile(start);
                var values1 = handlebars1(startObj);
                var values2 = handlebars1(stopObj)
                $("#Pickup").html(values1);
                $("#Drop").html(values2);
            } else if(data =="<script>location.href='/404_not_found_page'</script>") {
                location.href = "/404_not_found_page";
            }
        });
    }
 });