const BoxCritters = require("./bc-site");
const bcVersions = require("./versions");
const Website = require('#src/util/website');
const path = require('path');

//data
const textureDataJson = require('#data/texture-data.json');
const sitesJson = require('#data/sites.json');
const critterballJson = require('#data/critterball.json');

function dynamicSort(property) {
	var sortOrder = 1;
	if (property[0] === "-") {
		sortOrder = -1;
		property = property.substr(1);
	}
	return function (a, b) {
        /* next line works with strings and numbers, 
         * and you may want to customize it to your needs
         */
		var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;
		return result * sortOrder;
	}
}

function idToLabel(id) {
	var frags = id.split('_');
	for (i = 0; i < frags.length; i++) {
		frags[i] = frags[i].charAt(0).toUpperCase() + frags[i].slice(1);
	}
	return frags.join(' ');
}

function camelize(str) {
	return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
		return index == 0 ? word.toLowerCase() : word.toUpperCase();
	}).replace(/\s+/g, '');
}

function GetClientScript() {
	var ver = bcVersions.GetLatest() || { name: 'LOCAL', items: "LOCAL" };
	var tp = {
		"name": "client-script",
		"label": "Client Script",
		"hidden": true,
		"site": "boxcritters",
		"type": "js",
		"filename": `client${ver.name}.min.js`
	};
	return tp;
}

async function GetManifestLoc() {
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var tp = Object.keys(manifests).map(m => ({
		"name": `${m}Manifest`,
		"site": "boxcritters",
		"type": "manifests",
		"hidden": true,
		"filename": `${manifests[m].charAt(0) == '/' ? manifests[m].substr(1) : manifests[m]}`
	}));
	return tp;
}

