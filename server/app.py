from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from routes.routes import auth_bp
from config import Config
from utils.db import mongo, init_db

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configurações
    CORS(app)
    JWTManager(app)
    
    # Inicializa o banco de dados
    init_db(app)
    
    # Registrar blueprint
    app.register_blueprint(auth_bp, url_prefix='/api')
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)