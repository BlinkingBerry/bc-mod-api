const express = require("express");
const request = require('request');
const { JSDOM } = require("jsdom");

var router = express.Router();

var bcurl = "https://boxcritters.com/play/index.html";

function getSiteText(url) {
    return new Promise((resolve,reject)=>{
        request(url, function (error, response, body) {
            //console.log('error:', error); // Print the error if one occurred
            console.log('UPDATED VERSION INFO statusCode:', response && response.statusCode); // Print the response status code if a response was received
            //console.log('body:', body);
            if(error){
                reject(error);
            }
            resolve(body);
        });
    });
}

function getSiteDocument(sitetext) {
    const { window } = new JSDOM(sitetext);
    var document = window.document;
    return document;
}

function getDescriptionText(document) {
    return document.querySelector(".history.container").innerHTML;
}



function getNewDescription() {
    return new Promise((resolve,reject)=>{
        getSiteText(bcurl).then(body=>{
            var document = getSiteDocument(body);
            var desc = getDescriptionText(document);
            resolve(desc);
        }).catch(reject);
    });
}


router.get('/',(req,res)=>{
    getNewDescription().then((d)=>{
        res.send(d);
    })
});



module.exports = router;