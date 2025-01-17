#!/bin/bash

echo "Starting script execution..."

# CD into Cloudflare-Bypass-local and run cookie extractor
echo "Extracting cookies..."
cd Cloudflare-Bypass-local
python3 cookie_extractor.py

# Check if cookie extractor was successful
if [ $? -ne 0 ]; then
    echo "Cookie extraction failed!"
    exit 1
fi

# CD back and run puppeteer.js
echo "Running puppeteer script..."
cd ..
node puppeteer_login.js

# Check if puppeteer script was successful
if [ $? -ne 0 ]; then
    echo "Puppeteer script failed!"
    exit 1
fi

# Run index.js
echo "Running index script..."
node index.js

# Check if index script was successful
if [ $? -ne 0 ]; then
    echo "Index script failed!"
    exit 1
fi

echo "Script execution completed successfully!"
