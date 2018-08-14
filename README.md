# Publikator

The rusty metal heart of the Basspistol release machine.

## Installation

1.  Make sure `nodejs` is installed and up-tp-date:

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
publikator organise pathToMySongs outputPath
```

Use the `--delete` flag to start with a clean output directory.
