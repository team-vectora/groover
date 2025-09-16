import os
from datetime import timedelta

from flask import Blueprint, request, jsonify, render_template, redirect, url_for
from flask_jwt_extended import create_access_token
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash
from models import User

auth_bp = Blueprint('auth', __name__)
# Usando URLSafeTimedSerializer para expiração de tokens
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

    user_id = User.create(
        username=data['username'],
        password_hash=hashed_pw,
        email=email
    )

    User.send_email_verification(
        email=email,
        username=data['username'],
        host_url=request.host_url
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
        return render_template('confirm_email_template.html', status='success', email=email), 200
    except SignatureExpired:
        return redirect(url_for('auth.token_expired_page'))


@auth_bp.route('/token_expired')
def token_expired_page():
    # Página bonita informando que o token expirou
    return render_template('token_expired.html'), 200


@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.find_by_username(data['username'])

    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user['active']:
        token = s.dumps(user['email'], salt=os.getenv("SALT_AUTH"))
        confirm_url = f"{request.host_url}api/auth/confirm_email/{token}"

        User.send_email_verification(
            email=user['email'],
            username=user['username'],
            host_url=request.host_url
        )

        return jsonify({
            'error': 'User is not active. Verification email resent.',
            'activation_link': confirm_url,
            'token': token
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