/*{
    "name": "beaver",
    "label": "Beaver",
    "site": "boxcritters",
    "type": "media",
    "category": "critters",
  },
*/
async function GetCritters() {
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests['critters'];
	var url = host + loc;
	var website = Website.Connect(url);
	var critters = await website.getJson();
	var tp = critters.map(critter => ({
		"name": `${critter.critterId}`,
		"label": `${critter.name}`,
		"site": "boxcritters",
		"type": "media",
		"category": `critters/${critter.type}`,
		"filename": `${critter.images[0].replace('/media/critters/', '')}`
	}));
	return tp;

}
async function GetSymbols() {
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests['symbols'];
	var url = host + loc;
	var website = Website.Connect(url);
	var symbols = (await website.getJson()).images;
	var tp = symbols.map(symbol => ({
		"name": `${path.basename(symbol, path.extname(symbol))}`,
		"site": "boxcritters",
		"type": "media",
		"category": "symbols"
	}));
	return tp;
}
async function GetEffects() {
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests['effects'];
	var url = host + loc;
	var website = Website.Connect(url);
	var effects = (await website.getJson()).images;
	var tp = effects.map(effect => ({
		"name": `${path.basename(effect, path.extname(effect))}`,
		"site": "boxcritters",
		"type": "media",
		"category": "effects"
	}));
	return tp;
}
async function GetItems() {
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests['items'];
	var url = host + loc;
	var website = Website.Connect(url);
	var itemsData = await website.getJson();
	var items = itemsData.images;
	var tp = items.map(item => ({
		"name": `${path.basename(item, path.extname(item))}`,
		"site": "boxcritters",
		"type": "media",
		"category": "items",
		"filename": `${itemsData.build}/${path.basename(item, path.extname(item))}.png`
	}));
	return tp;
}
async function GetIcons() {
    /*var icons = iconsJson;
    var tp = icons.map(icon => ({
        "name": `${icon.name}`,
        "site": "boxcritters",
        "type": "media",
        "category": `icons/${icon.slot}`
    }));*/
	var host = sitesJson.find(s => s.name == 'boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests['items'];
	var url = host + loc;
	var website = Website.Connect(url);
	var itemsData = await website.getJson();
	var icons = Object.keys(itemsData.items);
	var tp = icons.map(icon => ({
		"name": `${icon}`,
		"label": `${idToLabel(icon)}`,
		"site": "boxcritters",
		"type": "media",
		"category": `icons`
	}));

	return tp;
}

/*
{
	"RoomId": "",
	"Name": "",
	"Background" "",
	"Foreground": "",
	"SpriteSheet": {
		"images":"",
		"framerate":"",
		"frames":[[...]],
		"animations":{},
		"texturepacker": []
	},
	"Layout": {
		"Background": [...],
		"Foreground": [...],
		"Playground": [...]
	},
	"Triggers": []
}
*/
async function GetRooms() {
	var host = sitesJson.find(s=>s.name=='boxcritters').url;
	var manifests = await BoxCritters.GetManifests();
	var loc = manifests['rooms'];
	var url = host + loc;
	var website = Website.Connect(url);
	var rooms = await website.getJson();
	var tp = rooms.reduce((rooms, room) => {
		

		function removeSlash(u) {
			return u.charAt(0) == '/' ? u.substr(1) : u
		}
		
		rooms.push(...[
			{
				"name": `${room.RoomId}BG`,
				"label": `${room.Name} Background`,
				"site": `boxcritters`,
				"type": "media",
				"category": `rooms/${room.RoomId}`,
				"filename": removeSlash(room.Background)
			},
			{
				"name": `${room.RoomId}FG`,
				"label": `${room.Name} Foreground`,
				"site": `boxcritters`,
				"type": "media",
				"category": `rooms/${room.RoomId}`,
				"filename": removeSlash(room.Foreground)
			},
			...room.SpriteSheet.images.map((s,i) => (
				{
					"name": `${room.RoomId}Props${room.SpriteSheet.images.length==1?"":i}`,
					"label": `${room.Name} Spritesheet${room.SpriteSheet.images.length==1?"":" "+i}`,
					"site": `boxcritters`,
					"type": "media",
					"category": `rooms/${room.RoomId}`,
					"filename": removeSlash(s)
				}
			))
		]);
		if(room.Map) {
			rooms.push(
				{
					"name": `${room.RoomId}Map`,
					"label": `${room.Name} Map`,
					"site": `boxcritters`,
					"type": "media",
					"category": `rooms/${room.RoomId}`,
					"filename": removeSlash(room.Map)
				});
		}
		return rooms;
	
	}, []);
	return tp;
}

async function GetCritterBall() {
	var tp = critterballJson.map(t => ({
		"name": t.name,
		"label": t.label,
		"site": "critterball",
		"type": t.type,
		"category": t.category
	}));
	return tp;
}

async function GetTextureData() {
	var clientscript = GetClientScript();

	var manifests = await GetManifestLoc();

	var critters = await GetCritters();
	critters = critters.sort(dynamicSort('name'));
	critters = critters.sort(dynamicSort('category'));

	//var symbols = await GetSymbols();
	var effects = await GetEffects();
	var items = await GetItems();
	var icons = await GetIcons();
	var rooms = await GetRooms();
	var critterball = await GetCritterBall();


	var textures = Object.assign([], textureDataJson);
	textures.push(clientscript);
	textures.push(...manifests);
	textures.push(...critters);
	//textures.push(...symbols);
	textures.push(...effects);
	textures.push(...items);
	textures.push(...icons);
	textures.push(...rooms);
	textures.push(...critterball);
	return textures;
}

function getTextureURL(texture) {
	var versionInfo = bcVersions.GetLatest() || { name: 'LOCAL', items: "LOCAL" };;
	var site = sitesJson.find(s => s.name == texture.site);
	if (!site) return;
	var catList = texture.category ? texture.category.split("/") : [""];
	var subType = catList[0];
	var dirset = site[texture.type];
	var filename = texture.filename || texture.name + ".png";
	filename = filename.replace("{CLIENTVER}", versionInfo.name);
	filename = filename.replace("{ITEMVER}", versionInfo.items);
	var dir = "";
	if (typeof dirset == "object" && subType) {
		dir = dirset[subType];
	} else {
		dir = dirset;
	}
	var textureurl = site.url + dir + filename;
	//console.debug(texture.name + " => " + textureurl);
	return textureurl;
}

async function GetTextureList() {
	return (await GetTextureData())
		.filter(tp => !["name", "author", "date", "packVersion", "description"].includes(tp.name))
		.reduce((textures,texture)=>{
			textures[texture.name] = getTextureURL(texture)
			return textures
		},{})
}

module.exports = {
	GetClientScript,
	GetManifestLoc,
	GetCritters,
	GetSymbols,
	GetItems,
	GetIcons,
	GetCritterBall,
	GetTextureData,
	getTextureURL,
	GetTextureList,
}