// AudioRegistry: holds information about each playable audio clip.
// clips are loaded from the audio directory BEFORE the discord bot goes online.
// object structure is as follows:
var _registry = {
	/*
		'trig1': {
				'desc1' : AudioFile(trigger='trig1', desc='desc1', path='/abs/path/to/trig1_desc1.wav'),
				'desc2' : AudioFile(trigger='trig1', desc='desc2', path='/abs/path/to/trig1_desc2.wav')
		},

		'foo': {
				'bar' : AudioFile(trigger='foo', desc='bar', path='/abs/path/to/foo_bar.wav')
		}

	 */
};

var _count = 0;
var utils = require('../utils');

// initialize the registry (set it to an empty set)
var initialize = function () {
	console.log('[ARGST] initializing registry');
	_registry = {};
};


// initialize the registry's list of files with the given trigger
var initTrigger = function (trigger) {
	console.log('[ARGST] initializing trigger: ', trigger);
	_registry[trigger] = {};
};


var count = exports.count = function () {
  return _count;
};


var getAll = exports.getAll = function () {
	return _registry;
};


// add the file to the registry
var add = exports.add = function (file) {
	if (!file || !file.trigger || !file.descriptor || !file.path) {
		console.error('[ARGST] tried to add() an invalid file');
		return;
	}

	if (!_registry[file.trigger])
		initTrigger(file.trigger);

	_registry[file.trigger][file.descriptor] = file;
	console.log('[ARGST] "!%s %s" -', file.trigger, file.descriptor, file.path);
  _count += 1;
};


var hasTrigger = exports.hasTrigger = function (trigger) {
	return !!_registry[trigger];
};


var hasSpecific = exports.hasSpecific = function (trigger, descriptor) {
	if (!hasTrigger(trigger))
		return false;

	return !!_registry[trigger][descriptor];
};


var getSpecific = exports.getSpecific = function (trigger, descriptor) {
	if (!hasSpecific(trigger, descriptor))
		return false;

	return _registry[trigger][descriptor];
};


var getAllWithTrigger = exports.getAllWithTrigger = function (trigger) {
	if (!hasTrigger(trigger))
		return null;

	return _registry[trigger];
};


var getRandomWithTrigger = exports.getRandomWithTrigger = function (trigger) {
	if (!hasTrigger(trigger))
		return null;

	var fileKeys    = Object.keys(_registry[trigger]);
	var randomIndex = utils.pickRandomIndex(fileKeys.length);
	var randomKey   = fileKeys[randomIndex];

	return _registry[trigger][randomKey];
};
