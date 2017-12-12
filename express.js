var http=require('http');
var express=require('express');
var app=express();

app.use("/ZCP",express.static(__dirname+"/ZCP"));
app.listen(8443);
