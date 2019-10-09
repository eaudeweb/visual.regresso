# Install

1. Install ImageMagick (https://imagemagick.org/script/download.php) to make **compare** command line available
2. Install node (>= 8.10.0) and npm (>= 3.5.2).
3. Clone the project and install dependencies

```
git clone git@github.com:eaudeweb/visual.regresso.git
cd visual.regresso
npm install
```

4. Copy `example.config.yml` to `config.yml` and add configure according to provided examples: URLs, screen resolutions, output folders etc.

# Usage

## Taking comparison screenshots

The tool will save the screenshots inside the `shots` folder and differences - if any - in `shots/diff` folder. You can also analyze the logs to view failed comparisons.

`DEBUG_LEVEL` - DEBUG, INFO, WARN, ERROR

```
	DEBUG_LEVEL=INFO index.js compare
```

## Taking historical screenshots

The tool will save the screenshots inside the `history` folder by default.

```
	DEBUG_LEVEL=DEBUG index.js history
```

## Customizing code to execute tasks before taking a screenshot.

The tool supports to customize the page before taking a screenshot. For example you can stop animations, remove maps, slideshows or other elements that could trigger false positive comparisons. To do that, copy `scripts/preScreenshot.example.js` to `scripts/preScreenshot.js` and customize according to examples provided. The script will be executed for each item before the screenshot is made.

# References

`compare` tool parameters - https://imagemagick.org/script/compare.php
