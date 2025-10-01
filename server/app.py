# import eventlet
#
# eventlet.monkey_patch()

from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from utils.db import mongo
from routes.auth import auth_bp
from routes.notification import notifications_bp
from routes.users import users_bp
from routes.posts import posts_bp
from routes.projects import projects_bp
from routes.invitations import invitations_bp
from routes.search import search_bp
from utils.config import Config
import os
import cloudinary
from flasgger import Swagger
from utils.mail import mail
# from utils.socket import socketio


def create_app():
    app = Flask(__name__)

    allowed_origins = ["https://groover.app.br", "https://staging.groover.app.br", "http://localhost:3000"]

    CORS(app, resources={r"/api/*": {"origins": allowed_origins}}, supports_credentials=True)
    #
    # socketio.init_app(
    #     app,
    #     cors_allowed_origins=allowed_origins,
    #     logger=True,
    #     engineio_logger=True
    # )

    Swagger(app)
    app.config.from_object(Config)

    app.config["JWT_SECRET_KEY"] = Config.JWT_SECRET_KEY
    app.config["JWT_TOKEN_LOCATION"] = ["cookies"]
    app.config["JWT_ACCESS_COOKIE_NAME"] = "access_token"
    app.config["JWT_COOKIE_SECURE"] = True
    app.config["JWT_COOKIE_SAMESITE"] = "None"
    app.config["JWT_COOKIE_CSRF_PROTECT"] = False

    JWTManager(app)

    @app.route('/api')
    def api_root():
        """Endpoint para verificar se a API está no ar."""
        return {"status": "ok", "message": "API esta funcionando perfeitamente!"}

    # Inicializa o banco de dados
    mongo.init_db()

    # Inicializa o cloudinary
    cloudinary.config(
        cloud_name=Config.CLOUDINARY_CLOUD_NAME,
        api_key=Config.CLOUDINARY_API_KEY,
        api_secret=Config.CLOUDINARY_API_SECRET,
        secure=True
    )

    app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER', 'smtp.gmail.com')
    app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 465))
    app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'False').lower() == 'true'
    app.config['MAIL_USE_SSL'] = os.getenv('MAIL_USE_SSL', 'False').lower() == 'true'
    app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
    app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')

    mail.init_app(app)

    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(posts_bp, url_prefix='/api/posts')
    app.register_blueprint(projects_bp, url_prefix='/api/projects')
    app.register_blueprint(invitations_bp, url_prefix='/api/invitations')
    app.register_blueprint(notifications_bp, url_prefix='/api/notifications')
    app.register_blueprint(search_bp, url_prefix='/api/search')

    print("=== ROTAS REGISTRADAS ===")
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods)
        print(f"{rule.rule} -> {methods}")

    return app


if __name__ == '__main__':
    import eventlet
    import eventlet.wsgi

    app = create_app()
    # port = int(os.environ.get("PORT", 5000))
    # # Rode o app usando eventlet para suportar WebSockets
    app.run()
