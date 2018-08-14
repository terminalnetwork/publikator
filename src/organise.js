const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const sanitize = require('sanitize-filename');
const debug = require('debug')('publikator:organise');

const ensureTags = (files, tags) => {
  return files.filter(file => {
    if (tags.some(tag => file.tags[tag] === undefined)) {
      debug(
        `ignored '${file.path}' because it is missing one or more required tags`
      );
      return false;
    }
    return true;
  });
};

const getFolderName = file => `${file.tags.artist} - ${file.tags.album}`;
const getFileName = file =>
  `${file.tags.track} - ${file.tags.title}${path.extname(file.path)}`;

module.exports = {
  byAlbum: async (root, filesWithTags) => {
    const files = ensureTags(filesWithTags, [
      'artist',
      'album',
      'track',
      'title',
    ]);

    debug(`grouping tracks by album`);
    const folders = _.uniq(files.map(file => getFolderName(file)));
    debug(`found ${folders.length} album(s)`);
    debug(folders);

    debug(`creating album directories`);
    await Promise.all(
      folders.map(album => fs.ensureDir(path.resolve(root, sanitize(album))))
    );

    debug(`copying tracks`);
    return Promise.all(
      files.map(file => {
        const newPath = path.resolve(
          root,
          getFolderName(file),
          getFileName(file)
        );
        fs.copyFileSync(file.path, newPath);
        return _.assign({}, file, { path: newPath });
      })
    );
  },
};
