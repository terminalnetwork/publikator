const path = require('path');
const _ = require('lodash');
const yaml = require('js-yaml');
const debug = require('debug')('publikator:generate');
const tags = require('./tags');

module.exports = {
  /**
   * Generates a release YAML with data
   */
  releaseInfo: taggedFiles => {
    debug(`generating release info for ${taggedFiles.length} file(s)`);
    const albums = _.groupBy(taggedFiles, file => path.dirname(file.path));
    return yaml.safeDump(
      Object.keys(albums).map(key => {
        const tracks = albums[key];
        return {
          'track-count': tracks.length,
          tracks: tracks.map((track, i) => ({
            path: track.path,
            size: track.size,
            position: i,
            ...tags.getTags(track, [
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
