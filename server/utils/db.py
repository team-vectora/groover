from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from bson.json_util import dumps
from flask import current_app
import json

mongo = PyMongo()

def init_db(app):
    mongo.init_app(app)

def jsonify_mongo(data):
    return json.loads(dumps(data))