const readYaml = require('read-yaml');
const puppeteer = require('puppeteer');
const Log = require('debug-level');
const sprintfjs = require('sprintf-js');
const sprintf = sprintfjs.sprintf;

(async () => {
  var exit_code = 0;
  const log = new Log('main');
  var command = null;
  if (process.argv[2]) {
    command = process.argv[2];
  }
  else {
    log.error("Usage: node index.js <compare|history>");
    return -1;
  }
  var config = readYaml.sync('config.yml');
  log.info('Executing command: ' + command);

  if (command == 'compare') {
    var items = new Map();
    Object.keys(config.compare.links).forEach(function(key) {
      var path = config.compare.links[key];
      var prod_site = config.compare.url.prod;
      var test_site = config.compare.url.test;
      items.set(key, {
        "prod_url": prod_site + path,
        "test_url": test_site + path,
        "prod_image": config.compare.output + '/' + key + '_prod.png',
        "test_image": config.compare.output + '/' + key + '_test.png',
        "diff_image": config.compare.output + '/diff/' + key + '_diff.png',
      });
    });

    for (var item of items.entries()) {
      var key = item[0], ob = item[1];
      var element;

      var screen_width = 1280;
      var screen_height = 15000;

      const browser = await puppeteer.launch();
      var page = await browser.newPage();
      page.setViewport({width: screen_width, height: screen_height});
      log.debug('%s: Getting PROD screenshot %s to %s ', key, ob.prod_url, ob.prod_image);

      await page.goto(ob.prod_url);

      /******************************************************************/
      // Do some clicking to expand all page before screenshot
      if (element = await page.$('a[href="#full-assessment"]')) {
        await element.click();
        await page.waitFor(500);
      }
      if (element = await page.$('.expand-button')) {
        await element.click();
        await page.waitFor(1000);
      }
      /******************************************************************/

      await page.screenshot({path: ob.prod_image});

      var page = await browser.newPage();
      page.setViewport({width: screen_width, height: screen_height});
      log.debug('%s: Getting TEST screenshot %s to %s', key, ob.prod_url, ob.test_image);

      await page.goto(ob.test_url);

      /******************************************************************/
      // Do some clicking to expand all page before screenshot
      if (element = await page.$('a[href="#full-assessment"]')) {
        await element.click();
        await page.waitFor(500);
      }
      if (element = await page.$('.expand-button')) {
        await element.click();
        await page.waitFor(1000);
      }
      /******************************************************************/
      await page.screenshot({path: ob.test_image});
      await browser.close();

      const { spawnSync} = require('child_process');

      log.debug('%s: Removing existing DIFF image %s', key, ob.diff_image);
      const child_rm = spawnSync('rm', ['-f', ob.diff_image]);

      log.debug('%s: Creating DIFF image %s', key, ob.diff_image);
      log.debug(key + ': Command: ' + config.compare.compare_binary + ' -metric AE -fuzz 10% -highlight-color red ' + ob.prod_image + ' ' + ob.test_image + ' ' + ob.diff_image);
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
        if (exit_code == 0) {
          exit_code = -1;
        }
      }
      else {
        // Error - could not generate diff image, set global error flag
        if (exit_code == 0) {
          exit_code = -2;
        }
      }
      log.info('Finished: %s', key);
    }
  }

  if (command == 'history') {
    var items = new Map();
    Object.keys(config.history.links).forEach(function(key) {
      var path = config.history.links[key];
      var prod_site = config.history.url;
      items.set(key, {
        "prod_url": prod_site + path,
        "prod_image": config.history.output + '/' + key + '.png',
      });
    });

    for (var item of items.entries()) {
      var key = item[0], ob = item[1];
      var element;
      var screen_width = 1280;
      var screen_height = 15000;

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
