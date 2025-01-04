const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio'); // Install cheerio: npm install cheerio
const csv = require('csv-parser'); // Install csv-parser: npm install csv-parser
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

require('dotenv').config();
var date = new Date();
var bstockURL = `https://bstock.com/superior/auction/auction/list/?condition=217&manufacturer=25`
var auctionID;
var auctionDetails;

const padTo2Digits = (num) => num.toString().padStart(2, '0');
var timeString =  `${padTo2Digits(date.getHours())}:${padTo2Digits(date.getMinutes())}:${padTo2Digits(date.getSeconds())}`

// Function to read cookies from the JSON file
const readCookies = () => {
  return new Promise((resolve, reject) => {
    fs.readFile('cookies.json', 'utf-8', (err, data) => {
      if (err) {
        reject('Error reading cookies file: ' + err);
      } else {
        resolve(JSON.parse(data));
      }
    });
  });
};

// Function to format the cookies as a string for the Cookie header
const formatCookies = (cookies) => {
  return cookies
    .map(cookie => `${cookie.name}=${cookie.value}`) // Format each cookie as "name=value"
    .join('; '); // Join them with a semicolon and space
};

// Function to fetch the HTML page and save it to an HTML file
const fetchHTMLAndSave = async (url, cookies) => {
  try {
    // Format the cookies for the request
    const cookieHeader = formatCookies(cookies);

    // Fetch the HTML page
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', // Mimic a real browser
        'Cookie': cookieHeader, // Add the formatted cookies here
      },
    });

    return response.data; // Return the HTML content for further processing

  } catch (error) {
    console.error('Error fetching HTML:', error.message);
  }
};

// Function to scrape the HTML and extract the CSV download link
const scrapeCSVLink = (html) => {
  // Modified regex to match URLs containing getall?site= followed by any site code
  const regex = /getall\?site=[a-zA-Z]+[^'"]*/;
  const match = html.match(regex);

  if (match && match[0]) {
    const csvLink = 'https://m.bstock.com/m/downloads/' + match[0];
    console.log('CSV download link found:', csvLink);
    return csvLink;
  } else {
    console.log('CSV download link not found.');
    return null;
  }
};

// Function to extract and store auction IDs
const extractAuctionIds = (csvUrl) => {
    try {
      // Use URL constructor to parse the URL
      const url = new URL(csvUrl);
      
      // Get the auction parameter from the query string
      const auctionParam = url.searchParams.get('auction');
      
      // Split the auction string into an array of IDs
      const auctionIds = auctionParam ? auctionParam.split(',') : [];
      
      // Create a JSON object to store the IDs
      const auctionData = {
        ids: auctionIds,
      };

      console.log(`Extracted ${auctionIds.length} auction IDs`);
      return auctionData;
  
    } catch (error) {
      console.error('Error extracting auction IDs:', error.message);
      return null;
    }
  };

// Function to fetch the CSV data
const fetchCSVData = async (csvUrl, cookies) => {
  try {
    // Format the cookies for the request
    const cookieHeader = formatCookies(cookies);

    // Fetch the CSV file
    const response = await axios.get(csvUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', // Mimic a real browser
        'Cookie': cookieHeader, // Add the formatted cookies here
      },
      responseType: 'stream', // Important for streaming CSV data
    });

// Parse the CSV data and collect results
const results = [];
response.data.pipe(csv())
  .on('data', (data) => results.push(data)) // Collect each row of the CSV
  .on('end', () => {
    console.log('CSV Data parsed, saving to file...');

    // Define the CSV writer with headers based on your data structure
    const csvWriter = createCsvWriter({
      path: `${date.toISOString().split('T')[0]}-${timeString}.csv`,
      header: Object.keys(results[0]).map(key => ({
        id: key,
        title: key
      }))
    });

    // Write the results to the CSV file
    csvWriter.writeRecords(results)
      .then(() => {
        console.log('CSV file has been written successfully');
      })
      .catch(err => {
        console.error('Error writing CSV file:', err);
      });
  });

  } catch (error) {
    console.error('Error fetching CSV:', error.message);
  }

};

const scrapeAuctionData = (html, auctionIds) => {
    try {
      const $ = cheerio.load(html);
      const auctionData = {};
  
      // Iterate through each auction ID
      auctionIds.forEach(id => {
        // Create nested object for each ID
        auctionData[id] = {
          [`bid_number`]: $(`#bid_number${id}`).text().trim(),
          [`price_per_unit`]: $(`#price_per_unit${id}`)
            .text()
            .replace('$', '')
            .replace(',', '')
            .trim(),
          [`current_bid_amt`]: $(`#current_bid_amt${id}`)
            .text()
            .replace('$', '')
            .replace(',', '')
            .trim()
        };
      });
  
  
      return auctionData;
  
    } catch (error) {
      console.error('Error scraping auction data:', error.message);
      return null;
    }
  };


// Function to send a request with the cookies
const fetchDataWithCookies = async () => {
  try {

    // Read cookies from the JSON file
    const cookies = await readCookies();

    // Define the URL of the page that contains the CSV link
    const url = bstockURL;

    // Fetch the HTML and save it to a file
    const html = await fetchHTMLAndSave(url, cookies);

    // Scrape the CSV download link from the HTML content
    const csvLink = scrapeCSVLink(html);

    auctionID = extractAuctionIds(csvLink);
    auctionDetails = scrapeAuctionData(html, auctionID.ids);

    if (csvLink) {
      // Fetch and parse the CSV data from the extracted link
      await fetchCSVData(csvLink, cookies);
    }

  } catch (error) {
    console.error('Error:', error.message);
  }
};

fetchDataWithCookies();
