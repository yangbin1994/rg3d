var express = require('express');
var app = express();
var request = require('request');
var cheerio = require('cheerio');
var _ = require('lodash')
var fs = require("fs");
var http = require("http");


app.use(express.static('public'));

// let page = 5, base = 90
// const s = setInterval(function () {
//     if (page == 15) 
//         return clearInterval(s)
//     request(`http://bbs.duowan.com/thread-44586452-${page++}-1.html`, function (error, response, body) {
//         if (!error && response.statusCode == 200) {
//             $ = cheerio.load(body);
//             console.log(body)
//             var imgSrcs = $('.avatar img').map((idx, item) => $(item).attr('src')).get()
//             _.forEach(imgSrcs, (url, index) => http.get(url, function (res) {
//                 index += base;
//                 var imgData = "";

//                 res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开

//                 res.on("data", function (chunk) {
//                     imgData += chunk;
//                 });

//                 res.on("end", function () {
//                     fs.writeFile(`./public/imgs/${index}.jpg`, imgData, 'binary', function (err) {
//                         if (err) {
//                             console.log(err);
//                         } else {
//                             console.log("down success");
//                         }
//                     });
//                 });
//             }))

//         }
//     })
//     base += 15;
    
// }, 5000)



var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Example app listening at http://%s:%s', host, port);
});


