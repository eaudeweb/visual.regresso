
# Install

Install node (>= 8.10.0) and npm (>= 3.5.2).

```
git checkout project
npm i
```

Copy `example.config.yml` to `config.yml` and customize if necessary.

# Usage

## Taking comparison screenshots

```
DEBUG_LEVEL=DEBUG node index.js compare
```

## Taking historical screenshots

```
DEBUG_LEVEL=DEBUG node index.js history
```


# References

`compare` tool parameters - https://imagemagick.org/script/compare.php
