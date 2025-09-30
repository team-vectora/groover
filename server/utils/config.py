import os
import secrets
from dotenv import load_dotenv

load_dotenv()

class Config:
    # Configurações do MongoDB
    MONGO_USERNAME = os.getenv('MONGO_USERNAME')
    MONGO_PASSWORD = os.getenv('MONGO_PASSWORD')
    MONGO_CLUSTER = os.getenv('MONGO_CLUSTER')
    MONGO_DBNAME = os.getenv('MONGO_DBNAME')

    # Configurações do Cloudinary
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET')

    # Configuração JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))
