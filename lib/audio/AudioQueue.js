// audio files that are queued to be played (AudioRequests) are put here.

var _queue = [];

var push = exports.push = function (request) {
  _queue.push(request);
};

var count = exports.count = function () {
  return _queue.length;
};

var hasNext = exports.hasNext = function () {
  return count() > 0;
};

var next = exports.next = function () {
  if (!hasNext())
    return null;

  return _queue.splice(0, 1)[0];
};

var dump = exports.dump = function () {
  console.log('[QUEUE] dumping request queue');

  while (_queue.length > 0) {
    var tmp = next();
    console.log('[QUEUE] dumping request %s', tmp.uuid);
  }
};
