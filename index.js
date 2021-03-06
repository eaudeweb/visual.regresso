#!/usr/bin/env node

const readYaml = require('read-yaml');
const puppeteer = require('puppeteer');
const Log = require('debug-level');
const sprintfjs = require('sprintf-js');
const sprintf = sprintfjs.sprintf;
const path = require('path');
const fs = require('fs');
const util = require('util');

(async () => {
  var exit_code = 0, command = null, log = new Log('main');
  if (process.argv[2]) {
    command = process.argv[2];
  }
  else {
    log.error("Usage: node index.js <compare|history>");
    return -1;
  }
  var config = readYaml.sync('config.yml');
  log.info('Executing command: ' + command);

  var defaultScreenSize = null;
  if (typeof(config.compare.screen_size) != 'undefined' && typeof(config.compare.screen_size[0] == 'string')) {
    defaultScreenSize = parseScreenSize(config.compare.screen_size[0]);
  }

  var rootDir = path.dirname(require.main.filename);
  if (command == 'compare') {
    var defaultTimeout = typeof(config.compare.screenshot_timeout) != 'undefined' && typeof(config.compare.screenshot_timeout) == 'number' ? config.compare.screenshot_timeout : 1000;
    var outputDir = rootDir + '/' + config.compare.output;
    if (config.compare.output[0] == '/') {
      outputDir = process.cwd() + config.compare.output;
    }

    var items = new Map();
    Object.keys(config.links).forEach(function(key) {
      let value = config.links[key];
      let path = typeof(value) == 'string' ? config.links[key] : value.path;
      let screenSize = typeof(value.screen_size) == 'object' && typeof(value.screen_size[0]) == 'string' ? parseScreenSize(value.screen_size[0]) : defaultScreenSize;
      let timeout = typeof(value.screenshot_timeout) != 'undefined' && typeof(value.screenshot_timeout) == 'number' ? value.screenshot_timeout : defaultTimeout;

      items.set(key, {
        "prod_url": config.url.prod + path,
        "test_url": config.url.test + path,
        "prod_image": outputDir + '/' + key + '_prod.png',
        "test_image": outputDir + '/' + key + '_test.png',
        "diff_image": outputDir + '/diff/' + key + '_diff.png',
        "screen_width" : screenSize.width,
        "screen_height" : screenSize.height,
        "timeout": timeout,
      });
    });

    for (var item of items.entries()) {
      var key = item[0], ob = item[1];
      var element;

      var screen_width = ob.screen_width;
      var screen_height = ob.screen_height;

      const browser = await puppeteer.launch();
      var page = await browser.newPage();
      page.setViewport({width: screen_width, height: screen_height});
      log.debug('%s: Getting PROD screenshot (%dx%d) %s to %s ', key, screen_width, screen_height, ob.prod_url, ob.prod_image);

      await page.goto(ob.prod_url);

      var scriptsDir = rootDir + '/' + config.compare.scripts;
      if (config.compare.scripts[0] == '/') {
        scriptsDir =  process.cwd() + config.compare.scripts;
      }
      var preScreenshotPath = scriptsDir + '/preScreenshot.js';

      // Execute code before taking the screenshot
      if(fs.existsSync(preScreenshotPath)) {
        log.debug('Found ' + preScreenshotPath + ', invoking execute()');
        var preScreenshot = require(preScreenshotPath);
        await preScreenshot.execute(key, page);
      }

      // Wait before taking screenshot
      log.debug('Waiting for %dms before screenshot...', ob.timeout);
      await page.waitFor(ob.timeout);

      await page.screenshot({path: ob.prod_image});
      log.debug('Done getting PROD screenshot.');

      var page = await browser.newPage();
      page.setViewport({width: screen_width, height: screen_height});
      log.debug('%s: Getting TEST screenshot (%dx%d) %s to %s', key, screen_width, screen_height, ob.test_url, ob.test_image);

      await page.goto(ob.test_url);

      // Execute code before taking the screenshot
      if(fs.existsSync(preScreenshotPath)) {
        log.debug('Found ' + preScreenshotPath + ', invoking execute()');
        var preScreenshot = require(preScreenshotPath);
        await preScreenshot.execute(key, page);
      }

      // Wait before taking screenshot
      log.debug('Waiting for %dms before screenshot...', ob.timeout);
      await page.waitFor(ob.timeout);

      await page.screenshot({path: ob.test_image});
      log.debug('Done getting TEST screenshot.');
      await browser.close();

      const { spawnSync} = require('child_process');

      log.debug('%s: Removing existing DIFF image %s', key, ob.diff_image);
      const child_rm = spawnSync('rm', ['-f', ob.diff_image]);

      log.debug('%s: Creating DIFF image %s', key, ob.diff_image);
      var diff_command = config.compare.compare_binary + ' -metric AE -fuzz 10% -highlight-color red ' + ob.prod_image + ' ' + ob.test_image + ' ' + ob.diff_image;
      log.debug(key + ': Command: ' + diff_command);
      const child_compare = spawnSync(config.compare.compare_binary,
        [
          '-metric', 'AE',
          '-fuzz', '10%',
          '-highlight-color', 'red',
          ob.prod_image,
          ob.test_image,
          ob.diff_image
        ]
      );
      if (child_compare.status == 0) {
        if (!config.compare.keep_identical_diff) {
          log.debug('%s: Files are identical, deleting diff %s', key, ob.diff_image);
          spawnSync('rm', ['-f', ob.diff_image]);
        }
      }
      else if (child_compare.status == 1) {
        // Files are different, set global error flag
        log.warn('%s has differences, check: %s vs. %s, diff: %s', key, ob.test_url, ob.prod_url, ob.diff_image);
        if (exit_code == 0) {
          exit_code = -1;
        }
      }
      else {
        // Error - could not generate diff image, set global error flag
        log.error('%s ImageMagick compare has failed. Check error by running: %s', key, diff_command);
        if (exit_code == 0) {
          exit_code = -2;
        }
      }
      log.info('Finished: %s', key);
    }
  }

  if (command == 'history') {
    var outputDir = rootDir + '/' + config.history.output;
    if (config.history.output[0] == '/') {
      outputDir =  process.cwd() + config.history.output;
    }
    var defaultScreenSize = null;
    if (typeof(config.compare.screen_size) != 'undefined' && typeof(config.compare.screen_size[0] == 'string')) {
      defaultScreenSize = parseScreenSize(config.compare.screen_size[0]);
    }
    // console.log(util.inspect(defaultScreenSize, {showHidden: false, depth: null}))
    var items = new Map();
    Object.keys(config.links).forEach(function(key) {
      let value = config.links[key];
      let path = typeof(value) == 'string' ? config.links[key] : value.path;
      let prod_site = config.url.prod;
      items.set(key, {
        "prod_url": prod_site + path,
        "prod_image": outputDir + '/' + key + '.png',
      });
    });
    // console.log(util.inspect(items, {showHidden: false, depth: null}))

    for (var item of items.entries()) {
      var key = item[0], ob = item[1];
      var element;
      var screen_width = defaultScreenSize.width;
      var screen_height = defaultScreenSize.height;
      const browser = await puppeteer.launch();
      var page = await browser.newPage();
      page.setViewport({width: screen_width, height: screen_height});
      log.debug('%s: Getting PROD screenshot %s to %s ', key, ob.prod_url, ob.prod_image);
      await page.goto(ob.prod_url);

      var element;
      /******************************************************************/
      // Do some clicking to expand all page before screenshot
      if (element = await page.$('a[href="#full-assessment"]')) {
        await element.click();
        await page.waitFor(500);
        element = await page.$('.expand-button');
        await element.click();
        await page.waitFor(1000);
      }
      /******************************************************************/

      await page.screenshot({path: ob.prod_image});
      await browser.close();
    }
  }

  log.info('Done with exit code: ' + exit_code);

  process.exit(exit_code);
})();

/**
 * Determine screen dimensions from a given string using standard WxH.
 *
 * @return object with width and height properties.
 */
function parseScreenSize(size) {
  var ret = { 'width': 1280, 'height': 2048 };
  if (typeof(size) != 'undefined') {
    let parts = size.split('x');
    if (parts.length != 2) {
      let log = new Log('parseScreenSize');
      log.warn('Invalid resolution: %s, returning default: %o', size, ret);
      return ret;
    }
    if (typeof(parts[0]) == 'string' && parseInt(parts[0]) > 0 && typeof(parts[1]) == 'string' && parseInt(parts[1])) {
      ret.width = parseInt(parts[0]);
      ret.height = parseInt(parts[1]);
    }
  }
  return ret;
}
