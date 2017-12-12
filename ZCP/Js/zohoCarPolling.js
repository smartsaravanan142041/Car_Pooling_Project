var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');
var redis = require('redis');
var request = require('request');
var formidable = require('formidable');
var path = require('path');
var ride_id =['0', '1', '2', '3', '4', '5', '6', '7','8','9', 'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
var htmlFile = "";
var ip = require("ip");


var client = redis.createClient();

http.createServer(carPolling).listen(8080);

client.on('connect', function() {
    console.log("Connected");
});

function carPolling(req, res) {
    cookie = req.headers.cookie;
    if (req.url === "/addProFile" && cookie !== undefined && req.method == "POST") {
        try {
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
        } catch (e) {
            res.end("<script>location.href='/404_not_found_page'</script>");
        }
    } else if (req.url === "/addCarImage" && cookie !== undefined && req.method == "POST") {
        try {
            client.hget('cookieDetail', cookie, function(err, reply) {
                var imageName = "";
                var form = new formidable.IncomingForm();
                form.parse(req, function(err, fields, files) {
                    for(var i=0; i<7;i+=1) {
                        imageName+=ride_id[Math.floor(Math.random()*ride_id.length)];
                    }
                    files.carImage.name = imageName + '.png';
                    var oldpath = files.carImage.path;
                    var newpath = path.resolve(__dirname, '../carImage', files.carImage.name);
                    var pathlist = newpath.split('/Car_Pooling_Project');
                    var image_resource = 'https://zohocarpooling.zcodeusers.com' + pathlist[1];
                    var image = fs.readFileSync(oldpath);
                    fs.writeFileSync(newpath, image);
                    client.lrange('ride_Post',0, -1, function(err, result) {
                        for(var i in result) {
                            var object = JSON.parse(result[i]);
                            if(reply==object.Email) {
                                object.CarPath = image_resource;
                                client.lpush('ride_Post', JSON.stringify(object));
                                client.lrem('ride_Post', 1, result[i]);
                                res.end("<script>location.href='/zcp.zoho.com/home'</script>");
                            }
                        }
                        res.end("<script>location.href='/zcp.zoho.com/home'</script>");
                    });
                });
            });
        } catch (e) {
            res.end("<script>location.href='/404_not_found_page'</script>");
        }
    } else if (req.method == "POST") {
        var body = "";
        req.on('data', function(chunk) {
            body += chunk;
        });
        req.on('end', function() {
            requestValue(body);
        });
    } else if (req.url === "/home" && cookie === undefined) {
        res.writeHead(200, {'Content-Type': 'text/html'});
        htmlFile = fs.readFileSync('../Html/signin_signup.html');
        res.write(htmlFile);
        res.end();
    } else if (req.url === "/home/next" && cookie !== undefined) {
        try {
            client.hget('cookieDetail', cookie, function(err, reply) {
                if (reply !== null) {
                    client.hget('userdb', reply, function(err, result) {
                        if (JSON.parse(result).Status === "Failure") {
                            res.writeHead(200, {'Content-Type': 'text/html'});
                            htmlFile = fs.readFileSync("../Html/verify.html");
                            res.write(htmlFile);
                            res.end();
                        } else {
                            res.end("<script>location.href='/zcp.zoho.com/home'</script>");
                        }
                    });
                } else {
                    deletecookie();
                }
            });
        } catch (e) {
            res.end("<script>location.href='/404_not_found_page'</script>");
        }
    } else if (req.url === "/zcp.zoho.com/home" && cookie !== undefined) {
        client.hget('cookieDetail', cookie, function(err, reply) {
            if (reply !== null) {
                checkvalue(cookie);
            } else {
                deletecookie();
            }
        });
    } else if (req.url === "/add_my_ride" && cookie !== undefined) {
        client.hget('cookieDetail', cookie, function(err, reply) {
            if (reply !== null) {
                checkvalue(cookie);
            } else {
                deletecookie();
            }
        });
    } else if (req.url == "/404_not_found_page") {
        res.writeHead(200, {'Content-Type': 'text/html'});
        htmlFile = fs.readFileSync('../Html/Error.html');
        res.write(htmlFile);
        res.end();
    } else if (req.url === "/resendotp" && cookie !== undefined) {
        verify(cookie);
    } else if (req.url === "/forgotMyPassword" && cookie !== undefined) {
        client.hget('forgotDetail', cookie, function(err, reply) {
            client.hget("userdb", reply, function(err, result) {
                if (result === null) {
                    deletecookie();
                } else {
                    res.writeHead(200, {'Content-Type': 'text/html'});
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

    function requestValue(body) {

        var list = (req.url).split("?");
        var query = qs.parse(body);

        if (req.url === "/createacc" && cookie === undefined) {
            try {
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
                        if(name.length>0 && email.length>0 && password.length>0 && re_password.length>0 && phone.length>0) {
                            if(password===re_password) {
                                if(password.length>7) {
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
                                }
                                else {
                                    res.end("Password have minimum 8 characters")
                                }
                            }
                            else {
                                res.end("Re-enter password is wrong");
                            }
                        }
                        else {
                            res.end("Enter all values");
                        }
                    } else {
                        res.write("This email address is already exists");
                        res.end();
                    }
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/login" && cookie === undefined) {
            try {
                client.hget('userdb', query.Email, function(err, reply) {
                    if (reply === null) {
                        res.write("In-valid User");
                        res.end();
                    } else {
                        reply = JSON.parse(reply);
                        if (query.Name == reply.Name && query.Password == reply.Password && reply.Status === 'Success') {
                            cookie = 'Myacc=user' + Math.floor(Math.random() * 10000000);
                            res.writeHead(200, {'Set-Cookie': cookie + '; HttpOnly'});
                            client.hset('cookieDetail', cookie, query.Email);
                            res.write("ok");
                            res.end();
                        } else if (query.Name == reply.Name && query.Password == reply.Password && reply.Status === 'Failure') {
                            cookie = 'Myacc=user' + Math.floor(Math.random() * 10000000);
                            res.writeHead(200, {'Set-Cookie': cookie + '; HttpOnly'});
                            client.hset('cookieDetail', cookie, query.Email);
                            verify(cookie);
                        } else {
                            res.write("Username or Password is wrong");
                            res.end();
                        }
                    }
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/verify" && cookie !== undefined) {
            try {
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
                        deletecookie()
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
                                deletecookie();
                            }
                        });
                    }
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/getMyDetail" && cookie !== undefined) {
            try {
                var name = query.Name;
                var email = query.Email;
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply == email) {
                        client.hget('userdb', email, function(err, result) {
                            var result =JSON.parse(result);
                            if(result.Name==query.Name) {
                                res.end(JSON.stringify({'Name':result.Name,'Phone':result.Phone, 'Married_Status':result.Married_Status, 'Nick_Name':result.Nick_Name,"Type":result.Type,'Personal_Email':result.Personal_Email}));
                            }
                        });
                    } else {
                        res.end("/404_not_found_page");
                    }
                });
            } catch(e) {
                res.end("/404_not_found_page");
            }
        } else if (req.url === "/EditMyDetail" && cookie !== undefined) {
            try {
                var name = query.Name;
                var email = query.Email;
                var boolean = 'true';
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply == email) {
                        client.hget('userdb', email, function(err, result) {
                            var result =JSON.parse(result);
                            if(result.Name==query.Name) {
                                if((query.Phone).length>0) {
                                    if((query.Personal_Email).length>0) {
                                        if((/^[a-z]([a-z0-9._]?[a-z0-9]){2,15}@([a-z]){4,8}.([a-z]){3,5}$/gi).test(query.Personal_Email)) {
                                            boolean = 'true';
                                        } else{
                                            boolean = 'false';
                                        }
                                    }
                                    if(query.Married_Status=="Married-Status" || query.Married_Status=="Married" || query.Married_Status=="Single" || query.Married_Status=="") {
                                        boolean = 'true';
                                    } else {
                                        boolean = 'false';
                                    }
                                }
                                if((query.Type!="Are You" && query.Type=="Car-Owner" || query.Type=="Co-Traveller" || query.Type=="Private Driver" ))
                                {
                                    if((/^[6-9]{1}[0-9]{9}$/g).test(query.Phone) && boolean=="true") {
                                        result.Nick_Name = query.Nick_Name;
                                        result.Phone = query.Phone;
                                        result.Married_Status = query.Married_Status;
                                        result.Type = query.Type;
                                        result.Personal_Email = query.Personal_Email;
                                        client.hset('userdb', email,  JSON.stringify(result));
                                        res.end("done");
                                    } else {
                                        res.end("Enter correct Details");
                                    }
                                } else {
                                    res.end("Enter your correct Role")
                                }
                            } else {
                                res.end("/404_not_found_page");
                            }
                        });
                    }  else {
                        res.end("/404_not_found_page");
                    }
                });

            } catch(e) {
                res.end("/404_not_found_page");
            }
        } else if (req.url === "/addmypost" && cookie !== undefined) {
            try {
                var name = query.Name;
                var email = query.Email;
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply == email) {
                        client.hget('userdb', email, function(err, result) {
                            var result = JSON.parse(result);
                            if (name == result.Name) {
                                res.end("ok change");
                            } else {
                                deletecookie();
                            }
                        });
                    } else {
                        deletecookie();
                    }
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }

        } else if (req.url==="/go_to_ride") {
            try {
                var name = query.Name;
                var email = query.Email;
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if(reply==email) {
                        client.hget('userdb', reply, function(err, result){
                            if(name==(JSON.parse(result).Name)) {
                                res.end('true');
                            } else {
                                deletecookie();
                            }
                        });
                    } else {
                        deletecookie();
                    }
                });
            } catch(e) {
                res.end("/404_not_found_page")
            }
        } else if (list[0] === "/addaRide" && cookie !== undefined) {
            try {
                client.hget('cookieDetail', cookie, function(err, reply) {
                        client.hget('userdb', reply, function(err, result) {
                                query.Email = JSON.parse(result).Email;
                                query.Name = JSON.parse(result).Name;
                                if (JSON.parse(result).Type === 'Car-Owner') {
                                    var checkDate = new Date();
                                    var todayDate = checkDate.getDate() + 1;
                                    var thisMonth = Number(checkDate.getMonth()) + 1;
                                    var thisYear = checkDate.getFullYear();
                                    var a = 'false';
                                    var CarModel = query.CarModel;
                                    var From = query.From;
                                    var To = query.To;
                                    var Flux = query.Flux;
                                    var PostingTime = query.PostingTime;
                                    var StartingTime = query.StartingTime;
                                    var StartingPlaces = query['StartingPlaces[]'];
                                    var StopingPlaces = query['StopingPlaces[]'];
                                    var Via = query['Via[]']
                                    var NumberOFSeats = Number(query.NumberOFSeats);
                                    var Luggage = query.Luggage;
                                    var Travel_type = query.Travel_type;
                                    var Male = query.Male;
                                    var Female = query.Female;
                                    var Child = query.Child;
                                    var list = [];
                                    var thisDate = StartingTime.split(" ")[0];
                                    var DateCheck = (thisDate).split("-");
                                    query.AvailableSeats = NumberOFSeats - 1;
                                    if (From.length > 0 && CarModel.length > 0 && To.length > 0 && PostingTime.length > 0 && StartingTime.length > 0 && StartingPlaces.length > 0 && StopingPlaces.length > 0 && NumberOFSeats > 0 && Luggage.length > 0 && Travel_type.length > 0 && Via.length > 0) {
                                        if (DateCheck[2] <= todayDate && DateCheck[1] <= thisMonth && DateCheck[0] <= thisYear) {
                                            res.end("Enter the proper Date for your travel");
                                        } else {
                                            if (Travel_type == "Ladies Only" || Travel_type == "Gents Only" || Travel_type == "Combined") {
                                                if ((/^\w*$/g).test(From) && (/^\w*$/g).test(To)) {
                                                        if (NumberOFSeats > 0 && NumberOFSeats < 10) {
                                                            if (Luggage == "Less" || Luggage == "Medium" || Luggage == "Large") {
                                                                if (Flux == "10 mins" || Flux == "20 mins" || Flux == "30 mins") {
                                                                    if (Travel_type == "Ladies Only" && Male==0 && (/^\d+.\d*$/g).test(Female) && (/^\d+.\d*$/g).test(Child)) {
                                                                        delete query.Male;
                                                                        a = 'true';
                                                                    } else if (Travel_type == "Gents Only" && Female== 0 && (/^\d+.\d*$/g).test(Male) && (/^\d+.\d*$/g).test(Child)) {
                                                                        delete query.Female;
                                                                        a = 'true';
                                                                    } else if ((Travel_type == "Combined" && (/^\d+.\d*$/g).test(Male) && (/^\d+.\d*$/g).test(Female) && (/^\d+.\d*$/g).test(Child))) {
                                                                        a = 'true';
                                                                    }

                                                                    if (a === 'true') {
                                                                        request.post({
                                                                                url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + From + "&key=AIzaSyD__UHxocTk9SKma7zXERGMyqhFdUktpPI"
                                                                            },
                                                                            function(err, responce, body) {
                                                                                var body = JSON.parse(body);
                                                                                if (body.status !== "ZERO_RESULTS" && (body.results).length !== 0) {
                                                                                    var id1 = body.results[0].place_id;
                                                                                    var place1_1 = (body.results[0].address_components[0].long_name);
                                                                                    var place1_2 = (body.results[0].address_components[0].short_name);
                                                                                    if (place1_1.toLowerCase() == From.toLowerCase() || place1_2.toLowerCase() == From.toLowerCase()) {
                                                                                        request.post({
                                                                                                url: "https://maps.googleapis.com/maps/api/geocode/json?address=" + To + "&key=AIzaSyD__UHxocTk9SKma7zXERGMyqhFdUktpPI"
                                                                                            },
                                                                                            function(err, responce, body) {
                                                                                                var body = JSON.parse(body);
                                                                                                if (body.status !== "ZERO_RESULTS" && (body.results).length !== 0) {
                                                                                                    var id2 = body.results[0].place_id;
                                                                                                    var place2_1 = body.results[0].address_components[0].long_name;
                                                                                                    var place2_2 = body.results[0].address_components[0].short_name;
                                                                                                    if (place2_1.toLowerCase() == To.toLowerCase() || place2_2.toLowerCase() == To.toLowerCase()) {
                                                                                                        request.post({
                                                                                                                url: "https://maps.googleapis.com/maps/api/distancematrix/json?origins=" + From + "&destinations=" + To
                                                                                                            },
                                                                                                            function(err, responce, body) {
                                                                                                                var body = JSON.parse(body);
                                                                                                                var myride = JSON.parse(result).Email + "'sRide";
                                                                                                                var myrides = JSON.parse(result).Email + "'sRides"
                                                                                                                client.lrange(myride, 0, -1, function(err, reply) {
                                                                                                                    if (reply.length != 0) {
                                                                                                                        for (i of reply) {
                                                                                                                            if (i.indexOf(thisDate) !== -1) {
                                                                                                                                a = 'false';
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }

                                                                                                                    if (reply.length === 0 || a === 'true') {
                                                                                                                        var id="";
                                                                                                                        var ownerImage = JSON.parse(result).Path;
                                                                                                                        if (ownerImage == "https://zohocarpooling.zcodeusers.comundefined" || ownerImage=="") {
                                                                                                                                    ownerImage = "https://x1.xingassets.com/assets/frontend_minified/img/users/nobody_m.original.jpg"
                                                                                                                        }
                                                                                                                        var my_random = Math.floor(Math.random()*10);
                                                                                                                        for(i=0; i<my_random; i+=1) {
                                                                                                                            var my_number = Math.floor(Math.random()*ride_id.length)
                                                                                                                            id+=ride_id[my_number];
                                                                                                                        }
                                                                                                                        var timeList = (body.rows[0].elements[0].duration.text).split(" ");
                                                                                                                        query.Distance = body.rows[0].elements[0].distance.text;
                                                                                                                        query.Duration = body.rows[0].elements[0].duration.text;
                                                                                                                        query.Id = id;
                                                                                                                        query.Image = ownerImage;
                                                                                                                        query.Riders = [JSON.parse(result).Email];
                                                                                                                        //client.hset('cookieRideId', cookie, id);
                                                                                                                        client.hset('ride_id', id, JSON.stringify(query));
                                                                                                                        client.lpush('ride_Post', JSON.stringify(query));
                                                                                                                        client.lpush(myride, StartingTime);
                                                                                                                        client.lpush(myrides, JSON.stringify(query));
                                                                                                                        res.end("ok");
                                                                                                                    } else {
                                                                                                                        res.end("Already you booked on this date. So, change the date")
                                                                                                                    }
                                                                                                                });
                                                                                                            });
                                                                                                    } else if (place2_1.toLowerCase() == place2_2.toLowerCase()) {
                                                                                                        res.end("Did you mean: " + place2_1+"?");
                                                                                                    } else {
                                                                                                        res.end(JSON.stringify("Did you mean: " + place2_1 + ", " + place2_2+"?"));
                                                                                                    }
                                                                                                } else {
                                                                                                    res.end("Please enter your correct ending point");
                                                                                                }
                                                                                            });
                                                                                    } else if (place1_1.toLowerCase() == place1_2.toLowerCase()) {
                                                                                        res.end(("Did you mean: " + place1_1+"?"));
                                                                                    } else {
                                                                                        res.end(JSON.stringify("Did you mean: " + place1_1 + ", " + place1_2+"?"));
                                                                                    }
                                                                                } else {
                                                                                    res.end("Please enter your correct starting point");

                                                                                }
                                                                            });
                                                                    } else {
                                                                        res.end("Enter proper prices in given input");
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
                                        }
                                    } else {
                                        res.end("Enter all values");
                                    }
                                } else {
                                    res.end("You are Not Car Owner. So, You can't post a ride");
                                }
                        });
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/findMyRide" && cookie !== undefined) {
            try {
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
                                                                            for (var j of reply) {
                                                                                var obj = JSON.parse(j);
                                                                                if ((obj.From).toLowerCase() === (query.from).toLowerCase() && (obj.To).toLowerCase() == (query.to).toLowerCase()) {
                                                                                    ride_list.push(obj);
                                                                                }
                                                                            }
                                                                            if (ride_list.length === 0) {
                                                                                res.end("no_results");
                                                                            } else {
                                                                                res.end(JSON.stringify(ride_list));
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
                            }
                        });
                    }
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/viewAnyProfile") {
            try {
                var ride_list = [];
                var mail = /^[a-z]([a-z0-9._]?[a-z0-9]){2,15}@([a-z]){4,8}.([a-z]){3,5}$/gi;
                var Name = query.Name;
                var Email = query.Email;
                client.hget('cookieDetail', cookie, function(err, reply) {
                    if (reply !== null && reply == Email) {
                        client.hget('userdb', reply, function(err, result) {
                            if (Name == JSON.parse(result).Name) {
                                if ((query.viewEmail).length > 0) {
                                    client.hget('userdb', query.viewEmail, function(err, reply){
                                        if(reply!==null)
                                        {
                                            res.end('exist');
                                        }
                                        else
                                        {
                                            res.end("In-valid User");
                                        }
                                    });
                                } else {
                                    res.end("Enter email address");
                                }
                            } else {
                                deletecookie();
                            }
                        });
                    } else {
                        deletecookie();
                    }
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/get_His_Name") {
            try {
                var mail = /^[a-z]([a-z0-9._]?[a-z0-9]){2,15}@([a-z]){4,8}.([a-z]){3,5}$/gi;
                if ((query.Email).length > 0) {
                    if (mail.test(query.Email)) {
                        client.hget('userdb', query.Email, function(err, reply) {
                            if (reply !== null) {
                                var his_profile = JSON.parse(reply);
                                if (his_profile.Path == "https://zohocarpooling.zcodeusers.comundefined" || his_profile.Path=="") {
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
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/get_His_Ride") {
            try {
                var ride_list = [];
                var mail = /^[a-z]([a-z0-9._]?[a-z0-9]){2,15}@([a-z]){4,8}.([a-z]){3,5}$/gi;
                var hisrides = query.Email;
                hisrides=hisrides+"'sRides";
                if ((query.Email).length>0 && mail.test(query.Email)) {
                    client.lrange(hisrides, 0, -1, function(err, reply) {
                        if (reply.length === 0) {
                            res.end("no_results");
                        } else {
                            for(i of reply)
                            {
                                ride_list.push(JSON.parse(i));
                            }
                            res.end(JSON.stringify(ride_list));
                        }
                    });
                } else {
                    res.end("<script>location.href='/404_not_found_page'</script>");
                }
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/getAllPost" && cookie !== undefined) {
            var postList = [];
            client.hget('cookieDetail', cookie, function(err, reply) {
                if (reply !== null) {
                    client.lrange('ride_Post', 0, -1, function(err, reply) {
                        if(reply.length===0) {
                            res.end("no_post");
                        }
                        else {
                            for(i of reply)
                            {
                                postList.push(JSON.parse(i));
                            }
                            res.end(JSON.stringify({'post':postList}));
                        }
                        
                    });
                }
            });
        } else if (req.url === "/getUserName" && cookie !== undefined) {
            try {
                client.hget('cookieDetail', cookie, function(err, reply) {
                    client.hget("userdb", reply, function(err, result) {
                        if (result === null) {
                            deletecookie()
                        } else {
                            var obj = JSON.parse(result);
                            res.end(obj.Name);
                        }
                    });
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/getImage" && cookie !== undefined) {
            try {
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
                            "Type":obj.Type
                        });
                        res.end(image);
                    });
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if(req.url==="/mapView") {
            try {
                client.hget('ride_id', query.Id, function(err, result){
                    if(result!==null) {
                        var rideObj = JSON.parse(result);
                        res.end(JSON.stringify({'From':rideObj.From,'To':rideObj.To}));
                    }
                    else {
                        res.end('/404_not_found_page');
                    }
                });
            } catch(e) {
                res.end('/404_not_found_page');
            }
        } else if (req.url==="/changeMyPassword") {
            try {
                client.hget('cookieDetail', cookie, function(err, reply){
                    if (reply==query.Email) {
                        client.hget('userdb', query.Email, function(err, result){
                            var result = JSON.parse(result);
                            if(query.Name==result.Name) {
                                if(query.Old == result.Password) {
                                    if (query.New===query.Re_New) {
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
                        res.end("/404_not_found_page");
                    }
                });
            }
            catch(e) {
                
            }
    } else if (req.url === "/resend" && cookie !== undefined) {
            try {
                var username = query.Username;
                client.hget('cookieDetail', cookie, function(err, reply) {
                    client.hget("userdb", reply, function(err, result) {
                        var obj = JSON.parse(result);
                        if (result !== null && obj.Name === username) {
                            checkvalue(cookie);
                        } else {
                            deletecookie();
                        }
                    });
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/forgotPass" && cookie === undefined) {
            try {
                client.hget("userdb", query.Email, function(err, result) {
                    if (result === null) {
                        res.end("In-valid Email Address");
                    } else {
                        cookie = 'Myacc=user' + Math.floor(Math.random() * 10000000);
                        res.writeHead(200, { 'Set-Cookie': cookie + '; HttpOnly'});
                        client.hset('forgotDetail', cookie, query.Email);
                        forgotPass(cookie);

                    }
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/getmyname") {
            try {
                client.hget('forgotDetail', cookie, function(err, reply) {
                    if (reply !== null) {
                        client.hget('userdb', reply, function(err, reply) {
                            res.end(JSON.parse(reply).Name);
                        });
                    } else {
                        deletecookie();
                    }
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/resendotp") {
            try {
                var thisName = query.Username;
                client.hget('forgotDetail', cookie, function(err, reply) {
                    if (reply !== null) {
                        client.hget('userdb', reply, function(err, reply) {
                            if (thisName === JSON.parse(reply).Name) {
                                forgotPass(cookie);
                            } else {
                                deletecookie();
                            }

                        });
                    } else {
                        deletecookie();
                    }
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }

        } else if (req.url === "/ForgotMyPass" && cookie !== undefined) {
            try {
                client.hget('forgotDetail', cookie, function(err, reply) {
                    if (reply === null) {
                        deletecookie();
                    } else {
                        client.get(reply, function(err, returnvalue) {
                            if (returnvalue === null) {
                                res.end("Your OPT was already expired");
                            } else if (query.OTP == returnvalue) {
                                if (query.Password === query.Re_Password) {
                                    if((query.Password).length > 7) {
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
                                    res.end("Re-enter Password is not matched")
                                }
                            } else {
                                res.end("OTP is wrong");
                            }
                        });
                    }
                });
            } catch (e) {
                res.end("<script>location.href='/404_not_found_page'</script>");
            }
        } else if (req.url === "/logout" && cookie !== undefined) {
            deletecookie();
        } else {
            if (cookie === undefined) {
                res.end("<script>location.href='/home'</script>");
            } else {
                res.end("<script>location.href='/zcp.zoho.com/home'</script>");
            }
        }
    }

    function result(right) {
        if (right == "stop") {
            verify(cookie);
        } else if (req.url === "/zcp.zoho.com/home") {
            res.writeHead(200, {'Content-Type': 'text/html'});
            htmlFile = fs.readFileSync('../Html/home.html');
            res.write(htmlFile);
            res.end();
        } else if (req.url === "/add_my_ride") {
            res.writeHead(200, {'Content-Type': 'text/html'});
            htmlFile = fs.readFileSync('../Html/post.html');
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
                deletecookie();
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
                deletecookie();
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
        res.writeHead(200, {'Content-Type': 'text/html', 'Set-Cookie': 'Myacc =; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'});
        res.end("<script>location.href='/home'</script>");
    }
}