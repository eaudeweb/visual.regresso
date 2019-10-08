exports.execute = execute;

/**
 * @param id - currently executing page key
 * @param page - browser page object
 */
async function execute(id, page) {
  // Ignore some page by its config ID
  if (id == 'homepage') {
    return;
  }

  await page.evaluate(() => {
    // Find a link in page by its "href" value, and click on it
    let element = document.querySelector('a[href="#full-assessment"]');
    if(element != null) {
      element.click();
    }

    // Find an element in page by CSS class and click on it
    element = document.querySelector('.expand-button');
    if(element != null) {
      element.click();
    }

    // Hide ad div, like a Google map because it yields false positives
    jQuery('#leaflet-map').hide();
    // Another method using vanillaJS
    document.getElementById('#leaflet-map').style.display = 'none';
  });
}
