
# Install

1. Install ImageMagick (https://imagemagick.org/script/download.php) to make **compare** command line available
2. Install node (>= 8.10.0) and npm (>= 3.5.2).
3. Clone the project and install dependencies
  - `git clone git@github.com:eaudeweb/visual.regresso.git`
  - `cd visual.regresso`
  - `npm install`
4. Create an alias in `$HOME/.bashrc` for **index.js** file from the cloned **visual.regresso** directory
  - `alias visual-regresso='DEBUG_LEVEL=INFO path_to_visual.regresso/index.js'`
  - `source $HOME/.bashrc`
5. Copy the folder `visual.regresso.starterkit` into your project, rename it as preferred and navigate into it.
6. Copy `config.example.yml` to `config.yml` and customise as necessary.


# Usage

## Taking comparison screenshots

Inside your project's **visual.regresso** folder
  - `visual-regresso compare`

## Taking historical screenshots

Inside your project's **visual.regresso** folder
  - `visual-regresso history`

## Executing code before taking a screenshot

Copy `scripts/preScreenshot.example.js` to `scripts/preScreenshot.js` in your project's **visual.regresso** folder and add your custom interaction code in the `execute` function.


# References

`compare` tool parameters - https://imagemagick.org/script/compare.php
