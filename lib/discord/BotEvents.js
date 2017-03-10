var COMMAND_PREFIX = '!';

var Audio = require('../audio');

// invoked whenever bot's "ready" event fires
exports.onReady = function (bot) {
  console.log('[EVENT] onReady');

  bot.setStatus('online', bot.__creds.game);

  //var owner = bot.users.get('id', process.env.WEGBOT_OWNER_ID);
  //bot.sendMessage(owner, "I'm online!",
  //  (e) => { if (e) console.error('[ERROR] error sending message to owner:', e); });

  console.log('[EVENT] onReady: bot is now ready');
};

// invoked if login error occurs
exports.onLoginError = function (bot, err) {
  console.error('[ERROR] onLoginError: discord login error', err);

  bot.logout(() => {
    console.log('[ERROR] onLoginError: logged out.');
    console.log('[ERROR] onLoginError: bailing out due to discord login error...');

    process.exit(2);
  });
};

// invoked whenever a message is sent to a text channel that the bot can see
exports.onMessage = function (bot, message) {
  // if any of the assertions fail, bail out without processing the command.
  if (! assertIsMessageNotNull (message)) return;
  if (! assertIsSenderNotNull  (message)) return;
  if (! assertIsContentNotNull (message)) return;
  if (! assertIsCommand        (message)) return;

  console.log('[EVENT] onMessage: #%s: <%s> %s',
    message.channel.name, message.sender.username, message.content);

  var sender  = message.sender;
  var text    = message.content.substring(1).toLowerCase();

  var words   = text.split(' ');
  var trigger = words.splice(0, 1)[0];

  // admin command
  if (trigger === 'wegbot') {
    if (!isSenderTheOwner(sender)) {
      // only allow the owner to use !wegbot
      console.log('%s attempted to use admin command:', sender.username, message.content);
      return;
    }

    var command = words[0];

    if (command === 'restart') {
      bot.sendMessage(sender, 'Restarting!', (err) => {
        if (err) console.error('[ERROR] error sending message to owner:', err);

        bot.logout(() => {
          console.log('Logged out due to !restart. Restarting...');
          process.exit(69);
        });
      });
    }

    return;
  }


  /* PLAY AUDIO FILE */

  if (!isUserInVoiceChannel(sender)) {
    console.log('[EVENT] onMessage: %s is not in a voice channel', sender.username);
    return;
  }

  if (!Audio.Registry.hasTrigger(trigger)) {
    console.log('[EVENT] onMessage: "%s" is not a registered trigger', trigger);
    return;
  }

  var descriptor = words.join(' ');
  var file       = Audio.Registry.hasSpecific(trigger, descriptor) ? // has specific?
                   Audio.Registry.getSpecific(trigger, descriptor) : // if yes, get specific
                   Audio.Registry.getRandomWithTrigger(trigger);     // if no, get random

  console.log('[EVENT] onMessage: %s used command: "%s"', sender.username, COMMAND_PREFIX + text);

  var request = Audio.Request.create(sender, file);
  if (!request) {
    console.error('[EVENT] onMessage: unable to create AudioRequest');
    return;
  }

  console.log('[EVENT] onMessage: created request %s', request.uuid);
  bot.playAudio(request);
};

exports.onDisconnect = function (bot) {
  // TODO
  console.error('[EVENT] disconnected');
};





/* ASSERTIONS BELOW */
// these assertions must all return TRUE for the bot to process a message

var assertIsCommand = function (message) {
  if (!assertIsContentNotNull(message))
    return false;

  return message.content.startsWith(COMMAND_PREFIX);
};

var assertIsContentNotNull = function (message) {
  if (!message.content) {
    console.log('[EVENT] assert: content is null');
    return false;
  }

  return true;
};

var assertIsSenderNotNull = function (message) {
  if (!message.sender || !message.sender.username) {
    console.log('[EVENT] assert: sender or username is null');
    return false;
  }

  return true;
};

var assertIsMessageNotNull = function (message) {
  if (!message) {
    console.log('[EVENT] assert: message is null');
    return false;
  }

  return true;
};


/**
 * isUserInVoiceChannel
 * - returns true if the user is in a voice channel, otherwise returns false
 * - only values that should be passed are Discord.User objects
 */
var isUserInVoiceChannel = function (user) {
  // coerce truthy or falsy voiceChannel value into boolean true or false
  return !!user.voiceChannel;
};

var isSenderTheOwner = function (user) {
  return user.id === process.env.WEGBOT_OWNER_ID;
};
