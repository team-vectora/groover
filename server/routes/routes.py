from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required, 
    get_jwt_identity,
    create_access_token
)
from werkzeug.security import generate_password_hash, check_password_hash
from models.model import Project, User
from bson.objectid import ObjectId
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

# Rotas de Autenticação
@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    # Validação básica
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    # Verifica se usuário já existe
    if User.find_by_username(data['username']):
        return jsonify({'error': 'Username already exists'}), 409
    
    # Cria novo usuário
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
    
    # Validação básica
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    user = User.find_by_username(data['username'])
    
    # Verifica credenciais
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    # Cria token JWT
    expires = timedelta(hours=24)  # Token válido por 24 horas
    access_token = create_access_token(
        identity=str(user['_id']), 
        expires_delta=expires
    )
    
    return jsonify({
        'access_token': access_token,
        'user_id': str(user['_id']),
        'username': user['username']
    }), 200

# Rotas de Projetos (protegidas por JWT)
@auth_bp.route('/projects', methods=['POST'])
@jwt_required()
def save_project():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    if 'id' in data:  # Atualização de projeto existente
        project_id = data['id']
        if Project.update_project(project_id, user_id, data):
            return jsonify({'message': 'Project updated', 'id': project_id}), 200
        return jsonify({'error': 'Project not found or update failed'}), 404
    else:  # Criação de novo projeto
        project_id = Project.create_project(user_id, data)
        return jsonify({'message': 'Project created', 'id': project_id}), 201

@auth_bp.route('/projects/<project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    user_id = get_jwt_identity()
    project = Project.get_project(project_id, user_id)
    
    if project:
        return jsonify(project), 200
    return jsonify({'error': 'Project not found'}), 404

@auth_bp.route('/projects', methods=['GET'])
@jwt_required()
def list_projects():
    user_id = get_jwt_identity()
    projects = Project.get_user_projects(user_id)
    return jsonify(projects), 200