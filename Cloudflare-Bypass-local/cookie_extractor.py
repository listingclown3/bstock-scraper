import time
import sys
import types
import json
import httpx
import execjs
import typing
from typing import Optional, Tuple, Any, Union
import random
import uuid
import subprocess
import threading
from dataclasses import dataclass

def get_and_save_cf_cookie():
    try:
        print("Getting new Cloudflare cookie...")
        cf = CF_Solver('https://bstock.com')
        cookie = cf.cookie()
        
        if cookie:
            cookies = {
                'bstock.com': {
                    'cf_clearance': cookie,
                    'timestamp': time.time()
                }
            }
            
            with open('cf_clearance_cookies.json', 'w') as f:
                json.dump(cookies, f, indent=4)
            print("Successfully saved Cloudflare cookie")
            return True
    except Exception as e:
        print(f"Error getting Cloudflare cookie: {e}")
        return False

if __name__ == "__main__":
    get_and_save_cf_cookie()