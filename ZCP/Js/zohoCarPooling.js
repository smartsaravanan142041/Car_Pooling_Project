var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var redis = require('redis');
var request = require('request');
var formidable = require('formidable');
var path = require('path');
var ride_id = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
var htmlFile = "";
var ip = require("ip");


var client = redis.createClient();

http.createServer(carPolling).listen(8080);

client.on('connect', function() {
    console.log("Connected");
});

function carPolling(req, res) {
    try {
        cookie = req.headers.cookie;
        if (req.url === "/addProFile" && cookie !== undefined && req.method == "POST") {
            client.hget('cookieDetail', cookie, function(err, reply) {
                var form = new formidable.IncomingForm();
                form.parse(req, function(err, fields, files) {
                    files.filetoupload.name = reply + '.png';
                    var oldpath = files.filetoupload.path;
                    var newpath = path.resolve(__dirname, '../proFilePhoto', files.filetoupload.name);
                    var pathlist = newpath.split('/Car_Pooling_Project');
                    var image_resource = 'https://zohocarpooling.zcodeusers.com' + pathlist[1];
                    var image = fs.readFileSync(oldpath);
                    fs.writeFileSync(newpath, image);
                    client.hget('userdb', reply, function(err, result) {
                        var userdb = JSON.parse(result);
                        userdb.Path = image_resource;
                        client.hset('userdb', reply, JSON.stringify(userdb));
                        res.end("<script>location.href='/zcp.zoho.com/home'</script>");
                    });
                });
            });
        } else if (req.url === "/addCarImage" && cookie !== undefined && req.method == "POST") {
            client.hget('cookieDetail', cookie, function(err, reply) {
                var imageName = "";
                var form = new formidable.IncomingForm();
                form.parse(req, function(err, fields, files) {
                    for (var i = 0; i < 7; i += 1) {
                        imageName += ride_id[Math.floor(Math.random() * ride_id.length)];
                    }
                    files.carImage.name = imageName + '.png';
                    var oldpath = files.carImage.path;
                    var newpath = path.resolve(__dirname, '../carImage', files.carImage.name);
                    var pathlist = newpath.split('/Car_Pooling_Project');
                    var image_resource = 'https://zohocarpooling.zcodeusers.com' + pathlist[1];
                    var image = fs.readFileSync(oldpath);
                    fs.writeFileSync(newpath, image);
                    client.lrange('ride_Post', 0, -1, function(err, result) {
                        for (var i of result) {
                            var object = JSON.parse(i);
                            if (reply == object.Email && object.CarPath === "") {
                                var rideName = object.Email + "'sRides";
                                var Id = object.Id;
                                object.CarPath = image_resource;
                                client.lrem('ride_Post', 1, i);
                                client.lpush('ride_Post', JSON.stringify(object));
                                client.lrem(rideName, 1, i);
                                client.lpush(rideName, JSON.stringify(object));
                                client.hset('ride_id', Id, JSON.stringify(object));
                                res.end("<script>location.href='/zcp.zoho.com/home'</script>");
                            }
                        }
                    });
                });
            });
        } else if (req.method == "POST") {
            var body = "";
            req.on('data', function(chunk) {
                body += chunk;
            });
            req.on('end', function() {
                requestValue(body);
            });
        } else if (req.url === "/home" && cookie === undefined) {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            htmlFile = fs.readFileSync('../Html/signin_signup.html');
            res.write(htmlFile);
            res.end();
        } else if (req.url === "/home/next" && cookie !== undefined) {
            client.hget('cookieDetail', cookie, function(err, reply) {
                if (reply !== null) {
                    client.hget('userdb', reply, function(err, result) {
                        if (JSON.parse(result).Status === "Failure") {
                            res.writeHead(200, {
                                'Content-Type': 'text/html'
                            });
                            htmlFile = fs.readFileSync("../Html/verify.html");
                            res.write(htmlFile);
                            res.end();
                        } else {
                            res.end("<script>location.href='/zcp.zoho.com/home'</script>");
                        }
                    });
                } else {
                    res.end("<script>location.href='/404_not_found_page'</script>");
                }
            });
        } else if (req.url === "/zcp.zoho.com/home" && cookie !== undefined) {
            checkvalue(cookie);
        } else if (req.url === "/bookingPage" && cookie !== undefined) {
            checkvalue(cookie);
        } else if (req.url === "/add_my_ride" && cookie !== undefined) {
            checkvalue(cookie);
        } else if (req.url === "/editPost" && cookie !== undefined) {
            checkvalue(cookie);
        } else if (req.url == "/404_not_found_page") {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            htmlFile = fs.readFileSync('../Html/Error.html');
            res.write(htmlFile);
            res.end();
        } else if (req.url === "/resendotp" && cookie !== undefined) {
            verify(cookie);
        } else if (req.url === "/forgotMyPassword" && cookie !== undefined) {
            client.hget('forgotDetail', cookie, function(err, reply) {
                client.hget("userdb", reply, function(err, result) {
                    if (result === null) {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    } else {
                        res.writeHead(200, {
                            'Content-Type': 'text/html'
                        });
                        htmlFile = fs.readFileSync('../Html/forgotPass.html');
                        res.write(htmlFile);
                        res.end();
                    }
                });
            });
        } else {
            if (cookie === undefined) {
                res.end("<script>location.href='/home'</script>");
            } else {
                res.end("<script>location.href='/zcp.zoho.com/home'</script>");
            }
        }
    } catch (e) {
        res.end("<script>location.href='/404_not_found_page'</script>");
    }

    function requestValue(body) {
        try {
            var query = qs.parse(body);

            if (req.url === "/createacc" && cookie === undefined) {

                var checkname = /^[a-zA-Z0-9]([a-z0-9\s._]?[a-zA-Z0-9]){2,20}$/gi;
                var mail = /^[a-z]([a-z0-9._]?[a-z0-9]){2,15}@([a-z]){4,8}.([a-z]){3,5}$/gi;
                var ph = /^[6-9]{1}[0-9]{9}$/g;
                var check = false;
                var name = query.Name;
                var email = query.Email;
                var password = query.Password;
                var re_password = query.Re_Password;
                var phone = query.Phone;

                client.hget('userdb', email, function(err, reply) {
                    if (reply === null) {
                        if (name.length > 0 && email.length > 0 && password.length > 0 && re_password.length > 0 && phone.length > 0) {
                            if (password === re_password) {
                                if (password.length > 7) {
                                    if (checkname.test(name)) {
                                        if (mail.test(email)) {
                                            check = true;
                                            if (ph.test(phone)) {
                                                signup(query);
                                            } else {
                                                res.write("Enter Proper your phone number");
                                                res.end();
                                            }
                                        } else {
                                            res.write("Enter Proper your Email");
                                            res.end();
                                        }
                                    } else {
                                        res.write("Enter Proper your Name");
                                        res.end();
                                    }
                                } else {
                                    res.end("Password have minimum 8 characters")
                                }
                            } else {
                                res.end("Re-enter password is wrong");
                            }
                        } else {
                            res.end("Enter all values");
                        }
                    } else {
                        res.write("This email address is already exists");
                        res.end();
                    }
                });
            } else if (req.url === "/login" && cookie === undefined) {
                client.hget('userdb', query.Email, function(err, reply) {
                    if (reply === null) {
                        res.write("In-valid User");
                        res.end();
                    } else {
                        reply = JSON.parse(reply);
                        if (query.Password == reply.Password && reply.Status === 'Success') {
                            cookie = 'Myacc=user' + Math.floor(Math.random() * 10000000);
                            res.writeHead(200, {
                                'Set-Cookie': cookie + '; HttpOnly'
                            });
                            client.hset('cookieDetail', cookie, query.Email);
                            res.write("ok");
                            res.end();
                        } else if (query.Password == reply.Password && reply.Status === 'Failure') {
                            cookie = 'Myacc=user' + Math.floor(Math.random() * 10000000);
                            res.writeHead(200, {
                                'Set-Cookie': cookie + '; HttpOnly'
                            });
                            client.hset('cookieDetail', cookie, query.Email);
                            verify(cookie);
                        } else {
                            res.write("Password is wrong");
                            res.end();
                        }
                    }
                });
            } else if (req.url === "/verify" && cookie !== undefined) {
                var username = query.check_name;
                var gender = query.Gender;
                var type = query.Type;
                var dob = query.DOB;
                var dobYear = dob.substring(0, dob.indexOf("-"));
                var nDate = new Date();
                var thisYear = nDate.getFullYear();
                var age = thisYear - dobYear;

                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply === null) {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    } else {
                        client.hget("userdb", reply, function(err, result) {
                            var object = JSON.parse(result);
                            var otp = query.otp;
                            var date = object.DOB;
                            if (result !== null && username == object.Name) {
                                client.get(reply, function(err, returnval) {
                                    if (query.otp == returnval) {
                                        if (gender !== undefined && type !== undefined) {
                                            if (age > 17 && age < 71) {
                                                object.Status = "Success";
                                                object.Gender = gender;
                                                object.DOB = dob;
                                                object.Age = age;
                                                object.Type = type;
                                                client.hset("userdb", reply, JSON.stringify(object));
                                                client.del(reply);
                                                res.write("go_to_home");
                                                res.end();
                                            } else if (age < 18 && age > 70) {
                                                res.write("The Date of birth is in-valid");
                                                res.end();
                                            } else {
                                                res.write("Enter Proper your Date of Birth");
                                                res.end();
                                            }
                                        } else {
                                            $(".errordiv").text("Enter Proper your Position (or) Gender");
                                        }
                                    } else if (returnval !== null) {
                                        res.write("OTP is wrong");
                                        res.end();
                                    } else {
                                        res.write("poo");
                                        res.end();
                                    }
                                });
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    }
                });
            } else if (req.url === "/getMyDetail" && cookie !== undefined) {
                var name = query.Name;
                var email = query.Email;
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply == email) {
                        client.hget('userdb', email, function(err, result) {
                            var result = JSON.parse(result);
                            if (result.Name == query.Name) {
                                res.end(JSON.stringify({
                                    'Name': result.Name,
                                    'Phone': result.Phone,
                                    'Married_Status': result.Married_Status,
                                    'Nick_Name': result.Nick_Name,
                                    "Type": result.Type,
                                    'Personal_Email': result.Personal_Email
                                }));
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/EditMyDetail" && cookie !== undefined) {
                var name = query.Name;
                var email = query.Email;
                var boolean = 'true';
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply == email) {
                        client.hget('userdb', email, function(err, result) {
                            var result = JSON.parse(result);
                            if (result.Name == query.Name) {
                                if ((query.Phone).length > 0) {
                                    if ((query.Personal_Email).length > 0) {
                                        if ((/^[a-z]([a-z0-9._]?[a-z0-9]){2,15}@([a-z]){4,8}.([a-z]){3,5}$/gi).test(query.Personal_Email)) {
                                            boolean = 'true';
                                        } else {
                                            boolean = 'false';
                                        }
                                    }
                                    if (query.Married_Status == "Married-Status" || query.Married_Status == "Married" || query.Married_Status == "Single" || query.Married_Status == "") {
                                        boolean = 'true';
                                    } else {
                                        boolean = 'false';
                                    }
                                }
                                if ((query.Type != "Are You" && query.Type == "Car-Owner" || query.Type == "Co-Traveller" || query.Type == "Private Driver")) {
                                    if ((/^[6-9]{1}[0-9]{9}$/g).test(query.Phone) && boolean == "true") {
                                        result.Nick_Name = query.Nick_Name;
                                        result.Phone = query.Phone;
                                        result.Married_Status = query.Married_Status;
                                        result.Type = query.Type;
                                        result.Personal_Email = query.Personal_Email;
                                        client.hset('userdb', email, JSON.stringify(result));
                                        res.end("done");
                                    } else {
                                        res.end("Enter correct Details");
                                    }
                                } else {
                                    res.end("Enter your correct Role")
                                }
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/addmypost" && cookie !== undefined) {
                var name = query.Name;
                var email = query.Email;
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply == email) {
                        client.hget('userdb', email, function(err, result) {
                            var result = JSON.parse(result);
                            if (name == result.Name) {
                                res.end("ok change");
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/go_to_ride" && cookie !== undefined) {
                var name = query.Name;
                var email = query.Email;
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply == email) {
                        client.hget('userdb', reply, function(err, result) {
                            if (name == (JSON.parse(result).Name)) {
                                res.end('true');
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/addaRide" && cookie !== undefined || req.url === "/editMyPost") {
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply == query.Email) {
                        client.hget('userdb', reply, function(err, result) {
                            if (query.Name == JSON.parse(result).Name) {
                                if (JSON.parse(result).Type === 'Car-Owner') {
                                    var checkDate = new Date();
                                    var todayDate = checkDate.getDate() + 2;
                                    var thisMonth = Number(checkDate.getMonth()) + 1;
                                    var thisYear = checkDate.getFullYear();
                                    var a = 'false';
                                    var list = [];
                                    var thisDate = (query.StartingTime).split(" ");
                                    var timecheck = thisDate[1];
                                    var timeList = timecheck.split(":");
                                    var DateCheck = (thisDate[0]).split("-");
                                    query.StopingPlaces = (query.StopingPlaces).split(",");
                                    query.StartingPlaces = (query.StartingPlaces).split(",");
                                    query.AvailableSeats = query.NumberOFSeats - 1;
                                    if ((query.From).length > 0 && (query.CarModel).length > 0 && (query.To).length > 0 && (query.PostingTime).length > 0 && (query.StartingTime).length > 0 && (query.StartingPlaces).length > 0 && (query.StopingPlaces).length > 0 && Number(query.NumberOFSeats) > 0 && (query.Luggage).length > 0 && (query.Travel_type).length > 0 && (query.Via).length > 0) {
                                        if ((DateCheck[2] <= todayDate && DateCheck[1] <= thisMonth && DateCheck[0] <= thisYear)) {
                                            res.end("Enter the proper Date for your travel");
                                        } else {
                                            if (((/^\d{1,2}:\d{2}$/g).test(timecheck))) {

                                                if (query.From !== query.To) {
                                                    if ((query.Travel_type) == "Ladies Only" || query.Travel_type == "Gents Only" || query.Travel_type == "Combined") {
                                                        if ((/^\w*$/g).test(query.From) && (/^\w*$/g).test(query.To)) {
                                                            if (query.NumberOFSeats > 2 && query.NumberOFSeats < 11) {
                                                                if (query.Luggage == "Less" || query.Luggage == "Medium" || query.Luggage == "Large") {
                                                                    if (query.Flux == "10 mins" || query.Flux == "20 mins" || query.Flux == "30 mins") {
                                                                        if ((query.Travel_type == "Ladies Only" && query.Male == 0 && (/^\d+.\d*$/g).test(query.Female) && (/^\d+.\d*$/g).test(query.Child)) || (query.Travel_type == "Gents Only" && query.Female == 0 && (/^\d+.\d*$/g).test(query.Male) && (/^\d+.\d*$/g).test(query.Child)) || ((query.Travel_type == "Combined" && (/^\d+.\d*$/g).test(query.Male) && (/^\d+.\d*$/g).test(query.Female) && (/^\d+.\d*$/g).test(query.Child)))) {
                                                                            a = 'true';
                                                                        }
                                                                        if ((Number(timeList[0]) > -1 && Number(timeList[0]) < 24) && (Number(timeList[1]) > -1 && Number(timeList[1]) < 60)) {
                                                                            if ((query.Travel_type == "Gents Only" && Number(query.Male) > Number(query.Child)) || (query.Travel_type == "Ladies Only" && Number(query.Female) > Number(query.Child)) || (query.Travel_type == "Combined" && Number(query.Male) > Number(query.Female) && Number(query.Female) > Number(query.Child))) {
                                                                                if (a === 'true') {
                                                                                    request.post({
                                                                                            url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + query.From + "&key=AIzaSyD__UHxocTk9SKma7zXERGMyqhFdUktpPI"
                                                                                        },
                                                                                        function(err, responce, body) {
                                                                                            var body = JSON.parse(body);
                                                                                            if (body.status !== "ZERO_RESULTS" && (body.results).length !== 0) {
                                                                                                var id1 = body.results[0].place_id;
                                                                                                var place1_1 = (body.results[0].address_components[0].long_name);
                                                                                                var place1_2 = (body.results[0].address_components[0].short_name);
                                                                                                if (place1_1.toLowerCase() == query.From.toLowerCase() || place1_2.toLowerCase() == query.From.toLowerCase()) {
                                                                                                    request.post({
                                                                                                            url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + query.To + "&key=AIzaSyD__UHxocTk9SKma7zXERGMyqhFdUktpPI"
                                                                                                        },
                                                                                                        function(err, responce, body) {
                                                                                                            var body = JSON.parse(body);
                                                                                                            if (body.status !== "ZERO_RESULTS" && (body.results).length !== 0) {
                                                                                                                var id2 = body.results[0].place_id;
                                                                                                                var place2_1 = body.results[0].address_components[0].long_name;
                                                                                                                var place2_2 = body.results[0].address_components[0].short_name;
                                                                                                                if (place2_1.toLowerCase() == query.To.toLowerCase() || place2_2.toLowerCase() == query.To.toLowerCase()) {
                                                                                                                    request.post({
                                                                                                                            url: "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + query.From + "&destinations=" + query.To
                                                                                                                        },
                                                                                                                        function(err, responce, body) {
                                                                                                                            var body = JSON.parse(body);
                                                                                                                            var myride = query.Email + "'sRide";
                                                                                                                            var myrides = query.Email + "'sRides"
                                                                                                                            client.lrange(myride, 0, -1, function(err, reply) {
                                                                                                                                if (req.url === "/addaRide") {
                                                                                                                                    if (reply.length != 0) {
                                                                                                                                        for (i of reply) {
                                                                                                                                            if (i.indexOf(thisDate[0]) !== -1) {
                                                                                                                                                a = 'false';
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                    editThis();
                                                                                                                                } else {
                                                                                                                                    client.hget('cookieRideId', cookie, function(err, getId) {
                                                                                                                                        if (getId !== null) {
                                                                                                                                            client.hget('ride_id', getId, function(err, stringobject) {
                                                                                                                                                if (reply.length > 0) {
                                                                                                                                                    for (i of reply) {
                                                                                                                                                        var oneDate = i.split(" ");
                                                                                                                                                        if (i.split(" ")[0] === thisDate[0]) {
                                                                                                                                                            if (((JSON.parse(stringobject).StartingTime).split(" ")[0]) === oneDate[0]) {
                                                                                                                                                                editThis();
                                                                                                                                                            } else {
                                                                                                                                                                a = 'false';
                                                                                                                                                                editThis();
                                                                                                                                                            }
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                    editThis();
                                                                                                                                                }
                                                                                                                                            });
                                                                                                                                        } else {
                                                                                                                                            res.end("");
                                                                                                                                        }
                                                                                                                                    });
                                                                                                                                }

                                                                                                                                function editThis() {
                                                                                                                                    if (a === 'true') {
                                                                                                                                        if (req.url === "/editMyPost") {
                                                                                                                                            var ride = query.Email + "'sRide";
                                                                                                                                            var rides = query.Email + "'sRides";
                                                                                                                                            client.hget('cookieRideId', cookie, function(err, getId) {
                                                                                                                                                if (getId !== null) {
                                                                                                                                                    client.hget('ride_id', getId, function(err, stringobject) {
                                                                                                                                                        client.lrem('ride_Post', 1, stringobject);
                                                                                                                                                        client.lrem(rides, 1, stringobject);
                                                                                                                                                        client.lrem(ride, 1, (JSON.parse(stringobject).StartingTime));
                                                                                                                                                        client.hdel('ride_id', getId);
                                                                                                                                                    });
                                                                                                                                                }
                                                                                                                                            });
                                                                                                                                        }
                                                                                                                                        var id = "";
                                                                                                                                        var ownerImage = JSON.parse(result).Path;
                                                                                                                                        if (ownerImage == "https://zohocarpooling.zcodeusers.comundefined" || ownerImage == "") {
                                                                                                                                            ownerImage = "https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg"
                                                                                                                                        }
                                                                                                                                        for (i = 0; i < 8; i += 1) {
                                                                                                                                            var my_number = Math.floor(Math.random() * ride_id.length)
                                                                                                                                            id += ride_id[my_number];
                                                                                                                                        }
                                                                                                                                        var timeList = (body.rows[0].elements[0].duration.text).split(" ");
                                                                                                                                        query.Distance = body.rows[0].elements[0].distance.text;
                                                                                                                                        query.Duration = body.rows[0].elements[0].duration.text;
                                                                                                                                        query.Id = id;
                                                                                                                                        query.Image = ownerImage;
                                                                                                                                        query.Riders = {};
                                                                                                                                        query.Rating = {};
                                                                                                                                        //client.hset('cookieRideId', cookie, id);
                                                                                                                                        client.hset('ride_id', id, JSON.stringify(query));
                                                                                                                                        client.lpush('ride_Post', JSON.stringify(query));
                                                                                                                                        client.lpush(myride, query.StartingTime);
                                                                                                                                        client.lpush(myrides, JSON.stringify(query));
                                                                                                                                        res.end("ok");
                                                                                                                                    } else {
                                                                                                                                        res.end("Already you booked on this date. So, change the date");
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            });
                                                                                                                        });
                                                                                                                } else if (place2_1.toLowerCase() == place2_2.toLowerCase()) {
                                                                                                                    res.end("Did you mean: " + place2_1 + "?");
                                                                                                                } else {
                                                                                                                    res.end(JSON.stringify("Did you mean: " + place2_1 + ", " + place2_2 + "?"));
                                                                                                                }
                                                                                                            } else {
                                                                                                                res.end("Please enter your correct ending point");
                                                                                                            }
                                                                                                        });
                                                                                                } else if (place1_1.toLowerCase() == place1_2.toLowerCase()) {
                                                                                                    res.end(("Did you mean: " + place1_1 + "?"));
                                                                                                } else {
                                                                                                    res.end(JSON.stringify("Did you mean: " + place1_1 + ", " + place1_2 + "?"));
                                                                                                }
                                                                                            } else {
                                                                                                res.end("Please enter your correct starting point");

                                                                                            }
                                                                                        });
                                                                                } else {
                                                                                    res.end("Enter proper prices in given input");
                                                                                }
                                                                            } else {
                                                                                res.end("Enter proper prices in given Persons")
                                                                            }
                                                                        } else {
                                                                            res.end("Time was wrong. so, Enter proper Time");
                                                                        }
                                                                    } else {
                                                                        res.end("Enter proper your flexibility time")
                                                                    }
                                                                } else {
                                                                    res.end("Enter the proper value in Luggage");
                                                                }
                                                            } else {
                                                                res.end("Enter the correct count of seat");
                                                            }
                                                        } else {
                                                            res.end("Please enter your correct starting point (or) stoping point");
                                                        }
                                                    } else {
                                                        res.end("Enter proper your Travel Type");
                                                    }
                                                } else {
                                                    res.end("From and to are same. So, change the places");
                                                }
                                            } else {
                                                res.end("Time was wrong. So set correct time");
                                            }
                                        }
                                    } else {
                                        res.end("Enter all values");
                                    }
                                } else {
                                    res.end("You are Not Car Owner. So, You can't post a ride");
                                }
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/EditMyPost" && cookie !== undefined) {
                client.hget('cookieDetail', cookie, function(err, myemail) {
                    if (myemail == query.Email) {
                        client.hget('userdb', myemail, function(err, myObject) {
                            if (query.Name == JSON.parse(myObject).Name) {
                                client.hget('ride_id', query.Id, function(err, myPost) {
                                    if (query.Email == JSON.parse(myPost).Email) {
                                        client.hset('cookieRideId', cookie, query.Id);
                                        var checkDate = new Date();
                                        var todayDate = checkDate.getDate() + 1;
                                        var thisMonth = Number(checkDate.getMonth()) + 1;
                                        var thisYear = checkDate.getFullYear();
                                        var thisDate = ((JSON.parse(myPost)).StartingTime).split(" ")[0];
                                        var DateCheck = (thisDate).split("-");
                                        if ((Number(JSON.parse(myPost).NumberOFSeats)) - (Number(JSON.parse(myPost).AvailableSeats)) === 1) {
                                            if (DateCheck[2] <= todayDate && DateCheck[1] <= thisMonth && DateCheck[0] <= thisYear) {
                                                res.end("Edit date was already expire, So you can't edit this post");
                                            } else {
                                                res.end("true");
                                            }
                                        } else {
                                            res.end("Your post was already booked. So, You can't edit this post.");
                                        }
                                    } else {
                                        res.end("<script>location.href='/404_not_found_page'</script>");
                                    }
                                });
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/sendPostDetail" && cookie !== undefined) {
                client.hget('cookieDetail', cookie, function(err, myemail) {
                    if (myemail !== null) {
                        client.hget('cookieRideId', cookie, function(err, id) {
                            if (id !== null) {
                                client.hget('ride_id', id, function(err, ridePost) {
                                    if (myemail == JSON.parse(ridePost).Email) {
                                        res.end(ridePost);
                                    } else {
                                        res.end("<script>location.href='/404_not_found_page'</script>");
                                    }
                                });
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }

                });
            } else if (req.url === "/deleteMyPost" && cookie !== undefined) {
                client.hget('cookieDetail', cookie, function(err, value) {
                    if (value == query.Email) {
                        client.hget('userdb', query.Email, function(err, details) {
                            if (query.Name == (JSON.parse(details).Name)) {
                                client.hget('ride_id', query.Id, function(err, post) {
                                    if (post !== null) {
                                        if (value == (JSON.parse(post)).Email) {
                                            var checkDate = new Date();
                                            var todayDate = checkDate.getDate() + 1;
                                            var thisMonth = Number(checkDate.getMonth()) + 1;
                                            var thisYear = checkDate.getFullYear();
                                            var thisDate = ((JSON.parse(post)).StartingTime).split(" ")[0];
                                            var DateCheck = (thisDate).split("-");
                                            if ((Number(JSON.parse(post).NumberOFSeats)) - (Number(JSON.parse(post).AvailableSeats)) === 1) {
                                                if (DateCheck[2] <= todayDate && DateCheck[1] <= thisMonth && DateCheck[0] <= thisYear) {
                                                    res.end("Delete date was already expire, So you can't delete this post");
                                                } else {
                                                    var ride = query.Email + "'sRide";
                                                    var rides = query.Email + "'sRides";
                                                    client.lrem('ride_Post', 1, post);
                                                    client.lrem(rides, 1, post);
                                                    client.lrem(ride, 1, JSON.parse(post).StartingTime);
                                                    client.hdel('ride_id', query.Id);
                                                    res.end("deleted");
                                                }
                                            } else {
                                                res.end("Your post was already booked. So, You can't delete this post.");
                                            }
                                        } else {
                                            res.end("<script>location.href='/404_not_found_page'</script>");
                                        }
                                    } else {
                                        res.end("<script>location.href='/404_not_found_page'</script>");
                                    }
                                });
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/findMyRide" && cookie !== undefined) {
                var ride_list = [];
                var Name = query.Name;
                var Email = query.Email;
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply !== null && reply == Email) {
                        client.hget('userdb', reply, function(err, result) {
                            if (Name == JSON.parse(result).Name) {
                                if ((query.from).length > 0 && (query.to).length > 0) {
                                    request.post({
                                            url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + query.from + "&key=AIzaSyD__UHxocTk9SKma7zXERGMyqhFdUktpPI"
                                        },
                                        function(err, responce, body) {
                                            var body = JSON.parse(body);
                                            if (body.status !== "ZERO_RESULTS" && (body.results).length !== 0) {
                                                var id1 = body.results[0].place_id;
                                                var place1_1 = (body.results[0].address_components[0].long_name);
                                                var place1_2 = (body.results[0].address_components[0].short_name);

                                                if (place1_1.toLowerCase() == (query.from).toLowerCase() || place1_2.toLowerCase() == (query.from).toLowerCase()) {
                                                    request.post({
                                                            url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + query.to + "&key=AIzaSyD__UHxocTk9SKma7zXERGMyqhFdUktpPI"
                                                        },
                                                        function(err, responce, body) {
                                                            var body = JSON.parse(body);
                                                            if (body.status !== "ZERO_RESULTS" && (body.results).length !== 0) {
                                                                var id2 = body.results[0].place_id;
                                                                var place2_1 = body.results[0].address_components[0].long_name;
                                                                var place2_2 = body.results[0].address_components[0].short_name;
                                                                if (place2_1.toLowerCase() == (query.to).toLowerCase() || place2_2.toLowerCase() == (query.to).toLowerCase()) {
                                                                    client.lrange('ride_Post', 0, -1, function(err, reply) {
                                                                        if (reply.length === 0) {
                                                                            res.end("no_results");
                                                                        } else {
                                                                            for (i of reply) {
                                                                                var list = JSON.parse(i);
                                                                                if ((list.From).toLowerCase() === (query.from).toLowerCase() && (list.To).toLowerCase() == (query.to).toLowerCase()) {
                                                                                    ride_list.push(list);
                                                                                    if (list.Email == Email) {
                                                                                        list.Me = "yes";
                                                                                    } else {
                                                                                        var a = list.Riders;
                                                                                        for (var k of a) {
                                                                                            if (k == Email) {
                                                                                                list.Book = "Yes";
                                                                                            }
                                                                                        }
                                                                                        if (list.Book != "Yes") {
                                                                                            if (list.AvailableSeats == 0) {
                                                                                                list.Book = "Full";
                                                                                            } else {
                                                                                                list.Book = "No";
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                            if (ride_list.length === 0) {
                                                                                res.end("no_results");
                                                                            } else {
                                                                                res.end(JSON.stringify({
                                                                                    'post': ride_list
                                                                                }));
                                                                            }
                                                                        }
                                                                    });
                                                                } else {
                                                                    res.end("Did you mean: " + place2_1 + " (or) " + place2_2);
                                                                }
                                                            } else {
                                                                res.end("Enter your exact 2nd city");
                                                            }
                                                        });
                                                } else {
                                                    res.end("Did you mean: " + place1_1 + " (or) " + place1_2)
                                                }
                                            } else {
                                                res.end("Enter your exact 1st city");
                                            }
                                        });
                                } else {
                                    res.end("Enter all values");
                                }
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/joinWithARide" && cookie !== undefined) {
                var check = 'true';
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply == query.Email) {
                        client.hget('userdb', reply, function(err, returnval) {
                            if (JSON.parse(returnval).Name == query.Name) {
                                client.hget('ride_id', query.Id, function(err, result) {
                                    if (result !== null) {
                                        if (query.Email == JSON.parse(result).Email) {
                                            res.end("You are owner of the post. So, you can't book this post");
                                        } else {
                                            var checkDate = new Date();
                                            var todayDate = checkDate.getDate() + 1;
                                            var thisMonth = Number(checkDate.getMonth()) + 1;
                                            var thisYear = checkDate.getFullYear();
                                            var thisDate = ((JSON.parse(result)).StartingTime).split(" ")[0];
                                            var DateCheck = (thisDate).split("-");
                                            if (DateCheck[2] <= todayDate && DateCheck[1] <= thisMonth && DateCheck[0] <= thisYear) {
                                                res.end("Booking date was already expire, So you can't book this ride");
                                            } else {
                                                if (JSON.parse(result).AvailableSeats !== 0) {
                                                    myride = query.Email + "'sRide";
                                                    client.lrange(myride, 0, -1, function(err, list) {
                                                        if (list.length !== 0) {
                                                            for (i of list) {
                                                                if (i.indexOf(thisDate) !== -1) {
                                                                    check = 'false';
                                                                }
                                                            }
                                                        }
                                                        if (list.length == 0 || check == 'true') {
                                                            client.hset('cookieRideId', cookie, query.Id);
                                                            res.end("true");
                                                        } else {
                                                            res.end("You have already registered for another post. Therefore, you can not register for this post.")
                                                        }
                                                    });
                                                } else {
                                                    res.end("This ride was already full. So, can't book this ride");
                                                }
                                            }
                                        }
                                    } else {
                                        res.end('false');
                                    }
                                });
                            } else {
                                res.end("false");
                            }
                        });
                    } else {
                        res.end("false");
                    }
                });
            } else if (req.url === "/BookARide" && cookie !== undefined) {
                var name = [];
                var seats = 0;
                name.push(query.Name)
                var allow = 'false';
                var co_travellers = "";
                client.hget('cookieDetail', cookie, function(err, command) {
                    if (command == query.Email) {
                        client.hget('cookieRideId', cookie, function(err, value) {
                            if (value == query.Id) {
                                client.hget('ride_id', query.Id, function(err, postObject) {
                                    if (query.Email !== ((JSON.parse(postObject)).Email)) {
                                        if (query.NoOfSeats > 0 && 4 > query.NoOfSeats) {

                                            if (query.NoOfSeats == 3) {
                                                if (query.PersonName1.length > 0 && query.PersonName2.length > 0 && query.PersonAge1.length > 0 && query.PersonAge2.length > 0) {
                                                    if ((/^[a-zA-Z0-9]([a-z0-9\s._]?[a-zA-Z0-9]){2,20}$/gi).test(query.PersonName1) && (/^[a-zA-Z0-9]([a-z0-9\s._]?[a-zA-Z0-9]){2,20}$/gi).test(query.PersonName1)) {
                                                        if ((/^[1-9]?[0-9]{1}$/g).test(query.PersonAge1) && (/^[1-9]?[0-9]{1}$/g).test(query.PersonAge2)) {
                                                            co_travellers = " Names & Ages are " + query.PersonName1 + '(' + query.PersonAge1 + ') and ' + query.PersonName2 + ' (' + query.PersonAge2 + ') join ';
                                                            name.push(query.PersonName1);
                                                            name.push(query.PersonName2);
                                                            allow = 'true';
                                                        } else {
                                                            res.end("Enter correct Ages");
                                                        }
                                                    } else {
                                                        res.end("Enter correct Names");
                                                    }
                                                } else {
                                                    res.end("Enter all values");
                                                }
                                            } else if (query.NoOfSeats == 2) {
                                                if (query.PersonName1.length > 0 && query.PersonAge1.length > 0) {
                                                    if ((/^[a-zA-Z0-9]([a-z0-9\s._]?[a-zA-Z0-9]){2,20}$/gi).test(query.PersonName1)) {
                                                        if ((/^[1-9]?[0-9]{1}$/g).test(query.PersonAge1)) {
                                                            co_travellers = " Name & Age is " + query.PersonName1 + ' (' + query.PersonAge1 + ') join ';
                                                            name.push(query.PersonName1);
                                                            allow = 'true';
                                                            delete query.PersonName2;
                                                            delete query.PersonAge2;
                                                        } else {
                                                            res.end("Enter correct Age");
                                                        }
                                                    } else {
                                                        res.end("Enter correct Name");
                                                    }
                                                } else {
                                                    res.end("Enter all values");
                                                }
                                            } else {
                                                co_travellers = "no join"
                                                allow = 'true';
                                                delete query.PersonName1;
                                                delete query.PersonName2;
                                                delete query.PersonAge1;
                                                delete query.PersonAge2;
                                            }
                                        } else {
                                            res.end("enter correct seats");
                                        }
                                    } else {
                                        res.end("<script>location.href='/404_not_found_page'</script>");
                                    }
                                    if (allow == 'true') {
                                        client.lrange('ride_Post', 0, -1, function(err, list) {
                                            for (var i of list) {
                                                var obj = JSON.parse(i);
                                                if (query.Id == obj.Id) {
                                                    var check1 = 'false';
                                                    var check2 = 'false';
                                                    for (var j of obj.StartingPlaces) {
                                                        if (j == query.Pickup) {
                                                            check1 = 'true';
                                                            for (var k of obj.StopingPlaces) {
                                                                if (k == query.Drop) {
                                                                    check2 = 'true';
                                                                    var seats = Number(obj.AvailableSeats);
                                                                }
                                                            }
                                                            if (check2 == 'false') {
                                                                res.end("Enter correct Droping place");
                                                            }
                                                        }
                                                    }
                                                    if (check1 == 'false') {
                                                        res.end("Enter correct Pickup Place");
                                                    }
                                                    if (check1 == "true" && check2 == "true") {
                                                        if (seats != 0) {
                                                            obj.AvailableSeats = obj.AvailableSeats - query.NoOfSeats;
                                                            seatsno = obj.AvailableSeats;
                                                            if (seatsno > -1) {
                                                                myride = query.Email + "'sRide";
                                                                client.lpush(myride, (obj.StartingTime));
                                                                var riderName = obj.Email + "'sRides";
                                                                obj.Riders[query.Email] = name;
                                                                client.lrem('ride_Post', 1, i);
                                                                client.lpush('ride_Post', JSON.stringify(obj));
                                                                client.hset('ride_id', query.Id, JSON.stringify(obj));
                                                                client.lrem(riderName, 1, i);
                                                                client.lpush(riderName, JSON.stringify(obj));
                                                                res.end("booked");
                                                            } else {
                                                                res.end("Noo.. Seats are less. So book less amount of seats");
                                                            }
                                                        } else {
                                                            res.end("<script>location.href='/404_not_found_page'</script>");
                                                        }
                                                    }
                                                }
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            } else if (req.url === "/cancelARide" && cookie !== undefined) {
                client.hget('cookieDetail', cookie, function(err, cookieEmail) {
                    if (cookieEmail == query.Email) {
                        client.hget('userdb', cookieEmail, function(err, detailObj) {
                            if (query.Name == (JSON.parse(detailObj)).Name) {
                                client.hget('ride_id', query.Id, function(err, postDetail) {
                                    var post = JSON.parse(postDetail);
                                    if (post['Riders'][cookieEmail] !== undefined) {
                                        var checkDate = new Date();
                                        var todayDate = checkDate.getDate() + 1;
                                        var thisMonth = Number(checkDate.getMonth()) + 1;
                                        var thisYear = checkDate.getFullYear();
                                        var thisDate = post.StartingTime.split(" ")[0];
                                        var DateCheck = (thisDate).split("-");
                                        if (DateCheck[2] <= todayDate && DateCheck[1] <= thisMonth && DateCheck[0] <= thisYear) {
                                            res.end("Cancel date was already expire, So you can't cancel this ride");
                                        } else {
                                            var riderName = (post.Email) + "'sRides";
                                            var myride = query.Email + "'sRide";
                                            post.AvailableSeats = (Number(post.AvailableSeats)) + (Number(post['Riders'][cookieEmail].length));
                                            delete post['Riders'][cookieEmail];
                                            client.lrem(myride, 1, post.StartingTime);
                                            client.lrem('ride_Post', 1, postDetail);
                                            client.lrem(riderName, 1, postDetail);
                                            client.hset('ride_id', query.Id, JSON.stringify(post));
                                            client.lpush('ride_Post', JSON.stringify(post));
                                            client.lpush(riderName, JSON.stringify(post));
                                            res.end("Cancelled");
                                        }
                                    } else {
                                        res.end("You are not join this ride. so, you can't cancel this ride");
                                    }
                                });
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/rateHisPost" && cookie !== undefined) {
                client.hget('cookieDetail', cookie, function(err, myEmail) {
                    if (myEmail == query.Email) {
                        client.hget('userdb', myEmail, function(err, object) {
                            if (query.Name == (JSON.parse(object)).Name) {
                                client.hget('ride_id', query.Id, function(err, ridePost) {
                                    var postObject = JSON.parse(ridePost);
                                    var date = postObject.StartingTime.split(" ")[0];
                                    var dateCheckList = date.split("-");
                                    var a = new Date();
                                    a1 = a.getDate();
                                    b1 = a.getMonth() + 1;
                                    c1 = a.getFullYear();
                                    var thisDate = c1 + '-' + b1 + '-' + a1;
                                    if ((postObject['Rating'][Email] === undefined) && (postObject['Riders'][Email] !== undefined)) {
                                        if (thisdate === date) {
                                            postObject['Rating'][Email] = query.RaingValue;
                                            client.lrem('ride_Post', 1, ridePost);
                                            client.lrem(riderName, 1, ridePost);
                                            client.hset('ride_id', query.Id, JSON.stringify(postObject));
                                            client.lpush('ride_Post', JSON.stringify(postObject));
                                            client.lpush(riderName, JSON.stringify(postObject));
                                            res.end("");
                                        } else {
                                            res.end("The rating date was already expired. So, you can't rate this ride.")
                                        }
                                    } else if ((postObject['Rating'][Email] !== undefined) && (postObject['Riders'][Email] !== undefined)) {
                                        res.end("Oh..! Already, You have rated this ride. So, You can't rate this post");
                                    } else {
                                        res.end("You didn't travel in this ride. So, you can't rate this ride.");
                                    }

                                });
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/getThisRideDetail" && cookie !== undefined) {
                client.hget('cookieDetail', cookie, function(err, value) {
                    if (value !== null) {
                        client.hget('cookieRideId', cookie, function(err, retval) {
                            if (retval !== null) {
                                client.hget('ride_id', retval, function(err, result) {
                                    var thisRide = JSON.parse(result);
                                    thisRide.MyEmail = value;
                                    client.hget('userdb', value, function(err, wholeobj) {
                                        thisRide.MyName = (JSON.parse(wholeobj)).Name;
                                        thisRide.MyImage = (JSON.parse(wholeobj)).Path;
                                        res.end(JSON.stringify(thisRide));
                                    });
                                });
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/viewMembers" && cookie !== undefined) {
                var list = [];
                client.hget('cookieDetail', cookie, function(err, email) {
                    client.hget('ride_id', query.Id, function(err, object) {
                        var object = JSON.parse(object);
                        if (object.Email == email && email == query.Email && object.Name == query.Name) {
                            var memberEmail = Object.keys(object.Riders);
                            if (memberEmail.length > 0) {
                                for (var i of memberEmail) {
                                    var hisEmail = object.Riders[i];
                                    for (var j of hisEmail) {
                                        var obj = {};
                                        obj.Rider = j;
                                        list.push(obj);
                                    }
                                }
                                res.end(JSON.stringify({
                                    "riders": list
                                }));
                            } else {
                                res.end("No-Members")
                            }
                        } else {
                            res.end("You are not car owner. So, you can't view this detail");
                        }
                    });
                });
            } else if (req.url === "/viewAnyProfile" && cookie !== undefined) {
                var ride_list = [];
                var mail = /^[a-z]([a-z0-9._]?[a-z0-9]){2,15}@([a-z]){4,8}.([a-z]){3,5}$/gi;
                var Name = query.Name;
                var Email = query.Email;
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply !== null && reply == Email) {
                        client.hget('userdb', reply, function(err, result) {
                            if (Name == JSON.parse(result).Name) {
                                if ((query.viewEmail).length > 0) {
                                    client.hget('userdb', query.viewEmail, function(err, reply) {
                                        if (reply !== null) {
                                            res.end('exist');
                                        } else {
                                            res.end("In-valid User");
                                        }
                                    });
                                } else {
                                    res.end("Enter email address");
                                }
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/get_His_Name" && cookie !== undefined) {
                var mail = /^[a-z]([a-z0-9._]?[a-z0-9]){2,15}@([a-z]){4,8}.([a-z]){3,5}$/gi;
                if ((query.Email).length > 0) {
                    if (mail.test(query.Email)) {
                        client.hget('userdb', query.Email, function(err, reply) {
                            if (reply !== null) {
                                var his_profile = JSON.parse(reply);
                                if (his_profile.Path == "https://zohocarpooling.zcodeusers.comundefined" || his_profile.Path == "") {
                                    his_profile.Path = "https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg"
                                }
                                var image = JSON.stringify({
                                    "Name": his_profile.Name,
                                    "Path": his_profile.Path,
                                    "Email": his_profile.Email,
                                    "Phone": his_profile.Phone,
                                    "Type": his_profile.Type
                                });
                                res.end(image);
                            } else {
                                res.end("In-valid Email Address");
                            }
                        });
                    }
                } else {
                    res.end("<script>location.href='/404_not_found_page'</script>");
                }
            } else if (req.url === "/get_His_Ride" && cookie !== undefined) {
                var ride_list = [];
                var mail = /^[a-z]([a-z0-9._]?[a-z0-9]){2,15}@([a-z]){4,8}.([a-z]){3,5}$/gi;
                var hisrides = query.Email;
                hisrides = hisrides + "'sRides";
                if ((query.Email).length > 0 && mail.test(query.Email)) {
                    client.lrange(hisrides, 0, -1, function(err, reply) {
                        if (reply.length === 0) {
                            res.end("no_results");
                        } else {
                            for (i of reply) {
                                ride_list.push(JSON.parse(i));
                            }
                            res.end(JSON.stringify(ride_list));
                        }
                    });
                } else {
                    res.end("<script>location.href='/404_not_found_page'</script>");
                }
            } else if (req.url === "/getAllPost" && cookie !== undefined) {
                var postList = [];
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply !== null) {
                        var myEmail = reply;
                        client.hget('userdb', reply, function(err, object){
                            client.lrange('ride_Post', 0, -1, function(err, reply) {
                                if (reply.length === 0) {
                                    res.end("no_post");
                                } else {
                                    for (i of reply) {
                                        var list = JSON.parse(i);
                                        if (list.Email == myEmail) {
                                            list.Me = "yes";
                                        } else {
                                            var NameObject = list.Riders;
                                            var Objlist = Object.keys(NameObject);
                                            for (var k of Objlist) {
                                                if (k == myEmail) {
                                                    list.Book = "Yes";
                                                }
                                            }
                                            if (list.Book != "Yes") {
                                                if (list.AvailableSeats == 0) {
                                                    list.Book = "Full";
                                                } else {
                                                    list.Book = "No";
                                                }
                                            }
                                        }
    
                                        if(JSON.parse(object).Type=="Private Driver" && list.Private_Driver=="Yes") {
                                            if (query.need === undefined || query.need == "All") {
                                                postList.push(list);
                                            } else if (query.need == list.Travel_type) {
                                                postList.push(list);
                                            }
                                        } else if (JSON.parse(object).Type=="Co-Traveller" || JSON.parse(object).Type=="Car-Owner") {
                                            if (query.need === undefined || query.need == "All") {
                                                postList.push(list);
                                            } else if (query.need == list.Travel_type) {
                                                postList.push(list);
                                            }
                                        }
                                    }
                                    if (postList.length === 0) {
                                        res.end("no_post");
                                    } else {
                                        res.end(JSON.stringify({
                                            'post': postList
                                        }));
                                    }
                                }
                            });
                        })
                    }
                });
            } else if (req.url === "/getUserName" && cookie !== undefined) {
                client.hget('cookieDetail', cookie, function(err, reply) {
                    client.hget("userdb", reply, function(err, result) {
                        if (result === null) {
                            res.end("<script>location.href='/404_not_found_page'</script>");
                        } else {
                            var obj = JSON.parse(result);
                            res.end(obj.Name);
                        }
                    });
                });
            } else if (req.url === "/getImage" && cookie !== undefined) {
                client.hget('cookieDetail', cookie, function(err, reply) {
                    client.hget("userdb", reply, function(err, result) {
                        var obj = JSON.parse(result);
                        if (obj.Path == "https://zohocarpooling.zcodeusers.comundefined" || obj.Path == "") {
                            obj.Path = "https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg"
                        }
                        var image = JSON.stringify({
                            "Name": obj.Name,
                            "Path": obj.Path,
                            "Email": obj.Email,
                            "Type": obj.Type
                        });
                        res.end(image);
                    });
                });
            } else if (req.url === "/mapView" && cookie !== undefined) {
                client.hget('ride_id', query.Id, function(err, result) {
                    if (result !== null) {
                        var rideObj = JSON.parse(result);
                        res.end(JSON.stringify({
                            'From': rideObj.From,
                            'To': rideObj.To
                        }));
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/changeMyPassword" && cookie !== undefined) {
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply == query.Email) {
                        client.hget('userdb', query.Email, function(err, result) {
                            var result = JSON.parse(result);
                            if (query.Name == result.Name) {
                                if (query.Old == result.Password) {
                                    if (query.New === query.Re_New) {
                                        result.Password = query.New;
                                        result.Re_Password = query.Re_New;
                                        client.hset('userdb', query.Email, JSON.stringify(result));
                                        res.end("ok");
                                    } else {
                                        res.end("Re-enter password is not same");
                                    }
                                } else {
                                    res.end("Old Password is wrong");
                                }
                            } else {
                                res.end("/404_not_found_page");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/resend" && cookie !== undefined) {
                var username = query.Username;
                client.hget('cookieDetail', cookie, function(err, reply) {
                    client.hget("userdb", reply, function(err, result) {
                        var obj = JSON.parse(result);
                        if (result !== null && obj.Name === username) {
                            checkvalue(cookie);
                        } else {
                            res.end("<script>location.href='/404_not_found_page'</script>");
                        }
                    });
                });
            } else if (req.url === "/forgotPass" && cookie === undefined) {
                client.hget("userdb", query.Email, function(err, result) {
                    if (result === null) {
                        res.end("In-valid Email Address");
                    } else {
                        cookie = 'Myacc=user' + Math.floor(Math.random() * 10000000);
                        res.writeHead(200, {
                            'Set-Cookie': cookie + '; HttpOnly'
                        });
                        client.hset('forgotDetail', cookie, query.Email);
                        forgotPass(cookie);

                    }
                });
            } else if (req.url === "/getmyname" && cookie !== undefined) {
                client.hget('forgotDetail', cookie, function(err, reply) {
                    if (reply !== null) {
                        client.hget('userdb', reply, function(err, reply) {
                            res.end(JSON.parse(reply).Name);
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/resendotp" && cookie !== undefined) {
                var thisName = query.Username;
                client.hget('forgotDetail', cookie, function(err, reply) {
                    if (reply !== null) {
                        client.hget('userdb', reply, function(err, reply) {
                            if (thisName === JSON.parse(reply).Name) {
                                forgotPass(cookie);
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }

                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/ForgotMyPass" && cookie !== undefined) {
                client.hget('forgotDetail', cookie, function(err, reply) {
                    if (reply === null) {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    } else {
                        client.get(reply, function(err, returnvalue) {
                            if (returnvalue === null) {
                                res.end("Your OPT was already expired");
                            } else if (query.OTP == returnvalue) {
                                if (query.Password === query.Re_Password) {
                                    if ((query.Password).length > 7) {
                                        client.hget("userdb", reply, function(err, result) {
                                            var detail = JSON.parse(result);
                                            detail.Password = query.Password;
                                            client.hset('userdb', detail.Email, JSON.stringify(detail));
                                            client.del('forgotDetail', cookie);
                                            res.end("done");
                                        });
                                    } else {
                                        res.end("Password have minimum 8 characters");
                                    }
                                } else {
                                    res.end("Re-enter Password is not matched");
                                }
                            } else {
                                res.end("OTP is wrong");
                            }
                        });
                    }
                });
            } else if (req.url === "/deleteMyAcc" && cookie !== undefined) {
                client.hget('cookieDetail', cookie, function(err, cookieEmail) {
                    if (cookieEmail == query.Email) {
                        client.hget('userdb', cookieEmail, function(err, myObject) {
                            var proFileDetails = JSON.parse(myObject);
                            if (proFileDetails.Name == query.Name) {
                                var ride = proFileDetails.Email + "'sRide";
                                client.del(ride);
                                if (proFileDetails.Type == "Car-Owner") {
                                    var rides = proFileDetails.Email + "'sRides";
                                    client.del(rides);
                                }
                                client.lrange('ride_Post', 0, -1, function(err, list) {
                                    for (var i of list) {
                                        var obj = JSON.parse(i);
                                        if (obj.Email == query.Email) {
                                            client.lrem('ride_Post', 1, i);
                                            client.hdel('ride_id', obj.Id);
                                        }
                                    }
                                    client.hdel('userdb', query.Email);
                                    client.hdel('cookieDetail', cookie);
                                    client.hdel('cookieRideId', cookie);
                                    res.end("Account Closed")
                                });
                            } else {
                                res.end("<script>location.href='/404_not_found_page'</script>");
                            }
                        });
                    } else {
                        res.end("<script>location.href='/404_not_found_page'</script>");
                    }
                });
            } else if (req.url === "/logout" && cookie !== undefined) {
                client.hdel('cookieDetail', cookie);
                client.hdel('cookieRideId', cookie);
                deletecookie();
            } else {
                if (cookie === undefined) {
                    res.end("<script>location.href='/home'</script>");
                } else {
                    res.end("<script>location.href='/zcp.zoho.com/home'</script>");
                }
            }
        } catch (e) {
            res.end("<script>location.href='/404_not_found_page'</script>");
        }
    }

    function result(right) {
        if (right == "stop") {
            verify(cookie);
        } else if (req.url === "/zcp.zoho.com/home") {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            htmlFile = fs.readFileSync('../Html/home.html');
            res.write(htmlFile);
            res.end();
        } else if (req.url === "/add_my_ride") {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            htmlFile = fs.readFileSync('../Html/post.html');
            res.write(htmlFile);
            res.end();
        } else if (req.url === "/bookingPage") {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            htmlFile = fs.readFileSync('../Html/book.html');
            res.write(htmlFile);
            res.end();
        } else if (req.url === "/editPost") {
            res.writeHead(200, {
                'Content-Type': 'text/html'
            });
            htmlFile = fs.readFileSync('../Html/editPost.html');
            res.write(htmlFile);
            res.end();
        }
    }

    function signup(query) {

        cookie = 'Myacc=user' + Math.floor(Math.random() * 10000000);
        client.hset('userdb', query.Email, JSON.stringify(query));
        client.hset('cookieDetail', cookie, query.Email);
        res.writeHead(200, {
            'Set-Cookie': cookie + '; HttpOnly'
        });
        verify(cookie);
    }

    function verify(cookie) {
        client.hget("cookieDetail", cookie, function(err, reply) {
            if (reply !== null) {
                var randomNumber = Math.floor(Math.random() * 10000000);
                var mailHTMLString = "<div style='max-width: 600px;background: #ddd;border: 1px solid gray;box-sizing: border-box;'><div style='background: #00a7ff;padding: 30px 25px;color: white; font: 20px sans-serif;border: 1px solid gray;box-sizing: border-box;'>Zoho Car Pooling</div><div style='padding: 23px;background:wheat;'><b>Dear Zoho Car Pooling  User,</b><p class='cnt' style='text-indent: 35px;line-height: 20px;'> This email address is being used to recover a Zoho Car Pooling  Account. If you initiated the recovery process, it is asking you to enter the numeric verification code that appears below.</p><p class='cnt' style='text-indent: 35px;line-height: 20px;'>If you did not initiate an account recovery process and have a Zoho Car Pooling  Account associated with this email address, it is possible that someone else is trying to access your account. Do not forward or give this code to anyone. Please visit your account's sign-in & security settings to ensure that your account is safe .</p><p style='text-align: center;font: 25px sans-serif;'> <b>  ~ </b></p><p style='line-height: 28px;'>Yours sincerely,<br>The Zoho Car Pooling Team</p></div></div>";
                mailHTMLString = mailHTMLString.replace(" ~", "" + randomNumber);
                var form = {
                    fromAddress: "zohocarpooling@zoho.com",
                    toAddress: reply,
                    subject: "Verify Email",
                    content: mailHTMLString
                };
                request.post({
                    url: "https://mail.zoho.com/api/accounts/5192258000000008001/messages",
                    headers: {
                        'Authorization': 'Zoho-authtoken 87ff96a20104a7d6641da42eaac6b79f'
                    },
                    body: JSON.stringify(form),
                    method: 'POST'
                }, function(err, responce, body) {
                    client.setex(reply, 60 * 15, randomNumber);
                    if (req.url === "/resend") {
                        res.end("ok");
                    } else if (req.url === "/createacc") {
                        res.end("done");
                    } else {
                        res.end("<script>location.href='/home/next'</script>");
                    }
                });
            } else {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        });
    }

    function forgotPass(cookie) {
        client.hget("forgotDetail", cookie, function(err, reply) {
            if (reply !== null) {
                var randomNumber = Math.floor(Math.random() * 10000000);
                var mailHTMLString = "<div style='max-width: 600px;background: #ddd;border: 1px solid gray;box-sizing: border-box;'><div style='background: #00a7ff;padding: 30px 25px;color: white; font: 20px sans-serif;border: 1px solid gray;box-sizing: border-box;'>Zoho Car Pooling</div><div style='padding: 23px;background:wheat;'><b>Dear Zoho Car Pooling  User,</b><p class='cnt' style='text-indent: 35px;line-height: 20px;'> This email address is being used to recover a Zoho Car Pooling  Account. If you initiated the recovery process, it is asking you to enter the numeric verification code that appears below.</p><p class='cnt' style='text-indent: 35px;line-height: 20px;'>If you did not initiate an account recovery process and have a Zoho Car Pooling  Account associated with this email address, it is possible that someone else is trying to access your account. Do not forward or give this code to anyone. Please visit your account's sign-in & security settings to ensure that your account is safe .</p><p style='text-align: center;font: 25px sans-serif;'> <b>  ~ </b></p><p style='line-height: 28px;'>Yours sincerely,<br>The Zoho Car Pooling Team</p></div></div>";
                mailHTMLString = mailHTMLString.replace(" ~", "" + randomNumber);
                var form = {
                    fromAddress: "zohocarpooling@zoho.com",
                    toAddress: reply,
                    ccAddress: 'saravanamurugan1999@gmail.com,smartsaravanan142041@gmail.com',
                    subject: "Forgot Verify Email",
                    content: mailHTMLString
                };
                request.post({
                    url: "https://mail.zoho.com/api/accounts/5192258000000008001/messages",
                    headers: {
                        'Authorization': 'Zoho-authtoken 87ff96a20104a7d6641da42eaac6b79f'
                    },
                    body: JSON.stringify(form),
                    method: 'POST'
                }, function(err, responce, body) {
                    client.setex(reply, 60 * 15, randomNumber);
                    res.end("done");
                });
            } else {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        });
    }

    function checkvalue(cookie) {
        client.hget('cookieDetail', cookie, function(err, reply) {
            if (reply === null) {
                deletecookie();
            } else {
                client.hget('userdb', reply, function(err, reply) {
                    var detail = JSON.parse(reply);
                    if (detail.Status == "Success") {
                        result("start");
                    } else {
                        result("stop");
                    }
                });
            }
        });
    }

    function deletecookie() {
        res.writeHead(200, {
            'Content-Type': 'text/html',
            'Set-Cookie': 'Myacc =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
        });
        res.end("<script>location.href='/home'</script>");
    }
}