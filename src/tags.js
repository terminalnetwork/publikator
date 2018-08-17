const jsmediatags = require('jsmediatags');
const debug = require('debug')('publikator:tags');

module.exports = {
  /**
   * Reads tags from a track.
   */
  readTags: file =>
    new Promise((resolve, reject) => {
      jsmediatags.read(file, {
        onSuccess: info => {
          resolve(info);
        },
        onError: error => {
          debug(error.type);
          debug(error.info);
          reject(error);
        },
      });
    }),

  /**
   * Returns true if a file has all required tags.
   */
  hasTags: (taggedFile, tags) => {
    if (tags.some(tag => taggedFile.tags[tag] === undefined)) {
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
      if (taggedFile.tags[tag] !== undefined) {
        all[tag] = taggedFile.tags[tag]; // eslint-disable-line
      }
      return all;
    }, {}),
};
