exports.execute = execute;

/**
 * @param id - currently executing page key
 * @param page - browser page object
 */
async function execute(id, page) {
  if (id == 'homepage') {
    return;
  }

  if (element = await page.$('a[href="#full-assessment"]')) {
    await element.click();
    await page.waitFor(500);
  }
  if (element = await page.$('.expand-button')) {
      await element.click();
    await page.waitFor(1300);
  }
}
