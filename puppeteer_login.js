const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

puppeteer.use(StealthPlugin());

// Create screenshots directory if it doesn't exist
const screenshotDir = path.join(__dirname, 'screenshots');
if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir);
}

// Helper function for delays
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

async function takeScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = path.join(screenshotDir, `${name}_${timestamp}.png`);
    await page.screenshot({ 
        path: filename,
        fullPage: true 
    });
    console.log(`Screenshot saved: ${filename}`);
}

async function login() {
    let browser;
    let page;
    try {
        // Read the CF cookie
        const cookieData = JSON.parse(fs.readFileSync('./Cloudflare-Bypass-local/cf_clearance_cookies.json'));
        const cfCookie = cookieData['bstock.com']['cf_clearance'];

        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--no-first-run',
                '--no-zygote',
                '--single-process'
            ]
        });        

        page = await browser.newPage();

        // Set viewport for consistent screenshots
        await page.setViewport({ width: 1920, height: 1080 });
        
        // Set the Cloudflare cookie
        await page.setCookie({
            name: 'cf_clearance',
            value: cfCookie,
            domain: '.bstock.com',
            path: '/'
        });

        // Set stealth headers
        await page.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        });

        // Navigate to homepage with increased timeout
        console.log('Navigating to homepage...');
        await page.goto('https://bstock.com', {
            waitUntil: ['domcontentloaded'],
            timeout: 60000
        });
        await takeScreenshot(page, '1_homepage');

        // Wait for page content to ensure it's loaded
        await page.waitForSelector('body', { timeout: 30000 });

        // Click sign in button with retry logic
        console.log('Clicking sign in...');
        await page.waitForSelector('button.ui__LogoutButton-sc-637d74e-1.kKHFiE', { timeout: 30000 });
        await page.evaluate(() => {
            const button = document.querySelector('button.ui__LogoutButton-sc-637d74e-1.kKHFiE');
            if (button) button.click();
        });
        await delay(3000); // Using delay instead of waitForTimeout
        await takeScreenshot(page, '2_signin_modal');

        // Fill email
        console.log('Entering email...');
        await page.waitForSelector('input[name="email"]', { timeout: 30000 });
        await page.type('input[name="email"]', process.env.EMAIL, { delay: 100 });
        await takeScreenshot(page, '3_email_entered');

        // ... (previous code remains the same until after homepage navigation)

        // After homepage loads, check for both possible sign-in elements
        console.log('Checking for sign in options...');
        try {
            // Wait for either the regular sign-in button or the register page sign-in link
            await Promise.race([
                page.waitForSelector('button.ui__LogoutButton-sc-637d74e-1.kKHFiE', { timeout: 15000 }),
                page.waitForSelector('a.Link-sc-9c8f020e-0.jjbhbF.sc-fufdwm.gEiXLK', { timeout: 15000 })
            ]);

            // Check which element exists and click accordingly
            const isRegisterPage = await page.evaluate(() => {
                const signInLink = document.querySelector('a.Link-sc-9c8f020e-0.jjbhbF.sc-fufdwm.gEiXLK');
                if (signInLink) {
                    signInLink.click();
                    return true;
                }
                const signInButton = document.querySelector('button.ui__LogoutButton-sc-637d74e-1.kKHFiE');
                if (signInButton) {
                    signInButton.click();
                    return false;
                }
                return false;
            });

            console.log(isRegisterPage ? 'Clicked sign in link from register page' : 'Clicked regular sign in button');
            await delay(3000);
            await takeScreenshot(page, '2_after_signin_click');

        } catch (error) {
            console.log('Error finding sign in elements, taking screenshot and dumping HTML...');
            await takeScreenshot(page, 'signin_element_error');
            const html = await page.content();
            fs.writeFileSync('page_content.html', html);
            throw new Error('Could not find sign in elements');
        }

        // Fill email in first form
        console.log('Entering email...');
        await page.waitForSelector('input[name="email"]', { timeout: 30000 });
        await page.type('input[name="email"]', process.env.EMAIL, { delay: 100 });
        await takeScreenshot(page, '3_email_entered');

        // Click Let's go
        console.log("Clicking Let's go...");
        await page.waitForSelector('button.hzORyK.fpVtXa', { timeout: 30000 });
        await page.evaluate(() => {
            const button = document.querySelector('button.hzORyK.fpVtXa');
            if (button) button.click();
        });
        await delay(3000);
        await takeScreenshot(page, '4_after_lets_go');

        // Handle OAuth login - skip email input, go straight to password
        console.log('Handling OAuth login...');
        await page.waitForSelector('#password', { timeout: 30000 });
        await page.type('#password', process.env.PASSWORD, { delay: 100 });
        await takeScreenshot(page, '5_password_entered');

        // Submit login
        console.log('Submitting login...');
        try {
            // Click the login button
            await page.click('button.ui.button.fluid.margin-top-1em');
            
            // Wait a few seconds for cookies to be set
            console.log('Waiting for cookies to be set...');
            await new Promise(resolve => setTimeout(resolve, 5000));

            // Take screenshot before dumping cookies
            console.log('Taking post-login screenshot...');
            await takeScreenshot(page, 'post_login_state');
            
            // Dump cookies with additional logging
            console.log('Attempting to dump cookies...');
            const cookies = await page.cookies();
            
            if (!cookies || cookies.length === 0) {
                console.log('Warning: No cookies found');
            } else {
                console.log(`Found ${cookies.length} cookies`);
            }

            fs.writeFileSync(
                'cookies.json',
                JSON.stringify(cookies, null, 2),
                'utf-8'
            );
            console.log('Cookies successfully saved to cookies.json');

        } catch (error) {
            console.error('Error during login process:', error);
            await takeScreenshot(page, 'login_error');
            throw error;
        }

        // Dump initial cookies
        console.log('Dumping initial cookies...');
        const cookies = await page.cookies();
        fs.writeFileSync(
            'cookies.json',
            JSON.stringify(cookies, null, 2),
            'utf-8'
        );
        console.log('Initial cookies saved to cookies.json');

        // Create new page with saved cookies
        console.log('Testing cookies on new page...');
        const newPage = await browser.newPage();
        
        // Set viewport for consistent screenshots
        await newPage.setViewport({ width: 1920, height: 1080 });
        
        // Set the same headers
        await newPage.setExtraHTTPHeaders({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept-Language': 'en-US,en;q=0.9',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8'
        });

        // Set all cookies from previous session
        await newPage.setCookie(...cookies);

        // Navigate to the LINK from .env
        console.log('Navigating to specified LINK...');
        await newPage.goto(process.env.LINK + `&mode=list`, {
            waitUntil: ['domcontentloaded'],
            timeout: 60000
        });

        // Take screenshot of new page
        await takeScreenshot(newPage, 'cookie_test_page');

        // Dump cookies from new page
        console.log('Dumping cookies from test page...');
        const newCookies = await newPage.cookies();
        fs.writeFileSync(
            'cookies_usage.json',
            JSON.stringify(newCookies, null, 2),
            'utf-8'
        );
        console.log('Test page cookies saved to cookies_usage.json');

        await newPage.close();

    } catch (error) {
        console.error('Error:', error);
        if (page) {
            console.log('Taking error screenshot...');
            await takeScreenshot(page, 'error_state');
            
            console.log('Dumping page content...');
            const content = await page.content();
            fs.writeFileSync('error_page.html', content);
            
            console.log('Saving error state cookies...');
            try {
                const cookies = await page.cookies();
                fs.writeFileSync(
                    'cookies_error.json',
                    JSON.stringify(cookies, null, 2),
                    'utf-8'
                );
            } catch (cookieError) {
                console.error('Failed to save cookies:', cookieError);
            }
        }
        throw error;
    } finally {
        if (browser) {
            await browser.close();
            console.log('Browser closed');
        }
    }
}

// Add error handling for the main execution
(async () => {
    try {
        await login();
    } catch (error) {
        console.error('Script failed:', error);
        process.exit(1);
    }
})();
