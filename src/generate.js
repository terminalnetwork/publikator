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
const getAlbumInfo = tracks => {
  return {
    artists: collect(tracks, t => t.common.artists || t.common.artist),
    album: collect(tracks, t => t.common.album),
    bitrate: collect(tracks, t => t.format.bitrate),
    trackCount: tracks.length,
    tracks,
  };
};

module.exports = {
  /**
   * Generates a release YAML with data
   */
  generateReleaseInfo: taggedFiles => {
    const albums = _.groupBy(taggedFiles, file => path.dirname(file.path));
    _.forEach(albums, (albumTracks, albumRoot) => {
      debug(
        `generating release info for album '${path.basename(albumRoot)}' with ${
          albumTracks.length
        } track(s)`
      );
      const releaseInfo = yaml.safeDump(getAlbumInfo(albumTracks));
      fs.writeFileSync(path.resolve(albumRoot, 'release.yml'), releaseInfo);
    });
  },
};
