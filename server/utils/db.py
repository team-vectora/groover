from flask_pymongo import PyMongo
from bson.objectid import ObjectId
from bson.json_util import dumps
from flask import current_app
import json

mongo = PyMongo()

def init_db(app):
    try:
        mongo.init_app(app, uri=app.config['MONGO_URI'])
        # Testa a conexão
        mongo.db.command('ping')
        current_app.logger.info("Conexão com MongoDB estabelecida com sucesso!")
    except Exception as e:
        current_app.logger.error(f"Erro ao conectar ao MongoDB: {str(e)}")
        raise

def jsonify_mongo(data):
    return json.loads(dumps(data))