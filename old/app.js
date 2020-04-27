const express = require("express");
const cors = require('cors');
const adminLogin = require('bc-admin-login');
var serveIndex = require('serve-index');

const assetfolder = require('./assetfolder');
const feedback = require('./feedback');
const corsProxy = require('./cors');
const version  = require('./version');
const desc = require('./description');
const textureData = require('./texture-data.json');
const sitesData = require('./sites.json');

var app = express();
var ttl = 0;
var api = {};
version.update();
/*
data:
    version => clientVersion
    versionNum => clientVersionNum
    versionName => clientVersionName
    NEW => itemsVersion
    assetsFolder => REMOVED

*/
assetfolder.update().then((data)=>{
    var vers = version.getVersions();
    var versionInfo = {
        client:data.clientVersion,
        items:data.itemsVersion
    };
    if(vers[vers.length-1]!=data.clientVersion) {
        version.addVersion(versionInfo);
    }
    if(vers[vers.length-1]!=data.itemsVersion) {
        version.addVersion(versionInfo);
    }
    api = data;
});


app.set('json spaces', 2);

//middleware
app.use(cors());
app.use('/scripts',express.static('public'),serveIndex('public', {'icons': true}));
app.use(adminLogin);
app.use('/cors',corsProxy);
app.use('/version',version.router);

app.use((req,res,next)=>{      
    if(ttl<=0){
        ttl = 100;
        version.update();
        assetfolder.update().then((data)=>{
            api = data;
            next();
        });
    } else {
        ttl--;
        next();
    }
});

app.use((req,res,next)=>{
	try {
	next();
	} catch (error) {
		res.send(error);
	}
})

//routers
app.use('/description',desc);
app.use('/feedback',feedback);


app.use((req,res,next)=>{
    res.type("application/json");
    next();
});
//routes
app.get('/versions',(req,res)=>{
    res.json(version.getVersions());
});
app.get('/versions/url',(req,res)=>{
    res.json(version.getVersions().map(v=>{version:v,url.req.hostname + "/version/" + v + "/"}));
});
app.get('/versions/:ver',(req,res)=>{
    res.redirect('/version/' + req.params.ver);
});
app.get('/texture-data',(req,res)=>{
    res.json(textureData);
});
app.get('/sites',(req,res)=>{
    res.json(sitesData);
});
app.get("/",(req,res)=>{
    res.json(api);
});

module.exports = app;
