const puppeteer = require('puppeteer');
const path = require('path');
const dateFormat = require('date-format');
const fs = require('fs');

let history = {}

history.doHistory = async(config, log) => {
  var rootDir = path.dirname(require.main.filename);
  let d = dateFormat.asString('yyyy-MM-dd');
  var outputDir = rootDir + '/history/' + d;
  // Create output path if not exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }
  var defaultScreenSize = null;
  if (typeof(config.compare.screen_size) != 'undefined' && typeof(config.compare.screen_size[0] == 'string')) {
    defaultScreenSize = parseScreenSize(config.compare.screen_size[0]);
  }
  var items = new Map();
  Object.keys(config.links).forEach(function(key) {
    let value = config.links[key];
    let path = typeof(value) == 'string' ? config.links[key] : value.path;
    let prod_site = config.url.prod;
    items.set(key, {
      "prod_url": prod_site + path,
      "prod_image": outputDir + '/' + key + '.png',
      "key": key,
    });
  });
  log.info("Taking historical screenshots of %s pages", items.size);
  let i = 0;
  let reportHtml = '<!DOCTYPE html>';
  reportHtml += '<html>';
  reportHtml += '<body>';
  reportHtml += '<h1>Historical screenshot images taken on ' + d + '</h1>';
  reportHtml += '<table border="1" width="100%">';
  reportHtml += '<thead><tr>';
  reportHtml += '<th>Filename</th>';
  reportHtml += '<th>URL</th>';
  reportHtml += '</tr>';
  reportHtml += '</thead><tbody>';
  for (var item of items.entries()) {
    var key = item[0], ob = item[1];
    var element;
    var screen_width = defaultScreenSize.width;
    var screen_height = defaultScreenSize.height;
    const browser = await puppeteer.launch();
    var page = await browser.newPage();
    i++;
    var filename = ob.key + '.png';
    page.setViewport({width: screen_width, height: screen_height});
    log.info('%s/%s ./history/%s/%s.png: %s ', i, items.size, d, ob.key, ob.prod_url);
    await page.goto(ob.prod_url, {waitUntil: 'domcontentloaded'});
    await page.screenshot({path: ob.prod_image});
    await browser.close();
    reportHtml += '<tr>';
    reportHtml += '<td><a href="' + filename + '" title="Middle-click to open the image in new tab">' + filename + '</a></td>';
    reportHtml += '<td><a href="' + ob.prod_url + '">' + ob.prod_url + '</td>';
    reportHtml += '</tr>';
  }
  reportHtml += '</tbody>';
  reportHtml += '</table>';
  reportHtml += '</body>';
  reportHtml += '</html>';
  let reportFilename = outputDir + '/index.html';
  log.info("Writing the report to: " + reportFilename);
  fs.writeFileSync(reportFilename, reportHtml, function() {});
}

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

module.exports = history;
