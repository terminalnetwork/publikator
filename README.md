# Publikator

The rusty metal heart of the Basspistol release machine.

Given a folder of tracks (supports mp3, ogg, flac, and many more), it will read the track metadata and re-organise them into a Jekyll-friendly layout. Here's the example output for a single album `foo` with two tracks `bar` and `baz`:

```
_albums/
  foo.md

_data/
  albums.yml

_tracks/
  foo/
    1-bar.md
    2-baz.md

assets/
  foo/
    1-bar.mp3
    2-baz.mp3
```

All Markdown files will encode the metadata in the [Front Matter](https://jekyllrb.com/docs/frontmatter/).

## Installation

1.  Make sure [Node.js](https://nodejs.org/en/download/) is installed and up-tp-date:

    ```
    brew install node
    ```

1.  Install `Publikator` globally via `npm`:

    ```
    npm install -g https://github.com/aengl/publikator
    ```

1.  Repeat the previous step to update to the latest version.

## Usage

To get help, run:

```
publikator -h
```

To organise tracks and generate release information:

```
publikator organise <pathToMySongs> <outputPath>
```

Use the `--delete` flag to start with a clean output directory.

## Jekyll Configuration

To take advantage of the collections, add the following to your `_config.yml`:

```
collections:
  albums:
    output: true
    permalink: /albums/:name
  tracks:
    output: true
```

### Albums

To list all albums, create a file named `albums.md` in your Jekyll root with the following contents:

```
---
layout: default
---

<ul>
  {% for album in site.albums %}
  <li>
    <a href="/{{ album.slug }}">
      {{ album.name }}
    </a>
  </li>
  {% endfor %}
</ul>
```

Each individual album will be available at the url `/albums/<album_slug>`. To create a detail page for an album, create a new layout `_layouts/album.html`:

```
<h1>{{ page.album }}</h1>
<img src="{{ page.cover }}" />
<ul>
  {% for track in page.tracks %}
  <li>
    <a href="/{{ page.slug }}/{{ track.slug }}">
      {{ track.common.title }}
    </a>
  </li>
  {% endfor %}
</ul>
```

### Tracks

Each individual track will be available at the url `/<album_slug>/<track_slug>`. To create a detail page for a track, create a new layout `_layouts/track.html`:

```
<h1>{{ page.common.title }}</h1>
<img src="{{ page.cover }}" />
```
