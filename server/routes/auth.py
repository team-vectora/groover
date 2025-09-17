import os
from datetime import timedelta

from flask import Blueprint, request, jsonify, redirect, render_template
from flask_jwt_extended import create_access_token
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash
from models import User

auth_bp = Blueprint('auth', __name__)

# URL do seu frontend
FRONTEND_URL = "https://groover.app.br"

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
        email = s.loads(token, salt=os.getenv("SALT_AUTH"), max_age=300)
        User.activate_user(email)
        return redirect(f"{FRONTEND_URL}/auth-result?status=success")
    except SignatureExpired:
        return redirect(f"{FRONTEND_URL}/auth-result?status=expired")
    except Exception:
        return redirect(f"{FRONTEND_URL}/auth-result?status=error")

@auth_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return {"error": "Email is required"}, 4001

    user = User.find_by_email(email)
    if not user:
        return {"error": "User not found"}, 404

    token = s.dumps(email, salt=os.getenv('SALT_AUTH'))
    reset_url = f"{request.host_url}api/auth/reset_password/{token}"

    User.send_reset_password_email(email, user['username'], reset_url)
    return {"message": "Password reset email sent"}, 200


@auth_bp.route('/reset_password/<token>', methods=['GET', 'POST'])
def reset_password(token):
    try:
        email = s.loads(token, salt=os.getenv('SALT_AUTH'), max_age=600)
    except SignatureExpired:
        return render_template('reset_password.html', status='error', error_message="Link expired. Request a new reset email.")

    if request.method == 'POST':
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')

        if new_password != confirm_password:
            return render_template('reset_password.html', status='error', error_message="Passwords do not match.")

        strength = 0
        if len(new_password) >= 8: strength += 1
        if any(c.isupper() for c in new_password): strength += 1
        if any(c.isdigit() for c in new_password): strength += 1
        if any(not c.isalnum() for c in new_password): strength += 1
        if strength < 3:
            return render_template('reset_password.html', status='error', error_message="Password is too weak.")
        print(new_password)
        User.update_password(email, new_password)

        return render_template('reset_password.html', status='success')

    return render_template('reset_password.html', status=None)

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.find_by_username(data['username'])

    print(user['active'])
    if not user['active']:
        print("ENTREI")
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
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
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