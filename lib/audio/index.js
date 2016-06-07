var AudioRegistry = exports.Registry = require('./AudioRegistry.js');
var AudioFile     = exports.File     = require('./AudioFile.js');
var AudioRequest  = exports.Request  = require('./AudioRequest.js');
var AudioQueue    = exports.Queue    = require('./AudioQueue.js');

var fs            = require('fs');
var path          = require('path');


// load all audio files in the given dir into the AudioRegistry (async)
// callback(err)
exports.loadAllFiles = function (dir, callback) {
  // TODO load AudioFiles from dir
  fs.readdir(dir, (err, filenames) => {
    if (err) {
      console.error('[AUDIO] error reading directory "%s"', dir);
      return callback(err);
    }

    if (!filenames) {
      console.error('[AUDIO] no such directory:', dir);
      return callback(err);
    }

    if (filenames.length < 1) {
      console.error('[AUDIO] empty directory:', dir);
      return callback(err);
    }

    filenames.forEach((filename) => loadFile(dir, filename));
    return callback(err);
  });
};


var loadFile = function (dir, filename) {
  var fullPath   = path.join(dir, filename);

  var parts      = filename.substring(0, filename.indexOf('.')).split('_');
  var trigger    = parts.splice(0, 1)[0];
  var descriptor = parts.join(' ');

  var file = AudioFile.create(trigger, descriptor, fullPath);

  if (!file) {
    console.error('[AUDIO] unable to create AudioFile for file:', fullPath);
    return;
  }

  AudioRegistry.add(file);
};
