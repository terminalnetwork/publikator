const fs = require('fs-extra');
const path = require('path');
const _ = require('lodash');
const yaml = require('js-yaml');
const debug = require('debug')('publikator:generate');

/**
 * Collects unique values across a number of tracks.
 */
const collect = (tracks, callback) => {
  const values = _.uniq(_.flatten(tracks.map(t => callback(t)))).filter(
    x => !!x
  );
  if (values.length === 0) {
    return null;
  }
  return values.length === 1 ? values[0] : values;
};

/**
 * Creates release information for a single album.
 */
const getAlbumInfo = (root, tracks) => ({
  layout: 'album',
  slug: path.basename(root),
  name: tracks[0].common.album || '',
  artists: collect(tracks, t => t.common.artists || t.common.artist),
  bitrate: collect(tracks, t => t.format.bitrate),
  trackCount: tracks.length,
  cover: tracks[0].coverUrl || null,
  tracks,
});

module.exports = {
  /**
   * Generates Jekyll-compatible release data
   */
  generateReleaseInfo: async (root, taggedFiles) => {
    // Create collections
    const trackCollectionRoot = path.resolve(root, '_tracks');
    await fs.ensureDir(trackCollectionRoot);

    const albums = _.groupBy(taggedFiles, file => path.dirname(file.path));
    const albumsInfo = await Promise.all(
      _.map(albums, async (tracks, albumRoot) => {
        const baseName = path.basename(albumRoot);
        const albumCollectionRoot = path.resolve(root, '_albums');
        await fs.ensureDir(albumCollectionRoot);
        debug(
          `generating release info for album '${baseName}' with ${
            tracks.length
          } track(s)`
        );
        const albumInfo = getAlbumInfo(albumRoot, tracks);
        const releaseInfo = `---\n${yaml.safeDump(albumInfo)}---\n`;
        await fs.writeFile(
          path.resolve(albumCollectionRoot, `${baseName}.md`),
          releaseInfo
        );

        // Write track collection
        await Promise.all(
          tracks.map(async track => {
            const trackInfoPath = path.resolve(
              trackCollectionRoot,
              baseName,
              `${track.slug}.md`
            );
            await fs.ensureFile(trackInfoPath);
            await fs.writeFile(
              trackInfoPath,
              `---\n${yaml.safeDump({
                layout: 'track',
                ...track,
              })}---\n`
            );
          })
        );

        return albumInfo;
      })
    );

    // Create album data
    debug(`generating data for ${albumsInfo.length} album(s)`);
    const albumsInfoPath = path.resolve(root, '_data', 'albums.yml');
    await fs.ensureFile(albumsInfoPath);
    await fs.writeFile(albumsInfoPath, yaml.safeDump(albumsInfo));
  },
};
