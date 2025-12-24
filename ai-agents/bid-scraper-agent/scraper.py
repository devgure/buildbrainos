import requests
from bs4 import BeautifulSoup

def fetch_dummy():
    return [{"id":"op_1","title":"Sample Bid","source":"dodge"}]

if __name__ == '__main__':
    print(fetch_dummy())
