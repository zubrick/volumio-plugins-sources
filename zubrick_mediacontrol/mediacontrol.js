/* file: mediacontrol.js
 * Author: aaaa
 * Created on 2019-12-23
 * Description: ffff
 */
'use strict';

module.exports = class {
  constructor (vplug, hidd) {
    this.vplug = vplug;
    this.hidd = hidd;
    this.volIncrement = 3;
    this.state = {};
    this.vplug = vplug;
    this.lastPlayingSource = 'volroon';

    this.getSources();
    this.skip=0;
  }

  noAccent(s){
    var r=s;//.toLowerCase();
    r = r.replace(new RegExp(/\s/g)," ");
    r = r.replace(new RegExp(/[àáâãäå]/g),"a");
    r = r.replace(new RegExp(/æ/g),"ae");
    r = r.replace(new RegExp(/ç/g),"c");
    r = r.replace(new RegExp(/[èéêë]/g),"e");
    r = r.replace(new RegExp(/[ìíîï]/g),"i");
    r = r.replace(new RegExp(/ñ/g),"n");
    r = r.replace(new RegExp(/[òóôõöø]/g),"o");
    r = r.replace(new RegExp(/œ/g),"oe");
    r = r.replace(new RegExp(/[ùúûü]/g),"u");
    r = r.replace(new RegExp(/[ýÿ]/g),"y");
    return r;
  };

  getSources() {
    this.sources = this.vplug.commandRouter.volumioGetVisibleBrowseSources();
    this.vplug.commandRouter.logger.info('**************************************');
    this.vplug.commandRouter.logger.info('Available sources ', this.sources);
    this.vplug.commandRouter.logger.info('**************************************');
  }

  sendLines(msgId, line1, line2, byte1, byte2) {
    line1 = line1 || '';
    line2 = line2 || '';

    line1 = this.noAccent(line1);
    line2 = this.noAccent(line2);

    // console.log(services, selected);
    const data = [];
    for (let i = 0; i < 64; i++) {
      data[i] = 0;
    }
    data[0] = 0x60;
    data[1] = msgId;
    for (let i = 0; i < line1.length && i < 20; i++) {
      data[2 + i] = line1[i].charCodeAt(0);
    }
    for (let i = 0; i < line2.length && i < 20; i++) {
      data[2 + 20 + i] = line2[i].charCodeAt(0);
    }
    if (byte1) {
      data[60] = byte1;
    }
    if (byte2) {
      data[61] = byte2;
    }

    //console.log('status buffer', data[0], data[1], data);
    this.hidd.write(data);
  }

  sendPlayerStatus() {
    let artist = this.state.artist || '';
    let title = this.state.title || '';

    if (this.skip > 0) {
      this.skip--;
      return;
    }



    let status = this.state.status;
    let stByte = 0x01;
    if (this.state.status === 'play') {
      stByte = 0x02;
    } else if (this.state.status === 'stop') {
      stByte = 0x04;
    }

    let mtByte = 0x01;
    if (this.state.mute) {
      status += ' - MUTED ';
      mtByte = 0x02;
    }

    this.sendLines(0x01, this.state.service, status, stByte, mtByte);
    if (this.state.status === 'play') {
      this.sendLines(0x02, artist,title);
    } else {
      this.sendLines(0x02, '', '');
    }
    //console.log('***', this.state.identity, status, artist,title);
  }

  pause(line1, line2, line3, line4) {
    if (this.state.status === 'play') {
      this.skip=2;
      this.sendLines(0x01, line1, line2, 0x01);
      this.sendLines(0x02, line3, line4);
      if(this.state.status=='play' && this.state.service=='webradio'){
        this.vplug.commandRouter.columioStop();
      } else
        this.vplug.commandRouter.volumioPause();
    }
  }

  muteToggle() {
    if(this.state.mute){
      this.vplug.commandRouter.volumiosetvolume('unmute');
    } else {
      this.vplug.commandRouter.volumiosetvolume('unmute');
    }
    this.updateStatus();
  }

  changeVolume(direction) {
    if (this.state.mute) {
      this.muteToggle();
    }
    if (direction > 0 && this.vol < (100 - this.volIncrement)) {
      this.vol += this.volIncrement;
    } else if (direction < 0 && this.vol > this.volIncrement) {
      this.vol -= this.volIncrement;
    } else if (direction > 0 && this.vol >= (100 - this.volIncrement)) {
      this.vol = 100;
    } else if (direction < 0 && this.vol <= this.volIncrement) {
      this.vol = 0;
    }
    this.vplug.commandRouter.volumiosetvolume(this.vol);

    this.sendLines(0x01, this.state.service, this.state.status);

    let line1 = 'Volume: ' + this.vol;
    let data = [];
    for (let i = 0; i < 64; i++) {
      data[i]=0;
    }
    data[0] = 0x60;
    data[1] = 0x02;
    for (let i = 0; i < line1.length && i < 20; i++) {
      data[2 + i] = line1[i].charCodeAt(0);
    }

    let nbSquares = this.vol > 3 ? 20*(this.vol-4)/100 : 0;
    for ( let i = 0; i < 20; i++) {
      if(i <= nbSquares && this.vol > 3) {
        data[2 + 20 + i] = 0xFF;
      } else {
        data[2 + 20 + i] = 0x00;
      }
    }
    console.log('changeVolume', direction, this.vol, nbSquares);

    //console.log('status buffer', data[0], data[1], data);
    this.hidd.write(data);
    this.skip = 2;
    this.updateStatus();

  }

  runCommand(data) {
    switch(data[1]) {
        case 0x01:
          this.vplug.commandRouter.logger.info('Previous button pushed');
          this.vplug.commandRouter.volumioPrevious();
          break;
        case 0x02:
          if (this.playpauscommand == false) {
            this.vplug.commandRouter.logger.info('Play/Pause button pushed');
            this.playpauscommand = true;
            if (this.state.status=='play' && this.state.service=='webradio'){
              this.vplug.commandRouter.columioStop();
            } else if (this.state.status=='play'){
              this.vplug.commandRouter.volumioPause();
            } else {
              this.vplug.commandRouter.volumioVolatilePlay();
            }
            this.updateStatus();
          }
          break;
        case 0x03:
          this.vplug.commandRouter.logger.info('Next button pushed');
          this.vplug.commandRouter.volumioNext();
          break;
        case 0x10:
          this.vplug.commandRouter.logger.info('Mute button pushed');
          this.muteToggle();
          break;
        case 0x11:
          this.vplug.commandRouter.logger.info('Vol+ button pushed');
          this.changeVolume(-1);
          break;
        case 0x12:
          this.vplug.commandRouter.logger.info('Vol- button pushed');
          this.changeVolume(1);
          break;
        case 0x20:
          this.vplug.commandRouter.logger.info('Switch button pushed');
          break;
    }
  }

  updateStatus() {
    this.state = this.vplug.commandRouter.volumioGetState();
    this.vplug.commandRouter.logger.info('Current state ' + this.state.status);
    this.vol = this.state.volume;
    if (this.state.status == 'play') {
      this.lastPlayingSource = this.state.service;
    }
    this.sendPlayerStatus();
    this.playpauscommand = false;
  }
}
