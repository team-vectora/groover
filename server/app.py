from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from utils.db import mongo
from routes.routes import auth_bp
from utils.config import Config

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configurações
    CORS(app)
    JWTManager(app)
    
    # Inicializa o banco de dados
    mongo.init_db()
    
    # Registra blueprints
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)