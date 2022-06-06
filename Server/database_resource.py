from os.path import exists
from sqlalchemy import create_engine, MetaData, Table, Column, String, DateTime
import constants

DATABASE_FILE_LOCATION = "./"+constants.USER_DATABASE_NAME+".db";

###
## Utility function to check if file exists.
###
def doesFileExistInLocal(filename): 
    return exists(filename)

###
## Utility function to create password table.
###
def getPasswordTable(metadata_obj):
    USER_PASSWORDS_TABLE = Table(
        constants.PASSWORD_TABLE,
        metadata_obj,
        Column('ACCOUNT_NAME', String(256), primary_key=True),
        Column('ACCOUNT_DESCRIPTION', String(1024)),
        Column('USERNAME', String(64)),
        Column('PASSWORD', String(64)),
        Column('EMAIL', String(64)),
        Column('CREATION_DATE', DateTime)
    );
    return USER_PASSWORDS_TABLE

###
## Utility function to get the SqlLite database connection.
###
def getDatabaseEngine():
    return create_engine('sqlite:///'+DATABASE_FILE_LOCATION)

###
## Utility function to create the database for the first time.
###
def createDatabase(logger):
    metadata_obj = MetaData()
    if(doesFileExistInLocal(DATABASE_FILE_LOCATION)):
        logger.info("Database file already exists. Starting Server.")
        return constants.ALREADY_EXISTS
    try:
        getPasswordTable(metadata_obj);
        engine = getDatabaseEngine()
        metadata_obj.create_all(engine)
        logger.info("Database initialized!")
    except:  
        return constants.FAILURE
    return constants.SUCCESS;
