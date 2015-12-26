var request = require('request'),
    fs = require('fs'),
    path = require('path'),
    cheerio = require('cheerio'),
    schedule = require('node-schedule');

//每小时30分时执行一次更新操作
var rule = new schedule.RecurrenceRule();
rule.minute = 47;
var j = schedule.scheduleJob(rule, getPassword);
//运行时先执行一次
getPassword();

function getPassword() {
    request('http://www.ishadowsocks.com/', function(err, res, body) {
        var $ = cheerio.load(body);
        var passwords = [];
        var tmp = $('#free').text();
        var usPatt = /A密码:\d+/;
        var hkPatt = /B密码:\d+/;
        var jpPatt = /C密码:\d+/;
        var fileContentObj;
        var fileContent;

        if (tmp.match(usPatt)) {
            var t = tmp.match(usPatt).toString().replace('A密码:', '');
            passwords.push(t);
        }
        if (tmp.match(hkPatt)) {
            var t = tmp.match(hkPatt).toString().replace('B密码:', '');
            passwords.push(t);
        }
        if (tmp.match(jpPatt)) {
            var t = tmp.match(jpPatt).toString().replace('C密码:', '');
            passwords.push(t);
        }

        fileContentObj = JSON.parse(fs.readFileSync('gui-config.json', {
            encoding: 'utf8'
        }));

        for (var i = 0, len = fileContentObj.configs.length; i < len; i++) {
            fileContentObj.configs[i].password = passwords[i];
        }

        fileContent = JSON.stringify(fileContentObj);

        fs.writeFile('gui-config.json', fileContent, function(err) {
            if (err) throw err;
            console.log('saved!');
        })
    })
}