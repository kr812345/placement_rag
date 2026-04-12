import urllib.request
url = 'https://upload.wikimedia.org/wikipedia/en/thumb/f/f4/Delhi_University_logo.svg/300px-Delhi_University_logo.svg.png'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'})
with urllib.request.urlopen(req) as response:
    with open('du-logo.png', 'wb') as f:
        f.write(response.read())
print("Downloaded successfully.")
