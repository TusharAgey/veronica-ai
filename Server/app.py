from flask import Flask
from flask import Flask, send_from_directory
from werkzeug.utils import safe_join
import os
import database_resource
import constants
import logging
from flask_cors import CORS
from resources.password_manager import password_manager
from resources.kokoro_tts import kokoro_tts
from zeroconf import ServiceInfo, Zeroconf
import socket
import argparse
import signal
import sys
import atexit
import threading

app = Flask(__name__)
app.register_blueprint(password_manager)
app.register_blueprint(kokoro_tts)
zeroconf = Zeroconf()

CORS(app, support_credentials=True)

root = safe_join(os.path.dirname(__file__), 'code')
javaFiles = safe_join(os.path.dirname(__file__), 'code')
imageFiles = safe_join(os.path.dirname(__file__), 'images')

# Setup logging config
logging.basicConfig(filename="userlog.log",
                    format='%(asctime)s %(message)s',
                    filemode='w')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Default API
@app.route("/")
def home():
    return send_from_directory(root, 'index.html')

@app.route('/<path:path>', methods=['GET'])
def static_proxy(path):
    return send_from_directory(root, path)

@app.route('/<path:path>', methods=['GET'])
def static_proxy_media(path):
    return send_from_directory(javaFiles, path)

@app.route('/images/<path:path>', methods=['GET'])
def static_proxy_images(path):
    return send_from_directory(imageFiles, path)


def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(("8.8.8.8", 80))
        return s.getsockname()[0]
    finally:
        s.close()

def broadcast_ip_to_local_network():
    local_ip = get_local_ip()
    python_backend_service = ServiceInfo(
        "_http._tcp.local.",
        "veronica-server._http._tcp.local.",
        addresses=[socket.inet_aton(local_ip)],
        port=8080,
        server="veronica-server.local.",
    )
    llama_cpp_service = ServiceInfo(
        "_http._tcp.local.",
        "llama-server._http._tcp.local.",
        addresses=[socket.inet_aton(local_ip)],
        port=6792,
        server="llama-server.local.",
    )
    print("Advertising IP:", local_ip)
    # Registrations.
    zeroconf.register_service(python_backend_service)
    zeroconf.register_service(llama_cpp_service)

_shutdown_lock = threading.Lock()
_shutdown_started = False

def stop_zeroconf():
    global _shutdown_started
    with _shutdown_lock:
        if _shutdown_started:
            return
        _shutdown_started = True
    try:
        zeroconf.close()
        print("Zeroconf closed.")
    except Exception as e:
        print(f"Error: {e}")

atexit.register(stop_zeroconf)

def signal_handler(sig, frame):
    """Handles signals (like Ctrl+C) to gracefully handle cleanups."""
    print("\nSignal received. Initiating clean shutdown...")
    stop_zeroconf()
    sys.exit(0) # Exit the application cleanly

signal.signal(signal.SIGINT, signal_handler)  # SIGINT is typically triggered by Ctrl+C
signal.signal(signal.SIGTERM, signal_handler) # Good practice for process termination signals

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--no-broadcast", action="store_true")
    args = parser.parse_args()
    if not args.no_broadcast:
        broadcast_ip_to_local_network()

    DB_CREATION_STATUS = database_resource.createDatabase(logger);
    
    if(DB_CREATION_STATUS == constants.SUCCESS or DB_CREATION_STATUS == constants.ALREADY_EXISTS):
        from waitress import serve
        serve(app, host="0.0.0.0", port=8080)
    else:
        logger.critical("Failed to initialize database. Shutting down.")
