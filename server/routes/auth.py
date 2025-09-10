import os
from datetime import timedelta

from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    create_access_token
)
from flask_mail import Mail ,Message
from werkzeug.security import generate_password_hash, check_password_hash
from models import User
from itsdangerous import URLSafeSerializer, SignatureExpired
from markupsafe import escape

auth_bp = Blueprint('auth', __name__)
s = URLSafeSerializer(os.getenv('AUTH_KEY'))

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


    token = s.dumps(email, salt=os.getenv('SALT_AUTH'))
    confirm_url = f"{request.host_url}api/auth/confirm_email/{token}"

    html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color:#0a090d; color:#e6e8e3; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#121113; border-radius:10px; padding:30px; box-shadow:0 2px 10px rgba(0,0,0,0.5);">
          <h2 style="color:#4c4e30; text-align:center;">Welcome to Groover, {escape(data['username'])}!</h2>
          <p style="font-size:16px; line-height:1.5; color:#e6e8e3;">
            Thank you for signing up. To activate your Groover account, please confirm your email by clicking the button below:
          </p>
          <p style="text-align:center; margin:30px 0;">
            <a href="{confirm_url}" style="
              display:inline-block;
              padding:14px 28px;
              background:#a97f52;
              color:#ffffff;
              text-decoration:none;
              border-radius:6px;
              font-weight:bold;
              font-size:16px;
              transition:all 0.3s;
            " onmouseover="this.style.background='#c1915d';">
              Confirm Email
            </a>
          </p>
          <p style="font-size:12px; color:#e6e8e3; text-align:center; margin-top:20px;">
            If you didn’t create this account, you can safely ignore this email.
          </p>
          <hr style="border:none; border-top:1px solid #070608; margin:20px 0;">
          <p style="font-size:12px; color:#61673e; text-align:center;">
            © 2025 Groover. All rights reserved.
          </p>
        </div>
      </body>
    </html>

    """
    msg = Message(
        subject="Please confirm your email",
        recipients=[email],
        body=f"Hello {data['username']},\n\nPlease confirm your email by clicking the link below:\n{confirm_url}\n\nIf you didn’t create this account, ignore this message.",
        html=html_body,
        sender=os.getenv('MAIL_USERNAME')
    )
    Mail.send(msg)
    print(token)
    return jsonify({
        'message': 'User created successfully. Check your email to confirm.',
        'id': str(user_id)
    }), 201


@auth_bp.route('/confirm_email/<token>')
def confirm_email(token):
    try:
        email = s.loads(token, salt=os.getenv("SALT_AUTH"), max_age=300)
        User.activate_user(email)
        return jsonify({'message': f'Email {email} confirmed successfully!'}), 200
    except SignatureExpired:
        return jsonify({'error': 'Signature Time exceeded'}), 401


@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.find_by_username(data['username'])

    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401

    if  not user['active']:
        return ({'error': 'User is not active'}), 401

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
