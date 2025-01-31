# bstock-scraper
Scrapes BStock inventory and extracts CSV files :)

# tos
this is 105% against bstock TOS but ¯\_(ツ)_/¯
- for the education!

# note
- not exactly usable unless you can find a way to clone gitpod docker file then downloada all the dependencies manually (oracle doesn't use amd64 or sm)

# todo
- export data to webhook/readable format
- add a website to paste this data and download the data
- bypass cloudflare
- add GameStop functionality (read below if anyone is interested in fixing it)
- create a shell command to download all dependencies (nodejs, pip, chromemium)
- create an auto price comparison system
- webhook/POST integration (package maybe?)

# how to use
1. download deps from npm i index.js & puppeteer_login.js and pip install -r requirements.txt from Cloudflare-Bypass-local
2.  chmod +x run.sh
3. ./run.sh
4. check manifests for compilation of data and auction_details for prices, etc.

# errors
- 403 error code probably means you messed up the authorization or you got blocked by CloudFlare (yikes, it happened to me)
- if on aarch64 (uname -m)
  sudo apt update
  sudo apt install chromium-browser -y

  add 
  ```
     const puppeteer = require('puppeteer-core');

     const browser = await puppeteer.launch({
        executablePath: '/usr/bin/chromium-browser', // Use installed Chromium
        headless: true
     });

    or just the executablePath for the chrome browswer

    or on google-stable

    const puppeteer = require('puppeteer-core');

    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/google-chrome', // Change this if the path is different
      headless: true
    });

  ```



# gamestop funky
GameStop has a weird system of list view
- must set https://bstock.com/gamestop/?carrier=161&condition=392&manufacturer=41&mode=list
mode=list
- then you are redirected, THEN you can do https://bstock.com/gamestop/?carrier=161&condition=392&manufacturer=41 in order to get the correctly scraped site?

tldr; you have to set mode=list first then you are redirected which then you can use to extract data. probably has something to do with cookies but i'm not sure.

