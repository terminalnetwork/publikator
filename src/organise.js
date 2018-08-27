const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const sanitize = require('sanitize-filename');
const debug = require('debug')('publikator:organise');
const mime = require('mime-types');
const tags = require('./tags');

/**
 * Given a track file, return the album name.
 */
const getAlbumName = file => file.common.album.replace(/ /g, '-');

/**
 * Given a track file, return the new file name.
 */
const getFileName = file =>
  `${file.common.track.no}-${file.common.title}${path.extname(
    file.path
  )}`.replace(/ /g, '-');

/**
 * Strips the extension from a file name;
 */
const stripExtension = fileName => {
  const i = fileName.lastIndexOf('.');
  return fileName.substr(0, i);
};

/**
 * Extracts the cover art and saves it to a file with the same name.
 */
const extractCoverArt = async filePath => {
  const pictures = await tags.extractCoverArt(filePath);
  if (pictures) {
    const picture = pictures[0];
    const pictureExt = mime.extension(picture.format);
    const picturePath = `${filePath.replace(
      path.extname(filePath),
      ''
    )}.${pictureExt}`;
    await fs.writeFile(picturePath, picture.data);
    return picturePath;
  }
  return null;
};

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
    const assetRoot = path.resolve(root, 'assets', 'albums');
    const files = taggedFiles.filter(file =>
      tags.hasTags(file, [
        'common.artists',
        'common.album',
        'common.track',
        'common.title',
      ])
    );

    debug(`grouping tracks by album`);
    const folders = _.uniq(files.map(file => getAlbumName(file)));
    debug(`found ${folders.length} album(s)`);
    debug(folders);

    debug(`creating album directories`);
    await Promise.all(
      folders.map(album =>
        fs.ensureDir(path.resolve(assetRoot, sanitize(album)))
      )
    );

    debug(`copying tracks & extracting covers`);
    return Promise.all(
      files.map(async file => {
        const folderName = getAlbumName(file);
        const fileName = getFileName(file);
        const newPath = path.resolve(assetRoot, folderName, fileName);
        await fs.copyFile(file.path, newPath);
        const coverPath = await extractCoverArt(newPath);
        return _.assign(
          {},
          {
            path: newPath,
            url: `/assets/albums/${folderName}/${fileName}`,
            slug: stripExtension(fileName),
          },
          coverPath
            ? {
                coverPath,
                cover: `/assets/albums/${folderName}/${path.basename(
                  coverPath
                )}`,
              }
            : {},
          _.omit(file, 'path')
        );
      })
    );
  },
};
