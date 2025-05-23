import os
from dotenv import load_dotenv
from urllib.parse import quote_plus

load_dotenv()

class Config:
    MONGO_USERNAME = os.getenv('MONGO_USERNAME', 'team_vectora')
    MONGO_PASSWORD = os.getenv('MONGO_PASSWORD', 'vectora!2025')
    MONGO_CLUSTER = os.getenv('MONGO_CLUSTER', 'cluster-groover.9gfspos.mongodb.net')
    MONGO_DBNAME = os.getenv('MONGO_DBNAME', 'music_app')
    
    # Construção da URI de forma segura
    MONGO_URI = (
        f"mongodb+srv://{quote_plus(MONGO_USERNAME)}:{quote_plus(MONGO_PASSWORD)}@"
        f"{MONGO_CLUSTER}/{MONGO_DBNAME}?"
        "retryWrites=true&w=majority&appName=cluster-groover"
    )
    
    # Adicione esta configuração para o JWT
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'sua-chave-secreta-aqui')