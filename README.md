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
1. download the [chrome cookie downloader](https://chromewebstore.google.com/detail/copy-cookies/jcbpglbplpblnagieibnemmkiamekcdg) (id: jcbpglbplpblnagieibnemmkiamekcdg)
2. log into bstock and use the extension (it will copy your cookies into a json form to be pasted into cookies.json file) 
- IMPORTANT: YOU MUST COPY THE COOKIES FROM THEIR RESPECTIVE SITES. IF YOU ARE PULLING CSV's FROM SUPERIOR COPY COOKIES FROM SUPERIOR, ETC OR IT WILL NOT WORK.
3. go to bstock and go to one like superior wireless or gamestop
  - apply your filters which will change the URL
  - ex: https://bstock.com/gamestop/?carrier=161&condition=392&manufacturer=41
  - paste into the .env file (create if not made)
4. go to Cloudflare-Bypass-local and pip install -r requirements.txt (still doesn't fully work, will implement a better version)
5. files should be in the file system
6.  chmod +x run.sh
7. ./run.sh

# errors
- 403 error code probably means you messed up the authorization or you got blocked by CloudFlare (yikes, it happened to me)

# gamestop funky
GameStop has a weird system of list view
- must set https://bstock.com/gamestop/?carrier=161&condition=392&manufacturer=41&mode=list
mode=list
- then you are redirected, THEN you can do https://bstock.com/gamestop/?carrier=161&condition=392&manufacturer=41 in order to get the correctly scraped site?

tldr; you have to set mode=list first then you are redirected which then you can use to extract data. probably has something to do with cookies but i'm not sure.

