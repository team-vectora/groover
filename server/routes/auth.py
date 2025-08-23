import base64
from bson.binary import Binary
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    create_access_token
)
from werkzeug.security import generate_password_hash, check_password_hash
from models import User, Project, Music, Post, Invitation, Followers
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import cloudinary.uploader
auth_bp = Blueprint('auth', __name__)


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
    user_id = User.create(
        username=data['username'],
        password_hash=hashed_pw,
        email=data.get('email')
    )

    return jsonify({
        'message': 'User created successfully',
        'id': str(user_id)
    }), 201

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()

    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400

    user = User.find_by_username(data['username'])

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
