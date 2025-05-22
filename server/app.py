from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .utils.db import init_db
from .config import Config
from .routes import project_routes

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    
    # Configurações
    CORS(app)
    init_db(app)
    JWTManager(app)
    
    # Registrar blueprints
    app.register_blueprint(project_routes.project_bp, url_prefix='/api')
    
    @app.route('/')
    def health_check():
        return 'Music Composer API is running'
    
    return app

if __name__ == '__main__':
    app = create_app()
    app.run(debug=True)