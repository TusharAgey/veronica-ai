# veronica-ai
Veronica - The Personal Assistant!

The wait is over! do you need a fully customizable and feature packed virtual assistant? This is the right place! Goal is to identify and solve common problems with asthetically pleasing UX and state of the art technologies powering the assistant.

# Contribution guidelines

Pick an issue and start working on it. Once the feature is complete, create a pull request.

# Setup requirements

Server:
  * Create a python3 virtual environment and run pip install over the requirements.
    * pip install -r requirements.txt
  * From the Server directory, start the flask server.
    * python app.py  
  * Server logs are all dumped into a log file. If its the first time that the server is coming up, it will automatically initialize the SqlLite database for data storage.  

UI:

  * Build using Node v16.13.0.
  * From the ui directory, install project dependencies.
    * npm install
  * Once the dependencies are installed, start the development server.
    * npm start 
