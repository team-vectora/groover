import os
from datetime import timedelta

from flask import Blueprint, request, jsonify, redirect
from flask_jwt_extended import create_access_token
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash
from models import User

auth_bp = Blueprint('auth', __name__)

# URL do seu frontend
FRONTEND_URL = "http://localhost:3000"

# Corrigido: Use o TimedSerializer para tokens com expiração
s = URLSafeTimedSerializer(os.getenv('AUTH_KEY'))


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    if User.find_by_username(data['username']):
        return jsonify({'error': 'Username already exists'}), 409

    if User.find_by_email(data['email']):
        return jsonify({'error': 'Email already used'}), 409

    hashed_pw = generate_password_hash(data['password'])
    email = data.get('email')
    # Recebe o idioma do frontend
    lang = data.get('lang', 'en')

    user_id = User.create(
        username=data['username'],
        password_hash=hashed_pw,
        email=email
    )

    User.send_email_verification(
        email=email,
        username=data['username'],
        host_url=request.host_url,
        lang=lang  # Passa o idioma para o envio de e-mail
    )

    return jsonify({
        'message': 'User created successfully. Check your email to confirm.',
        'id': str(user_id)
    }), 201


@auth_bp.route('/confirm_email/<token>')
def confirm_email(token):
    try:
        # Validação do token com expiração de 5 minutos (300 segundos)
        email = s.loads(token, salt=os.getenv("SALT_AUTH"), max_age=300)
        User.activate_user(email)
        # Redireciona para o frontend com status de sucesso
        return redirect(f"{FRONTEND_URL}/auth-result?status=success")
    except SignatureExpired:
        # Redireciona para o frontend com status de expirado
        return redirect(f"{FRONTEND_URL}/auth-result?status=expired")
    except Exception:
        # Redireciona para o frontend com status de erro genérico
        return redirect(f"{FRONTEND_URL}/auth-result?status=error")


# Rota removida, pois o frontend cuidará disso
# @auth_bp.route('/token_expired') ...

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.find_by_username(data['username'])

    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user['active']:
        # O idioma pode ser pego do header da requisição se você o enviar do frontend
        lang = request.headers.get('Accept-Language', 'en').split(',')[0]
        User.send_email_verification(
            email=user['email'],
            username=user['username'],
            host_url=request.host_url,
            lang=lang
        )

        return jsonify({
            'error': 'User is not active. Verification email resent.',
        }), 401

    expires = timedelta(hours=24)
    access_token = create_access_token(
        identity=str(user['_id']),
        expires_delta=expires
    )

    if 'avatar' not in user.keys():
        user['avatar'] = None

    return jsonify({
        'access_token': access_token,
        'user_id': str(user['_id']),
        'username': user['username'],
        'avatar': user['avatar'],
        "following": user['following'],
        "followers": user['followers']
    }), 200