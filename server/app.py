from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from utils.db import mongo
from routes.routes import auth_bp
from utils.config import Config
import os
import cloudinary
from flasgger import Swagger

def create_app():
    app = Flask(__name__)
    swagger = Swagger(app)
    app.config.from_object(Config)
    
    # Configurações
    CORS(app)
    JWTManager(app)
    
    # Inicializa o banco de dados
    mongo.init_db()

    # Inicializa o cloudinary
    cloudinary.config(
        cloud_name=Config.CLOUDINARY_CLOUD_NAME,
        api_key=Config.CLOUDINARY_API_KEY,
        api_secret=Config.CLOUDINARY_API_SECRET,
        secure=True
    )


    # Registra blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    app = create_app()
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
