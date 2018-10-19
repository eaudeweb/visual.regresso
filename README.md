
# Install

Install ImageMagick to make 'compare' command line available
Install node (>= 8.10.0) and npm (>= 3.5.2).

```
git checkout project
npm i
```

Copy `example.config.yml` to `config.yml` and customize if necessary.

# Usage

## Taking comparison screenshots

```
DEBUG_LEVEL=INFO node index.js compare
```

## Taking historical screenshots

```
DEBUG_LEVEL=INFO node index.js history
```


**Note:** Use `DEBUG_LEVE=DEBUG` for debugging problems.

# Executing code before taking a screenshot

- Copy `scripts/example.preScreenshot.js` to `scripts/preScreenshot.js` and add your custom interaction code into `execute(id, page)` function.


# References

`compare` tool parameters - https://imagemagick.org/script/compare.php
