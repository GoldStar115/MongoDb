

var express = require('express');
var mongoose = require('mongoose');
var bodyParser = require('body-parser');
var axios = require('axios');
const cheerio = require('cheerio');
const cheerioTableParse = require('cheerio-tableparser');
var multer = require('multer');
var app = express();
var path = require('path');
var PORT = 3001;
var DATABASE_NAME = 'farnell';
var mongo_conn = 'mongodb://192.168.0.73/farnell';
var download = require('download-file');

var FarnellDB = require('./models/farnell.js');

var interface = require('./interface/interface.js');
var FarnellModel = mongoose.model('FarnellDB-connectors');
var callBackCnt = 1082;
var pageCnt = 0;
var count = 0;
var baseUrl = `https://export.farnell.com`;
var scanUrl = '/c'
var allProductUrl = "/prl/results";
mongoose.connect(mongo_conn);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));
// passive-components
var downloadIntervalId;
app.listen(PORT, function () {
    console.log('Listening on port ' + PORT);
    interface.getInterfaceComponents();
});
var intervalid;
function getComponents(components, pagenum) {
    var url = baseUrl + components + '/prl/results/' + 1082;//i.toString();
    console.log('Requset', url);
    new GetData(url, pagenum);
    intervalid = setInterval(function () {
        if (count != pagenum + 1) {
            var url = baseUrl + components + '/prl/results/' + count;//i.toString();                
            new GetData(url, pagenum);
            count++;
        }
    }, 1000 * 10 * 1);
};
function GetData(url, cnt) {
    axios.get(url).then((response) => {
        let $ = cheerio.load(response.data);
        cheerioTableParse($);
        let list = [];
        callBackCnt++;
        $("#sProdList tbody tr").each(function () {
            let tables = $(this).children();
            let item = {
                title: $(tables).find('.hVal').attr('value'),
                thumbnail: $(tables).find('.productThumbnailWrap').find('.productThumbnail').attr('src'),
                datasheet: $(tables).children().find('.attachmentIcons a').attr('href'),
                datasheetTitle: $(tables).children().find('.attachmentIcons a').attr('title'),
                description: $(tables).find('.productThumbnailWrap').find('.productThumbnail').attr('alt'),
                price: $(tables).find('#priceList span').eq(0).find('.qty_price_range').eq(0).text()
            };
            if (item.title != null || item.title != undefined) {
                WriteData(item);
            }
        });
        if (callBackCnt == cnt) {
            window.clearInterval(intervalid);
        }
    })
        .catch(error => {
            callBackCnt++;
            console.log('Exception error ' + callBackCnt, error.message);
            if (callBackCnt == cnt)
                window.clearInterval(intervalid);
        });
}

function WriteData(item) {
    var farnellModel = new FarnellModel(
        {
            title: item.title,
            thumbnail: item.thumbnail,
            datasheet: item.datasheet,
            datasheetTitle: item.datasheetTitle,
            description: item.description,
            price: item.price
        }
    );
    FarnellModel.create(farnellModel, function (err, doc) {
        if (err) {
            console.log('DB error', callBackCnt);
        } else {
            console.log('DB write', callBackCnt);
            var tmpArr = doc.datasheet.split('/');
            if (tmpArr.length > 2) {
                var filename = tmpArr[tmpArr.length - 1];
                if (doc.datasheet.includes('genericPartNumber=')) {
                    filename = tmpArr[tmpArr.length - 1].split('genericPartNumber=')[1].split('&')[0];
                }
                new DownLoadPDF(filename, doc.datasheet);
            }

            var tmpArrThumb = doc.thumbnail.split('/');
            if (tmpArrThumb.length > 2) {
                var filenameThumb = tmpArrThumb[tmpArrThumb.length - 1];
                new DownLoadJPG(filenameThumb, doc.thumbnail);
            }
        }
    });
}
function DownLoadPDF(fileName, url) {
    var name = fileName.split('?')[0];
    if (!name.includes('.pdf')) {
        name = name + ".pdf";
    }
    var options = {
        directory: "./datasheet/",
        filename: name
    }
    download(url, options, function (err) {
        if (err) {
            console.log("Download pdf error", err);
        } else {

        }
    });
}
function DownLoadJPG(fileName, url) {
    var name = fileName;
    if (!name.includes('.jpg')) {
        name = name + ".jpg";
    }
    var options = {
        directory: "./thumbnail/",
        filename: name
    }
    download(url, options, function (err) {
        if (err) {
            console.log("Download jpg error", err);
        } else {

        }
    });
}