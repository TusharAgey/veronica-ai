from flask import Blueprint
from flask import request
from sqlalchemy import insert, select, MetaData
from database_resource import getDatabaseEngine, getPasswordTable
from domain.UserPassword import UserPassword
from datetime import date

password_manager = Blueprint('password_manager', __name__)

###
## APIs to create a new account definition.
###
@password_manager.route("/password-manager/new", methods=['POST'])
def newPassword():
    creation_date = date.today()
    PASSWORD_TABLE = getPasswordTable(MetaData())
    response = request.get_json()
    stmt = insert(PASSWORD_TABLE).values(
        ACCOUNT_NAME = response['account_name'],
        ACCOUNT_DESCRIPTION = response['account_description'],
        USERNAME = response['username'],
        PASSWORD = response['password'],
        CREATION_DATE = creation_date
    )
    engine = getDatabaseEngine();
    response = "{\"status\": \"Succesfull\"}"
    with engine.connect() as conn:
        try:
            conn.execute(stmt)
        except:
            response = "{\"error\": \"Could not add new entry. Sorry!\"}"

    return response

###
## APIs to get the account details.
###
@password_manager.route("/password-manager/user/<accountName>")
def retrieveDetails(accountName):
    stmt = select(UserPassword).where(UserPassword.account_name == accountName)
    engine = getDatabaseEngine()
    response = {};
    with engine.connect() as conn:
        try:
            response = dict(conn.execute(stmt).one())
        except:
            response = {"error": "No data found for the account: "+accountName}
    return dict(response)

###
## APIs to get all available accounts.
###
@password_manager.route("/password-manager/user/accounts")
def getAllAccounts():
    stmt = select(UserPassword.account_name)
    engine = getDatabaseEngine()
    response = {}
    accounts = []
    with engine.connect() as conn:
        try:
            for row in conn.execute(stmt):
                accounts.append(row.account_name)
            print(accounts)
            print(type(accounts))
            response = {
                "accounts": accounts
            }
        except:
            response = {"error": "Failed to execute"}
    print(response)
    return response
