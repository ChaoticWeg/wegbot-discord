var _uuid = require('node-uuid').v1;
var uuid  = function () { return _uuid().split('-')[0]; };

/**
 * AudioRequest constructor
 * -	stores information about who wants an audio file played (what channel
 *		they are in) and which audio file they want to play.
 * -	AudioRequests that have yet to be played are to be stored in BotWrapper._audioQueue.
 */
 function AudioRequest (user, file) {
   this.uuid = uuid();
	 this.user = user;
	 this.file = file;
 };

exports.create = function (user, audioFile) {
	if (!user || !user.username || !user.voiceChannel) {
		console.error('[ARQST] attempted to use an invalid user to create() an AudioRequest');
    console.error('user:', user);
		return null;
	}

	if (!audioFile || !audioFile.path) {
		console.error('[ARQST] attempted to use an invalid file to create() an AudioRequest');
    console.error('file:', audioFile);
		return null;
	}

	console.log('[ARQST] user "%s" wants to play file "%s" in channel "%s"',
		user.username, audioFile.path, user.voiceChannel.name);

	return new AudioRequest(user, audioFile);
};
