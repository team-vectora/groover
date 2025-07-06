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

    # Configurações do Cloudinary
    CLOUDINARY_CLOUD_NAME = os.getenv('CLOUDINARY_CLOUD_NAME', 'groover')
    CLOUDINARY_API_KEY = os.getenv('CLOUDINARY_API_KEY', '515626693428917')
    CLOUDINARY_API_SECRET = os.getenv('CLOUDINARY_API_SECRET', 'L92fyT-GaWUH9Y4QgdXjzvaInp4')

    # Configuração JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_hex(32))
