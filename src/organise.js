const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const sanitize = require('sanitize-filename');
const debug = require('debug')('publikator:organise');
const tags = require('./tags');

const getFolderName = file => `${file.tags.artist} - ${file.tags.album}`;
const getFileName = file =>
  `${file.tags.track} - ${file.tags.title}${path.extname(file.path)}`;

module.exports = {
  /**
   * Organises tracks into a new folder structure in `root`, as follows:
   *
   * {artist} - {album}/
   *   {track} - {title}.{ext}
   *   {track} - {title}.{ext}
   *   ...
   *
   * Returns `taggedFiles` with the paths changed to the new paths.
   */
  byAlbum: async (root, taggedFiles) => {
    const files = taggedFiles.filter(file =>
      tags.hasTags(file, ['artist', 'album', 'track', 'title'])
    );

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
      files.map(async file => {
        const newPath = path.resolve(
          root,
          getFolderName(file),
          getFileName(file)
        );
        await fs.copyFile(file.path, newPath);
        return _.assign({}, file, { path: newPath });
      })
    );
  },
};
