exports.execute = execute;

/**
 * @param id - currently executing page key
 * @param page - browser page object
 * @param timeout - screenshot_timeout for currently executing page
 */
async function execute(id, page, timeout) {
  if (id == 'homepage') {
    return;
  }

  if (element = await page.$('a[href="#full-assessment"]')) {
    await element.click();
    await page.waitFor(timeout);
  }
  if (element = await page.$('.expand-button')) {
      await element.click();
    await page.waitFor(timeout);
  }
}
