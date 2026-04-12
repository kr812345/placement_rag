import urllib.request, json, urllib.parse

for q in ["amazon sde intern", "flipkart sde", "tcs digital ninja"]:
    url = "http://127.0.0.1:8000/search/?query=" + urllib.parse.quote(q)
    with urllib.request.urlopen(url) as r:
        data = json.loads(r.read())
        print("Query:", q)
        for d in data[:2]:
            print("  id=" + d["id"] + "  company=" + d["company"])
        print()
