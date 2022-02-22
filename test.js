const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({ headless: false });

  browser.on("targetcreated", function () {
    console.log("New Tab Created");
  });

  // get current tab count
  console.log("current page count ", (await browser.pages()).length); // 3

  // create a new tab
  await browser.newPage();
  // lets see if tab increased
  console.log("current page count ", (await browser.pages()).length); // 3

  // use destructuring for easier usage
  const [tabOne, tabTwo] = await browser.pages();

  // use the tabs aka Page objects properly
  await tabOne.goto("https://example.com");
  console.log("Tab One Title ", await tabOne.title()); // Example Domain

  // use the tabs aka Page objects properly
  await tabTwo.goto("https://example.com");
  console.log("Tab Two Title ", await tabTwo.title()); // Example Domain

  await tabOne.evaluate(() => {
    window.open("http://www.example.com", "_blank");
  });
  await tabOne.waitFor(2000); // wait for a while
  console.log("current page count ", (await browser.pages()).length); // 3

  // close the browser
  await browser.close();
})();
