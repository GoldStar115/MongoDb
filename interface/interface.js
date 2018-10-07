

var mongoose = require('mongoose');
var axios = require('axios');
const cheerio = require('cheerio');
const cheerioTableParse = require('cheerio-tableparser');
var multer = require('multer');
var interfaceDB = require('./model.js');
var InterfaceModel = mongoose.model('interface');
var baseUrl = `https://export.farnell.com`;
async function getInterfaceComponents() {
    var url = baseUrl
    console.log('Requset', url);
    var res = await axios.get(url);
    let $ = cheerio.load(res.data);
    cheerioTableParse($);
    let list = [];
    var subNav = $("#nav .megaMenu li .subnav");    
    for (var idx = 0; idx < subNav.length ; idx ++){
        let title_data = $(subNav[idx]).children();
        var title = $(title_data).find('li a').html().trim().replace('<i></i>', '');

        var subtitle, subLink, content, contentLink;

        console.log('Title == >', title);

        var flyout = $(title_data).find('.flyout');
        

        for (var idxFly = 0; idxFly < flyout.length ; idxFly ++ ){
            var flyOutChildRen = $(flyout[idxFly]).children();

            for (var idxFlyChild = 0; idxFlyChild < flyOutChildRen.length ; idxFlyChild ++){            
                var contentChild = $(flyOutChildRen[idxFlyChild]).children()
                for (var idxContentChild = 0 ; idxContentChild < contentChild.length ; idxContentChild ++){
                    if ($(contentChild[idxContentChild]).find('h4').length != 0) {
                        if ($(contentChild[idxContentChild]).find('a').html() != null) {
                            subtitle = $(contentChild[idxContentChild]).find('a').html().trim().replace('<i></i>', '');                            
                        }
                        if ($(contentChild[idxContentChild]).find('a').attr('href') != null) {
                            subLink = $(contentChild[idxContentChild]).find('a').attr('href');
                        }
                    }
                    else {
                        if ($(contentChild[idxContentChild]).find('a').html() != null) {
                            content = $(contentChild[idxContentChild]).find('a').html().trim().replace('<i></i>', '');                            
                        }
                        if ($(contentChild[idxContentChild]).find('a').attr('href') != null) {
                            contentLink = $(contentChild[idxContentChild]).find('a').attr('href');
                                                       
                        }
                        if (content != 'View All'){
                            console.log(content,' ==> ', contentLink); 
                            await getContent(title, subtitle, subLink, content, contentLink);
                        }
                    }
                }
            }
        }
    }
}
async function getContent(title, subTitle, subTitleLink, content, contentLink){
    var resContent = await axios.get(contentLink);
    let $ = cheerio.load(resContent.data);
    cheerioTableParse($);
    var contentNav = $(".categoryContainer .categoryList div .filterCategoryLevelOne").children();
    var elementNum, elementTitle, elementLink;
    if (contentNav.length > 0){
        for (var idx = 0; idx < contentNav.length; idx++) {
            if ($(contentNav[idx]).find('ul li a').html() != null)
                elementTitle = $(contentNav[idx]).find('ul li a').html();
            if (elementLink = $(contentNav[idx]).find('ul li a').attr('href') != null)
                elementLink = $(contentNav[idx]).find('ul li a').attr('href');
            if ($(contentNav[idx]).find('ul li span').html() != null)
                elementNum = $(contentNav[idx]).find('ul li span').html().replace(/[()]/g, '').replace(',', '');

            if (elementTitle != undefined && elementLink != undefined && elementNum != undefined) {
                console.log(content, elementTitle, elementNum, elementLink);
            }
            var iModel = new InterfaceModel(
                {
                    title: title,
                    subTitle,
                    subTitleLink,
                    content,
                    contentLink,
                    elementTitle,
                    elementLink,
                    elementNum: Number(elementNum)
                }
            );
            await WriteInterFaceData(iModel)
        }
    }else{
        var iModel = new InterfaceModel(
            {
                title: title,
                subTitle,
                subTitleLink,
                content,
                contentLink,
                elementTitle : content,
                elementLink : contentLink,
                elementNum: 0            }
        );
        await WriteInterFaceData(iModel)
    }

}
async function WriteInterFaceData(iModel) {
    let res = await InterfaceModel.create(iModel);
}
module.exports = {
    getInterfaceComponents
}