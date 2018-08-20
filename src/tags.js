const _ = require('lodash');
const mm = require('music-metadata');
const debug = require('debug')('publikator:tags');

module.exports = {
  /**
   * Reads tags from a track.
   */
  readTags: file =>
    mm.parseFile(file, {
      duration: true,
      native: true,
      skipCovers: true,
    }),

  /**
   * Extracts the cover art into a file stream.
   */
  extractCoverArt: async file => {
    const data = await mm.parseFile(file, {
      duration: false,
      native: false,
      skipCovers: false,
    });
    return data.common.picture;
  },

  /**
   * Returns true if a file has all required tags.
   */
  hasTags: (taggedFile, tags) => {
    if (tags.some(tag => _.get(taggedFile, tag) === undefined)) {
      debug(`track'${taggedFile.path}' is missing one or more required tags`);
      return false;
    }
    return true;
  },

  /**
   * Extracts tags from a file into an object, ignoring missing tags.
   */
  getTags: (taggedFile, tags) =>
    tags.reduce((all, tag) => {
      const value = _.get(taggedFile, tag);
      if (value !== undefined) {
        all[tag] = value; // eslint-disable-line
      }
      return all;
    }, {}),
};
