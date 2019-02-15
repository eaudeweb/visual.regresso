exports.execute = execute;

/**
 * @param id - currently executing page key
 * @param page - browser page object
 */
async function execute(id, page) {
  if (id == 'homepage') {
    return;
  }
  await page.evaluate(() => {
    let element = document.querySelector('a[href="#full-assessment"]');
    if(element != null) {
      element.click();
    }

    element = document.querySelector('.expand-button');
    if(element != null) {
      element.click();
    }
  });
}
