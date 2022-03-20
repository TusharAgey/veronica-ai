from flask import Flask
import database_resource
import constants
import logging
from resources.password_manager import password_manager

app = Flask(__name__)
app.register_blueprint(password_manager)

# Setup logging config
logging.basicConfig(filename="userlog.log",
                    format='%(asctime)s %(message)s',
                    filemode='w')
logger = logging.getLogger()
logger.setLevel(logging.INFO)

# Default API
@app.route("/")
def hello_world():
    return "<p>This is the brain behind veronica!</p>"

if __name__ == "__main__":
    DB_CREATION_STATUS = database_resource.createDatabase(logger);
    
    if(DB_CREATION_STATUS == constants.SUCCESS or DB_CREATION_STATUS == constants.ALREADY_EXISTS):
        from waitress import serve
        serve(app, host="0.0.0.0", port=8080)
    else:
        logger.critical("Failed to initialize database. Shutting down.")