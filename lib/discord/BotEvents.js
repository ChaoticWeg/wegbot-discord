var COMMAND_PREFIX = '!';

var Audio = require('../audio');

// invoked whenever bot's "ready" event fires
exports.onReady = function (bot) {
	console.log('[EVENT] onReady');

	bot.setStatus('online', bot.__creds.game);

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
	console.log('[EVENT] onMessage');

	// if any of the assertions fail, bail out without processing the command.
	if (! assertIsMessageNotNull (message)) return;
	if (! assertIsSenderNotNull  (message)) return;
	if (! assertIsContentNotNull (message)) return;
	if (! assertIsCommand        (message)) return;

	var sender  = message.sender;
  if (!sender.voiceChannel) {
    console.log('[EVENT] onMessage: %s is not in a voice channel', sender.username);
    return;
  }

	var text    = message.content.substring(1).toLowerCase();
	var words   = text.split(' ');
	var trigger = words.splice(0, 1);

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





/* ASSERTIONS BELOW */
// these assertions must all return TRUE for the bot to process the message

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
