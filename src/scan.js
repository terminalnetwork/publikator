const debug = require('debug')('publikator:scan');
const jsmediatags = require('jsmediatags');
const walk = require('walkdir');

module.exports = {
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

  readTags: files => {
    debug(`reading tags for ${files.length} file(s)`);
    return Promise.all(
      files.map(
        file =>
          new Promise((resolve, reject) => {
            jsmediatags.read(file, {
              onSuccess: info => {
                resolve({
                  path: file,
                  size: info.size,
                  tags: info.tags,
                });
              },
              onError: error => {
                debug(error.type);
                debug(error.info);
                reject(error);
              },
            });
          })
      )
    );
  },
};
