import os
import secrets
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Configurações do MongoDB
    MONGO_USERNAME = os.getenv('MONGO_USERNAME', 'team_vectora')
    MONGO_PASSWORD = os.getenv('MONGO_PASSWORD', 'vectora!2025')
    MONGO_CLUSTER = os.getenv('MONGO_CLUSTER', 'cluster-groover.9gfspos.mongodb.net')
    MONGO_DBNAME = os.getenv('MONGO_DBNAME', 'music_app')
    
    # Configuração JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))