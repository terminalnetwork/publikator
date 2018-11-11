const path = require('path');
const debug = require('debug')('publikator:scan');
const walk = require('walkdir');
const tags = require('./tags');

const extensions = new Set([
  '.3gp',
  '.aac',
  '.aif',
  '.aifc',
  '.aiff',
  '.ape',
  '.asf',
  '.flac',
  '.m2a',
  '.m4a',
  '.m4b',
  '.m4p',
  '.m4r',
  '.m4v',
  '.mp2',
  '.mp3',
  '.mp3',
  '.mp4',
  '.oga',
  '.ogg',
  '.ogv',
  '.ogx',
  '.opus',
  '.wav',
  '.wma',
  '.wmv',
  '.wv',
  '.wvp',
]);

module.exports = {
  /**
   * Recursively searches for files.
   */
  findFilesSync: root => {
    debug(`scanning directory '${root}' for audio tracks`);
    const files = [];
    walk.sync(root, filePath => {
      const ext = path.extname(filePath);
      if (extensions.has(ext)) {
        files.push(filePath);
      }
    });
    debug(`found ${files.length} file(s)`);
    return files;
  },

  /**
   * Reads ID3 tags from all files and returns an array in the form of:
   * [{ path, common, format, native }, ...]
   */
  readTags: files => {
    debug(`reading tags from ${files.length} file(s)`);
    return Promise.all(
      files.map(async file => {
        const info = await tags.readTags(file);
        return {
          path: file,
          ...info,
        };
      })
    );
  },
};
