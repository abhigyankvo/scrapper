const express = require("express");
const puppeteer = require("puppeteer-extra");
const AdblockerPlugin = require("puppeteer-extra-plugin-adblocker");

puppeteer.use(AdblockerPlugin({ blockTrackers: true }));
const app = express();

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.get("/search/:searchQuery", async (req, res) => {
  console.log("Reached search");
  let searchQuery = req.params.searchQuery;
  console.log(searchQuery);
  let { searchTitles, downloadQualityList } = await search(searchQuery);
  res.send({ searchTitles, downloadQualityList });
});
app.get(
  "/download/:searchQuery/:movieIndex/:qualityIndex",
  async (req, res) => {
    let searchQuery = req.params.searchQuery;
    let movieIndex = parseInt(req.params.movieIndex);
    let qualityIndex = parseInt(req.params.qualityIndex);
    console.log("Reached download");
    console.log(searchQuery);
    console.log(movieIndex);
    console.log(qualityIndex);
    let downloadResult = await downloadTorrent(
      searchQuery,
      movieIndex,
      qualityIndex
    );
    res.send({ downloadResult });
  }
);

let runBrowser = async () => {
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto("https://wvw.yts.vc/");
  return { browser, page };
};

const getInnerHTML = async (elementHandleArray) => {
  let list = [];
  for (let i = 0; i < elementHandleArray.length; i++) {
    let res = await elementHandleArray[i].evaluate((r) => r.innerText);
    list.push(res);
  }
  return list;
};

let search = async (query) => {
  let { browser, page } = await runBrowser();
  await page.type("#main-search-fields input", query, { delay: 100 });
  await page.click("#main-search-btn input", { waitUntil: "networkidle2" });
  await page.waitForSelector(".browse-movie-title");
  let searchResults = await page.$$(".browse-movie-title");

  let searchTitles = await getInnerHTML(searchResults);

  let downloadQualityList = [];
  for (let i = 0; i < searchResults.length; i++) {
    await searchResults[i].click({ button: "middle" });
    await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](200);

    const [tab1, tab2, tab3] = await browser.pages();
    console.log("Tab Count", (await browser.pages()).length);

    await tab3.bringToFront();
    await tab3.waitForSelector("#movie-info > p a");
    const downloadOptions = await tab3.$$("#movie-info > p a");
    let downloadQuality = await getInnerHTML(downloadOptions);
    downloadQualityList.push(downloadQuality);
    tab3.close();
    await tab2.bringToFront();
  }
  console.log(searchTitles);
  console.log(downloadQualityList);
  await browser.close();
  return { searchResults, searchTitles, downloadQualityList };
};

let downloadTorrent = async (searchQuery, movieIndex, qualityIndex) => {
  let { browser, page } = await runBrowser();
  await page.type("#main-search-fields input", searchQuery, { delay: 100 });
  await page.waitForSelector("#main-search-btn input");
  await page.click("#main-search-btn input");
  await page.waitForSelector(".browse-movie-title");
  let searchResults = await page.$$(".browse-movie-title");
  await searchResults[movieIndex].evaluate((e) => e.click());
  console.log("Clicked movie");
  await page.waitForSelector("#movie-info > p a");
  const downloadOptions = await page.$$("#movie-info > p a");
  await downloadOptions[qualityIndex].evaluate((e) => e.click());
  console.log("Clicked quality");
  await setTimeout[Object.getOwnPropertySymbols(setTimeout)[0]](200);
  browser.close();
  return "Downloaded";
};

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
