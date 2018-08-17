const debug = require('debug')('publikator:scan');
const walk = require('walkdir');
const tags = require('./tags');

module.exports = {
  /**
   * Recursively searches for files.
   */
  findFilesSync: (root, extension = '.mp3') => {
    debug(
      `scanning directory '${root}' for files with extension '${extension}'`
    );
    const files = [];
    walk.sync(root, path => {
      if (path.endsWith(extension)) {
        files.push(path);
      }
    });
    debug(`found ${files.length} file(s)`);
    return files;
  },

  /**
   * Reads ID3 tags from all files and returns an array in the form of:
   * [{ path, size, tags }, ...]
   */
  readTags: files => {
    debug(`reading tags from ${files.length} file(s)`);
    return Promise.all(
      files.map(async file => {
        const info = await tags.readTags(file);
        return {
          path: file,
          size: info.size,
          tags: info.tags,
        };
      })
    );
  },
};
