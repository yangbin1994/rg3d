// Example using HTTP POST operation

"use strict";

// phantom.outputEncoding="gb2312"
// phantom.scriptEncoding="gb2312"


var page = require('webpage').create(),
    server = 'http://weixin.sogou.com/weixin?query=a&_sug_type_=&s_from=input&_sug_=y&type=1&page=1&ie=utf8',
    data = '{"universe": "expanding", "answer": 42}';

var headers = {
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Encoding": "gzip, deflate, sdch",
    "Accept-Language": "zh-CN,zh;q=0.8,en;q=0.6",
    "Cache-Control": "max-age=0",
    "Connection": "keep-alive",
    "Cookie": "IPLOC=CN3100; SUID=5C3359725F20940A0000000058DFDED7; SUV=1491066583533615; ABTEST=0|1491066585|v1; SNUID=345B301B696D247597585BFE699F38BC; weixinIndexVisited=1; JSESSIONID=aaa_GMw8MjOkK9ii08ESv; pgv_pvi=3953431552; pgv_si=s4210252800; sct=2",
    "Host": "weixin.sogou.com",
    "Upgrade-Insecure-Requests": 1,
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_12_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/57.0.2987.110 Safari/537.36",
}

page.open(server, function (status) {
    if (status !== 'success') {
        console.log('Unable to post!');
    } else {
        console.log(page.content);
    }
    phantom.exit();
});
