const express = require("express");
const github = require('./github');
const moment = require('moment');

let versions = [];
let sha = "";
let setupDone = false;
let tosave = false;
let error = {
	"error": "Version does not exist"
};

function update() {
	setupDone = false;
	tosave = false;
	versions = [];
	github.loadVersions().then(({ vers, psha }) => {
		versions.unshift(...vers);
		sha = psha;
		setupDone = true;
		if (tosave) {
			github.saveVersions(vers, sha);
			tosave = false;
		}
	});
}

function removeDuplicates(arr) {
	return arr.filter((item, index) => {
		if (item.name) {
			return true;
		}
		return index === arr.findIndex(obj => {
			return obj.clientVersion === item.clientVersion && obj.itemsVersion === item.itemsVersion;
			//return JSON.stringify(obj) === JSON.stringify(item);
		});
	});
}

function addVersion(version) {
	let lastVersions = versions;
	let ver = {
		clientVersion: version.client,
		//itemsVersion:version.items,
		//description: "",
		date: moment().format('DD-MM-YYYY')
	};
	versions.push(ver);
	versions = removeDuplicates(versions);
	if (lastVersions.length < versions.length) {
		currver = versions[versions.length - 1];
		prevver = versions[versions.length - 2];

		if (currver.itemsVersion != prevver.itemsVersion) {
			//versionTracker.Invoke("Rocket Snail just released a new Items version of: `" + currver.itemsVersion + "`");
		}
		if (currver.clientVersion != prevver.clientVersion) {
			//versionTracker.Invoke("Rocket Snail just released a new Client version of: `" + currver.clientVersion + "`");
		}
	}
	if (lastVersions.length != versions.length) {

		if (setupDone) {
			github.saveVersions(versions, sha);
		} else {
			tosave = true;
		}
	}

}

function versionExists(ver, type = "client") {
	switch (type) {
		case "items":
			return versions.map(v => v.itemsVersion.toLowerCase()).indexOf(ver.toLowerCase()) > -1;
		case "client":
		default:
			return versions.map(v => (v.clientVersion || v.name).toLowerCase()).indexOf(ver.toLowerCase()) > -1;
	}
}

function getDescription(ver, type = "client") {

	let id = -1;
	switch (type) {
		case "items":
			id = versions.map(v => v.itemsVersion.toLowerCase()).indexOf(ver.toLowerCase());
			break;
		case "client":
		default:
			id = versions.map(v => (v.clientVersion || v.name).toLowerCase()).indexOf(ver.toLowerCase());
			break;
	}
	if (id > -1) {
		let desc = versions[id].description;
		return desc;
	}
}

function getVersions(type = "client") {
	switch (type) {
		case "items":
			return versions.map(v => v.itemsVersion);
		case "client":
		default:
			return versions.map(v => (v.clientVersion || v.name));
	}
}


function getVersionInfo(ver, type = "client") {

	let id = -1;
	switch (type) {
		case "items":
			id = versions.find(v => v.itemsVersion.toLowerCase()).indexOf(ver.toLowerCase());
			break;
		case "client":
		default:
			id = versions.find(v => (v.clientVersion || v.name).toLowerCase()).indexOf(ver.toLowerCase());
			break;
	}
	if (id > -1) {
		return versions[id];
	}
}


let router = express.Router();

router.get('/', (req, res) => {
	res.redirect('/versions');
});

router.get('/items', (req, res) => {
	res.redirect('/versions/items');
});


router.get('/items/:ver', (req, res) => {
	let ver = req.params.ver;
	if (versionExists(ver, "items")) {
		let info = getVersionInfo(ver, "items");
		info.description = getDescription(ver, "items");
		res.json(info);
	} else {
		res.json(error);
	}
});


router.get('/:ver', (req, res) => {
	let ver = req.params.ver;
	if (versionExists(ver)) {
		let info = getVersionInfo(ver, "client");
		info.description = getDescription(ver);
		res.json(info);
	} else {
		res.json(error);
	}
});


module.exports = {
	router,
	addVersion,
	getDescription,
	getVersions,
	update
};
