
# Install

Install ImageMagick to make 'compare' command line available
Install node (>= 8.10.0) and npm (>= 3.5.2).

```
git checkout project
npm i
(sudo) npm link
```

Copy the folder `visual.regresso.starterkit` into your project, rename it as preferred and navigate into it.

Copy `config.example.yml` to `config.yml` and customize as necessary.

# Usage

## Taking comparison screenshots

```
DEBUG_LEVEL=INFO visual-regresso compare
```

## Taking historical screenshots

```
DEBUG_LEVEL=INFO visual-regresso history
```


**Note:** Use `DEBUG_LEVEL=DEBUG` for debugging problems.

## Executing code before taking a screenshot

- Copy `scripts/preScreenshot.example.js` to `scripts/preScreenshot.js` and add your custom interaction code into `execute(id, page)` function.


# References

`compare` tool parameters - https://imagemagick.org/script/compare.php
