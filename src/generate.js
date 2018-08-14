const path = require('path');
const _ = require('lodash');
const yaml = require('js-yaml');
const debug = require('debug')('publikator:generate');

const getTags = (track, tags) =>
  tags.reduce((all, tag) => {
    all[tag] = track[tag]; // eslint-disable-line
    return all;
  }, {});

module.exports = {
  releaseInfo: files => {
    debug(`generating release info for ${files.length} file(s)`);
    const albums = _.groupBy(files, file => path.dirname(file.path));
    return yaml.safeDump(
      Object.keys(albums).map(key => {
        const tracks = albums[key];
        return {
          'track-count': tracks.length,
          tracks: tracks.map((track, i) => ({
            path: track.path,
            size: track.size,
            position: i,
            tags: getTags(track.tags, [
              'title',
              'artist',
              'album',
              'year',
              'comment',
              'track',
              'genre',
            ]),
          })),
        };
      })
    );
  },
};
