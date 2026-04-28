import uvicorn
import ngrok
import os
import sys
import asyncio

# Add the current directory to sys.path to ensure 'app' can be imported
sys.path.append(os.getcwd())

from app.main import app

async def start_ngrok():
    # Set the authtoken directly
    authtoken = "2tQzm9gRMVMa4QoHRgsh2IlyFjF_3pNYC99teUuF9UvQXs5J4"
    
    # Establish a forward tunnel to port 8000 with a static domain
    tunnel = await ngrok.forward(8000, authtoken=authtoken, domain="mallard-tidy-rhino.ngrok-free.app")
    
    url = tunnel.url()
    print(f"\n🚀 Ngrok Tunnel Established!")
    print(f"🔗 Public URL: {url}")
    
    # Also save to a file for easy retrieval
    with open("ngrok_url.txt", "w") as f:
        f.write(url)
    
    print(f"📝 Update your frontend .env.local with: NEXT_PUBLIC_API_URL={url}\n")
    
    return tunnel

if __name__ == "__main__":
    # Since FastAPI/Uvicorn is async-friendly, we can run both
    # But uvicorn.run is blocking. We'll start ngrok then run uvicorn.
    
    # We use the sync version of forward if not in an event loop, 
    # but the ngrok-python 1.x SDK is mostly async-first or provides both.
    # Let's use the sync helper if available or run in loop.
    
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    tunnel = loop.run_until_complete(start_ngrok())
    
    try:
        uvicorn.run(app, host="127.0.0.1", port=8000)
    except KeyboardInterrupt:
        print("Shutting down...")
