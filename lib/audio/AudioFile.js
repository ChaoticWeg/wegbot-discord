function AudioFile (trigger, descriptor, path) {
	this.trigger = trigger;
	this.descriptor = descriptor;
	this.path = path;
};

// create a new AudioFile object. checks that each argument is defined.
exports.create = function (trigger, descriptor, path) {
	if (!trigger) {
		console.error('[AFILE] tried to create() a file with an undefined trigger');
		return null;
	}

	if (!descriptor) {
		console.error('[AFILE] tried to create() a file with an undefined descriptor');
		descriptor = ' ';
	}

	if (!path) {
		console.error('[AFILE] tried to create() a file with an undefined filepath');
		return null;
	}

	return new AudioFile(trigger, descriptor, path);
};
