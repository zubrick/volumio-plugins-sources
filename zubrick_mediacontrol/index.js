'use strict';

var libQ = require('kew');
var fs=require('fs-extra');
var config = new (require('v-conf'))();
var exec = require('child_process').exec;
var execSync = require('child_process').execSync;
var hid = require('./hid');
var mediacontrol = require('./mediacontrol');


module.exports = zubrickMediacontrol;
function zubrickMediacontrol(context) {
  var self = this;

  this.context = context;
  this.commandRouter = this.context.coreCommand;
  this.logger = this.context.logger;
  this.configManager = this.context.configManager;


}



zubrickMediacontrol.prototype.onVolumioStart = function()
{
  var self = this;
  var configFile=this.commandRouter.pluginManager.getConfigurationFile(this.context,'config.json');
  this.config = new (require('v-conf'))();
  this.config.loadFile(configFile);

  return libQ.resolve();
}

zubrickMediacontrol.prototype.onStart = function() {
  var self = this;
  var defer=libQ.defer();

  self.commandRouter.logger.info('Strating HID');
  this.hidd = new hid((data) => {
    if (data[0] == 0x66) {
      //console.log(util.format("received command", data[1]));
      this.mc.runCommand(data);
    }
  });
  this.mc = new mediacontrol(this, this.hidd);
  self.commandRouter.logger.info('Connect HID');
  this.hidd.connect();
  this.interval = setInterval(() => {
    if(this.hidd.connected) {
      //self.commandRouter.logger.info('mc interval');
      this.mc.updateStatus();
    }
  }, 2000);

  // Once the Plugin has successfull started resolve the promise
  defer.resolve();

  return defer.promise;
};

zubrickMediacontrol.prototype.onStop = function() {
  var self = this;
  var defer=libQ.defer();

  // Once the Plugin has successfull stopped resolve the promise
  defer.resolve();
  clearInterval(this.interval);

  return libQ.resolve();
};

zubrickMediacontrol.prototype.onRestart = function() {
  var self = this;
  // Optional, use if you need it
};


// Configuration Methods -----------------------------------------------------------------------------

zubrickMediacontrol.prototype.getUIConfig = function() {
  var defer = libQ.defer();
  var self = this;

  var lang_code = this.commandRouter.sharedVars.get('language_code');

  self.commandRouter.i18nJson(__dirname+'/i18n/strings_'+lang_code+'.json',
                              __dirname+'/i18n/strings_en.json',
                              __dirname + '/UIConfig.json')
    .then(function(uiconf)
          {


            defer.resolve(uiconf);
          })
    .fail(function()
          {
            defer.reject(new Error());
          });

  return defer.promise;
};

zubrickMediacontrol.prototype.getConfigurationFiles = function() {
  return ['config.json'];
}

zubrickMediacontrol.prototype.setUIConfig = function(data) {
  var self = this;
  //Perform your installation tasks here
};

zubrickMediacontrol.prototype.getConf = function(varName) {
  var self = this;
  //Perform your installation tasks here
};

zubrickMediacontrol.prototype.setConf = function(varName, varValue) {
  var self = this;
  //Perform your installation tasks here
};



// Playback Controls ---------------------------------------------------------------------------------------
// If your plugin is not a music_sevice don't use this part and delete it


zubrickMediacontrol.prototype.addToBrowseSources = function () {

  // Use this function to add your music service plugin to music sources
  //var data = {name: 'Spotify', uri: 'spotify',plugin_type:'music_service',plugin_name:'spop'};
  this.commandRouter.volumioAddToBrowseSources(data);
};

zubrickMediacontrol.prototype.handleBrowseUri = function (curUri) {
  var self = this;

  //self.commandRouter.logger.info(curUri);
  var response;


  return response;
};



// Define a method to clear, add, and play an array of tracks
zubrickMediacontrol.prototype.clearAddPlayTrack = function(track) {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'zubrickMediacontrol::clearAddPlayTrack');

  self.commandRouter.logger.info(JSON.stringify(track));

  return self.sendSpopCommand('uplay', [track.uri]);
};

zubrickMediacontrol.prototype.seek = function (timepos) {
  this.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'zubrickMediacontrol::seek to ' + timepos);

  return this.sendSpopCommand('seek '+timepos, []);
};

// Stop
zubrickMediacontrol.prototype.stop = function() {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'zubrickMediacontrol::stop');


};

// Spop pause
zubrickMediacontrol.prototype.pause = function() {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'zubrickMediacontrol::pause');


};

// Get state
zubrickMediacontrol.prototype.getState = function() {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'zubrickMediacontrol::getState');


};

//Parse state
zubrickMediacontrol.prototype.parseState = function(sState) {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'zubrickMediacontrol::parseState');

  //Use this method to parse the state and eventually send it with the following function
};

// Announce updated State
zubrickMediacontrol.prototype.pushState = function(state) {
  var self = this;
  self.commandRouter.pushConsoleMessage('[' + Date.now() + '] ' + 'zubrickMediacontrol::pushState');

  return self.commandRouter.servicePushState(state, self.servicename);
};


zubrickMediacontrol.prototype.explodeUri = function(uri) {
  var self = this;
  var defer=libQ.defer();

  // Mandatory: retrieve all info for a given URI

  return defer.promise;
};

zubrickMediacontrol.prototype.getAlbumArt = function (data, path) {

  var artist, album;

  if (data != undefined && data.path != undefined) {
    path = data.path;
  }

  var web;

  if (data != undefined && data.artist != undefined) {
    artist = data.artist;
    if (data.album != undefined)
      album = data.album;
    else album = data.artist;

    web = '?web=' + nodetools.urlEncode(artist) + '/' + nodetools.urlEncode(album) + '/large'
  }

  var url = '/albumart';

  if (web != undefined)
    url = url + web;

  if (web != undefined && path != undefined)
    url = url + '&';
  else if (path != undefined)
    url = url + '?';

  if (path != undefined)
    url = url + 'path=' + nodetools.urlEncode(path);

  return url;
};





zubrickMediacontrol.prototype.search = function (query) {
  var self=this;
  var defer=libQ.defer();

  // Mandatory, search. You can divide the search in sections using following functions

  return defer.promise;
};

zubrickMediacontrol.prototype._searchArtists = function (results) {

};

zubrickMediacontrol.prototype._searchAlbums = function (results) {

};

zubrickMediacontrol.prototype._searchPlaylists = function (results) {


};

zubrickMediacontrol.prototype._searchTracks = function (results) {

};

zubrickMediacontrol.prototype.goto=function(data){
  var self=this
  var defer=libQ.defer()

  // Handle go to artist and go to album function

  return defer.promise;
};
