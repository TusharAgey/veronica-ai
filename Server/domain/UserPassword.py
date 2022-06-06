import constants
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import declarative_base
Base = declarative_base()

###
## ORM definition of the table to store user account credentials.
###
class UserPassword(Base):
    __tablename__ = constants.PASSWORD_TABLE

    account_name =           Column(String(256), primary_key=True)
    account_description =    Column(String(1024))
    username =               Column(String(64))
    password =               Column(String(64))
    email =                  Column(String(64))
    creation_date =          Column(DateTime)

    def __repr__(self):
       return f"UserPassword(id={self.id!r}, email={self.email}, account_name={self.account_name!r}, account_description={self.account_description!r}, username={self.username!r},password={self.password!r},creation_date={self.creation_date!r})"
