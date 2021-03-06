var _instance = null;

var Discord   = require('discord.js');
var Audio     = require('../audio');

var createInstance = function () {
  console.log('[DSCRD] creating new Discord.Client');

  var bot      = new Discord.Client({ autoReconnect: true });

  bot.__creds        = require('./creds.js');
  bot.__events       = require('./BotEvents.js');

  bot.playAudio      = _playAudio;
  bot.isPlayingAudio = false;

  bot.on('error',   (e) => console.error('[ERROR], e'));
  bot.on('debug',   (m) =>   console.log('[DEBUG]', m));
  bot.on('warn',    (m) =>   console.log('[WARN] ', m));

  bot.on('disconnect', () => bot.__events.onDisconnect(bot));

  bot.on('ready',   ( ) => bot.__events.onReady(bot));
  bot.on('message', (m) => bot.__events.onMessage(bot, m));

  _instance = bot;
  return _instance;
};

var getInstance = exports.getInstance = function () {
  return _instance || createInstance();
};


var _playAudio = function (request) {
  if (_instance.isPlayingAudio || _instance.voiceConnection) {
    console.log('[DSCRD] bot#playAudio(): we are already playing audio. queueing request %s', request.uuid);
    Audio.Queue.push(request);
    return;
  }

  _instance.isPlayingAudio = true;

  console.log('[PLYNG] bot#playAudio(): playing request %s', request.uuid);

  var channel  = request.user.voiceChannel;
  var filepath = request.file.path;

  _instance.joinVoiceChannel(channel, (err, connection) => {
    if (err) {
      console.error('[PLYNG] bot#joinVoiceChannel(): error joining channel "%s"', channel);
      console.error(err);
      _instance.isPlayingAudio = false;
      return;
    }

    console.log('[PLYNG] bot#joinVoiceChannel(): joined channel "%s"', channel.name);
    connection.playFile(filepath, (err, intent) => {

      if (err) {
        console.error('[PLYNG] VoiceConnection#playFile(): error playing request %s', request.uuid);
        console.error(err);

        _instance.isPlayingAudio = false;
        connection.destroy();

        Audio.Queue.dump();
        return;
      }

      intent.on('error', (err) => {
        console.error('[PLYNG] playIntent#error: error playing request %s', request.uuid);
        console.error(err);

        _instance.isPlayingAudio = false;
        connection.destroy();

        Audio.Queue.dump();
        return;
      });

      // FIXME 'END' EVENT MAY FIRE BEFORE FILE IS DONE PLAYING
      intent.on('end', () => {
        console.log('[PLYNG] playIntent#end: C  finished playing request %s', request.uuid);
        console.log('[PLYNG] bot#playAudio(): %d requests queued', Audio.Queue.count());

        _instance.isPlayingAudio = false;
        connection.destroy();

        if (Audio.Queue.hasNext()) {
          console.log('[PLYNG] playing next request, last one was %s', request.uuid);
          return _instance.playAudio(Audio.Queue.next());
        }
      });

    });
  });
};
