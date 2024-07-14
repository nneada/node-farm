const fs = require("fs");
const http = require("http");
const url = require("url");
const slugify = require("slugify");
const replaceTemplate = require("./modules/replaceTemplate");

// ################# File ###############

// Blocking, synchronous way
// const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
// console.log(textIn);
// const textOut = `This is what we know about the avocado: ${textIn}\nCreated on ${Date.now()}`;
// fs.writeFileSync("./txt/output.txt", textOut);
// console.log("file written");

// Non-blocking, asynchronous way
// fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
//   if (err) return console.log("Error: file not found");
//   fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
//     console.log(data2);
//     fs.readFile(`./txt/append.txt`, "utf-8", (err, data3) => {
//       console.log(data3);
//       fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
//         console.log("Your file has been written");
//       });
//     });
//   });
// });
// console.log("waiting for the file to be read....");

// ################# Server ###############

// const replaceTemplate = (productCard, product) => {
//   let output = productCard.replace(/{%PRODUCTNAME%}/g, product.productName);
//   output = productCard.replace(/{%IMAGE%}/g, product.image);
//   output = productCard.replace(/{%PRICE%}/g, product.price);
//   output = productCard.replace(/{%FROM%}/g, product.from);
//   output = productCard.replace(/{%NUTRIENTS%}/g, product.nutrients);
//   output = productCard.replace(/{%QUANTITY%}/g, product.quantity);
//   output = productCard.replace(/{%DESCRIPTION%}/g, product.description);
//   output = productCard.replace(/{%ID%}/g, product.id);

//   if (!product.organic)
//     output = productCard.replace(/{%NOT_ORGANIC%}/g, "not-organic");
//   return output;
// };

const tempOverview = fs.readFileSync(
  `${__dirname}/templates/overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/product.html`,
  "utf-8"
);

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);
const urlLowerCase = dataObj.map((productObj) =>
  slugify(productObj.productName, { lower: true })
);
console.log(urlLowerCase);

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  // overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });
    const cardsHTML = dataObj
      .map((productObj) => replaceTemplate(tempCard, productObj))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHTML);
    res.end(output);

    // product page
  } else if (pathname === "/product") {
    res.writeHead(200, { "Content-type": "text/html" });
    const product = dataObj[query.id];
    const output = replaceTemplate(tempProduct, product);
    res.end(output);

    // api
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    // not found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello world",
    });
    res.end("<h1>Page not found</h2>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to request on port 8000: http://127.0.0.1:8000");
});
