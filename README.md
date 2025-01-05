# bstock-scraper
Scrapes BStock iPhones on Superior Wireless Auctions to get the best deals

# tos
this is 105% against bstock TOS but ¯\_(ツ)_/¯
- for the education!

# this shit is buggy
- gotta provide sudo apt shell to download all the dependenceis for python and nodejs, and then the chromeium image
- gotta add the CloudFlare bypass repository so that it actually works
- Gotta automate the system that creates the CSV system
- Create a comping system (send a comp request from a discord bot, sent off to a server)

# how to use
1. download the [chrome cookie downloader](https://chromewebstore.google.com/detail/copy-cookies/jcbpglbplpblnagieibnemmkiamekcdg) (id: jcbpglbplpblnagieibnemmkiamekcdg)
2. log into bstock and use the extension (it will copy your cookies into a json form to be pasted into cookies.json file) 
- IMPORTANT: YOU MUST COPY THE COOKIES FROM THEIR RESPECTIVE SITES. IF YOU ARE PULLING CSV's FROM SUPERIOR COPY COOKIES FROM SUPERIOR, ETC OR IT WILL NOT WORK.
3. go to bstock and go to one like superior wireless or gamestop
  - apply your filters which will change the URL
  - ex: https://bstock.com/gamestop/?carrier=161&condition=392&manufacturer=41
  - paste into the respective string in the code
3. do npm run test
4. files should be in the file system

# errors
- 403 error code probably means you messed up the authorization or you got blocked by CloudFlare (yikes, it happened to me)

# todo
- export data to webhook/readable format
- add a website to paste this data and download the data
- bypass cloudflare
- add GameStop functionality (read below if anyone is interested in fixing it)

# gamestop funky
GameStop has a weird system of list view
- must set https://bstock.com/gamestop/?carrier=161&condition=392&manufacturer=41&mode=list
mode=list
- then you are redirected, THEN you can do https://bstock.com/gamestop/?carrier=161&condition=392&manufacturer=41 in order to get the correctly scraped site?

tldr; you have to set mode=list first then you are redirected which then you can use to extract data. probably has something to do with cookies but i'm not sure.

