var path     = require('path');

var Discord  = require('./lib/discord');		// our Discord handler
var Audio    = require('./lib/audio');

var audioDir = path.join(__dirname, 'sounds');
var bot      = Discord.getInstance();

process.on('SIGINT', () => {
  console.log('\nStopping gracefully.');

  console.log('Logging out...')
  bot.logout(() => {
    console.log('Logged out. Exiting...');
    process.exit(0);
  });
});

Audio.loadAllFiles(audioDir, (err) => {

  if (err) {
    // if error encountered while loading, print error and bail out entirely
    console.error('[ERROR] unable to load audio files!');
    console.error('[ERROR]', err);

    process.exit(1);
  }

  console.log('[INDEX] done loading %d audio files into registry', Audio.Registry.count());

  /* we have successfully loaded the audio files. log in. */

  bot.login(bot.__creds.email, bot.__creds.pass, (err) => {
    if (err) bot.__events.onLoginError(bot, err);

    /* we have successfully logged in. TODO other stuff */
    console.log('[DSCRD] logged in successfully.');
  });

});
