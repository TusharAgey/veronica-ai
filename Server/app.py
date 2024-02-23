from flask import Flask
from flask import Flask, send_from_directory
from werkzeug.utils import safe_join
import os
import database_resource
import constants
import logging
from flask_cors import CORS
from resources.password_manager import password_manager

app = Flask(__name__)
app.register_blueprint(password_manager)
CORS(app, support_credentials=True)

root = safe_join(os.path.dirname(__file__), 'code')
javaFiles = safe_join(os.path.dirname(__file__), 'code')

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

if __name__ == "__main__":
    DB_CREATION_STATUS = database_resource.createDatabase(logger);
    
    if(DB_CREATION_STATUS == constants.SUCCESS or DB_CREATION_STATUS == constants.ALREADY_EXISTS):
        from waitress import serve
        serve(app, host="0.0.0.0", port=8080)
    else:
        logger.critical("Failed to initialize database. Shutting down.")