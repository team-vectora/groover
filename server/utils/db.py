from pymongo import MongoClient
from bson.objectid import ObjectId
from bson.json_util import dumps
import json
import os
from dotenv import load_dotenv

load_dotenv()

class MongoDB:
    _instance = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance.init_db()
        return cls._instance
    
    def init_db(self):
        try:
            username = os.getenv('MONGO_USERNAME')
            password = os.getenv('MONGO_PASSWORD')
            cluster = os.getenv('MONGO_CLUSTER')
            dbname = os.getenv('MONGO_DBNAME')
            
            self.uri = f"mongodb+srv://{username}:{password}@{cluster}/{dbname}?retryWrites=true&w=majority&appName=cluster-groover"
            
            # Conexão com o MongoDB
            self.client = MongoClient(self.uri)
            self.db = self.client[dbname]
            
            self.db.command('ping')
            print("Conexão com MongoDB estabelecida com sucesso!")
        except Exception as e:
            print(f"Erro ao conectar ao MongoDB: {str(e)}")
            raise

    def jsonify(self, data):
        return json.loads(dumps(data))

mongo = MongoDB()
