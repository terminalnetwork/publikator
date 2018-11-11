const path = require('path');
const fs = require('fs-extra');
const _ = require('lodash');
const yaml = require('js-yaml');
const debug = require('debug')('publikator:generate');

/**
 * Collects unique values across a number of tracks.
 */
const collect = (tracks, callback) => {
  const values = _.uniq(_.flatten(tracks.map(t => callback(t)))).filter(x =>
    Boolean(x)
  );
  if (values.length === 0) {
    return null;
  }
  return values.length === 1 ? values[0] : values;
};

/**
 * Returns the first defined metadata at the specified path.
 */
const find = (tracks, path) =>
  _.get(tracks.find(track => !_.isNil(_.get(track, path))), path);

/**
 * Creates release information for a single album.
 */
const getAlbumInfo = (root, tracks) => ({
  layout: 'album',
  slug: path.basename(root),
  name: find(tracks, 'common.album'),
  artists: collect(tracks, t => t.common.artists || t.common.artist),
  bitrate: collect(tracks, t => t.format.bitrate),
  trackCount: tracks.length,
  cover: find(tracks, 'cover'),
  date:
    find(tracks, 'common.date') ||
    find(tracks, 'common.originaldate') ||
    find(tracks, 'all.ORIGINALDATE') ||
    find(tracks, 'common.year') ||
    find(tracks, 'common.originalyear') ||
    find(tracks, 'all.ORIGINALYEAR'),
  tracks: _.sortBy(tracks, 'common.track.no'),
});

/**
 * Creates release information for a single track.
 */
const getTrackInfo = (albumInfo, trackIndex) => {
  const nextTrackIndex = (trackIndex + 1) % albumInfo.trackCount;
  const previousTrackIndex =
    trackIndex === 0 ? albumInfo.trackCount - 1 : trackIndex - 1;
  return {
    layout: 'track',
    ...albumInfo.tracks[trackIndex],
    nextTrack: albumInfo.tracks[nextTrackIndex],
    previousTrack: albumInfo.tracks[previousTrackIndex],
  };
};

/**
 * Converts an object to YAML.
 */
const toYaml = obj =>
  yaml.safeDump(obj, {
    skipInvalid: true,
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
        const releaseInfo = `---\n${toYaml(albumInfo)}---\n`;
        await fs.writeFile(
          path.resolve(albumCollectionRoot, `${baseName}.md`),
          releaseInfo
        );

        // Write track collection
        await Promise.all(
          tracks.map(async (_0, i) => {
            const track = getTrackInfo(albumInfo, i);
            const trackInfoPath = path.resolve(
              trackCollectionRoot,
              baseName,
              `${track.slug}.md`
            );
            await fs.ensureFile(trackInfoPath);
            await fs.writeFile(trackInfoPath, `---\n${toYaml(track)}---\n`);
          })
        );

        return albumInfo;
      })
    );

    // Create album data
    debug(`generating data for ${albumsInfo.length} album(s)`);
    const albumsInfoPath = path.resolve(root, '_data', 'albums.yml');
    await fs.ensureFile(albumsInfoPath);
    await fs.writeFile(albumsInfoPath, toYaml(albumsInfo));
  },
};
