import os
from datetime import timedelta
from flask import Blueprint, request, jsonify, redirect, render_template, make_response
from flask_jwt_extended import create_access_token
from itsdangerous import URLSafeTimedSerializer, SignatureExpired
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
import traceback

auth_bp = Blueprint('auth', __name__)

FRONTEND_URL = os.getenv('FRONTEND_URL', 'http://localhost:3000')
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
        lang=lang
    )

    return jsonify({
        'message': 'User created successfully. Check your email to confirm.',
        'id': str(user_id)
    }), 201


@auth_bp.route('/confirm_email/<token>')
def confirm_email(token):
    try:
        email = s.loads(token, salt=os.getenv("SALT_AUTH"), max_age=3600)
        user = User.find_by_email(email)

        if not user:
            print("[AUTH ERROR] Usuário não encontrado no banco de dados com o e-mail do token.")
            return redirect(f"{FRONTEND_URL}/auth-result?status=error")

        User.activate_user(email)

        expires = timedelta(hours=24)
        access_token = create_access_token(identity=str(user['_id']), expires_delta=expires)

        response = make_response(redirect(f"{FRONTEND_URL}/profile-setup"))

        response.set_cookie(
            "access_token", access_token, httponly=True,
            secure=True if 'ON_RENDER' in os.environ else False,
            samesite="Lax", max_age=60 * 60 * 24
        )

        response.set_cookie('username', user['username'], max_age=60 * 60 * 24, samesite='Lax', path='/')
        response.set_cookie('id', user['_id'], max_age=60 * 60 * 24, samesite='Lax', path='/')
        # CORREÇÃO: Garante que o valor do cookie nunca seja None
        response.set_cookie('avatar', user.get('avatar') or '', max_age=60 * 60 * 24, samesite='Lax', path='/')

        return response

    except SignatureExpired:
        print("[AUTH INFO] Token de verificação de e-mail expirado.")
        return redirect(f"{FRONTEND_URL}/auth-result?status=expired")
    except Exception as e:
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        print("[AUTH ERROR] Ocorreu uma exceção inesperada durante a confirmação de e-mail:")
        traceback.print_exc()
        print("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
        return redirect(f"{FRONTEND_URL}/auth-result?status=error")


@auth_bp.route('/forgot_password', methods=['POST'])
def forgot_password():
    data = request.get_json()
    email = data.get('email')
    if not email:
        return {"error": "Email is required"}, 400

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
        return render_template('reset_password.html', status='error',
                               error_message="Link expired. Request a new reset email.")

    if request.method == 'POST':
        new_password = request.form.get('new_password')
        confirm_password = request.form.get('confirm_password')

        if new_password != confirm_password:
            return render_template('reset_password.html', status='error', error_message="Passwords do not match.")

        if len(new_password) < 8:
            return render_template('reset_password.html', status='error', error_message="Password is too weak.")

        User.update_password(email, new_password)
        return render_template('reset_password.html', status='success')

    return render_template('reset_password.html', status=None)


@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.find_by_username(data['username'])
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    if not user['active']:
        lang = request.headers.get('Accept-Language', 'en').split(',')[0]
        User.send_email_verification(user['email'], user['username'], request.host_url, lang)
        return jsonify({'error': 'User is not active. Verification email resent.'}), 401

    expires = timedelta(hours=24)
    access_token = create_access_token(identity=str(user['_id']), expires_delta=expires)

    resp = make_response(jsonify({
        "user_id": str(user['_id']),
        "username": user['username'],
        "avatar": user.get('avatar'),
        "following": user.get('following', []),
        "followers": user.get('followers', [])
    }))

    resp.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=True,
        samesite="None",   
        max_age=60 * 60 * 24
    )

    return resp


@auth_bp.route('/logout', methods=['POST'])
def logout():
    response = make_response(jsonify({"message": "Logout successful"}))
    response.delete_cookie('access_token', path='/')
    response.delete_cookie('username', path='/')
    response.delete_cookie('id', path='/')
    response.delete_cookie('avatar', path='/')
    return response