from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required, 
    get_jwt_identity,
    create_access_token
)
from werkzeug.security import generate_password_hash, check_password_hash
from models.model import Music, Project, User
from bson.objectid import ObjectId
from datetime import datetime, timedelta

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    if User.find_by_username(data['username']):
        return jsonify({'error': 'Username already exists'}), 409
    
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
    
    return jsonify({
        'access_token': access_token,
        'user_id': str(user['_id']),
        'username': user['username']
    }), 200

@auth_bp.route('/projects', methods=['GET'])
@jwt_required()
def list_projects():
    user_id = get_jwt_identity()
    projects = Project.get_user_projects(user_id)
    return jsonify(projects), 200

@auth_bp.route('/projects', methods=['POST'])
@jwt_required()
def save_project():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    project_data = {
        'title': data.get('title', 'New Project'),
        'description': data.get('description', ''),
        'bpm': data.get('bpm', 120),
        'instrument': data.get('instrument', 'piano'),
        'volume': data.get('volume', -10)
    }

    if 'id' in data:
        project_id = data['id']

        if data.get('layers'):
            music_id = Music.create_music(
                project_id=project_id,
                layers=data.get('layers'),
                user_id=user_id
            )

        success = Project.update_project(project_id, user_id, project_data)
        if success:
            return jsonify({'message': 'Project updated', 'id': project_id}), 200
        return jsonify({'error': 'Project not found or update failed'}), 404
    else:
        project_id = Project.create_project(user_id, project_data)

        music_id = Music.create_music(
            project_id=project_id,
            layers=data.get('layers', {}),
            user_id=user_id
        )

        return jsonify({'message': 'Project created', 'id': project_id}), 201

@auth_bp.route('/projects/<project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    user_id = get_jwt_identity()
    project = Project.get_project_full_data(project_id, user_id)
    
    if project:
        return jsonify(project), 200
    return jsonify({'error': 'Project not found'}), 404

@auth_bp.route('/projects/<project_id>/revert', methods=['POST'])
@jwt_required()
def revert_project_version(project_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    target_music_id = data.get('music_id')

    if not target_music_id:
        return jsonify({'error': 'music_id is required'}), 400

    success = Project.revert_to_version(project_id, target_music_id)
    if success:
        return jsonify({'message': 'Project reverted successfully'}), 200
    return jsonify({'error': 'Invalid project or music ID'}), 400

# Rota para enviar convite
@auth_bp.route('/projects/<project_id>/invite', methods=['POST'])
@jwt_required()
def invite_user(project_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('username'):
        return jsonify({'error': 'Username is required'}), 400
    
    # Verificar se o usuário atual é dono do projeto
    project = Project.get_project(project_id, user_id)
    if not project:
        return jsonify({'error': 'Project not found or permission denied'}), 404
    
    # Buscar usuário convidado
    invited_user = User.find_by_username(data['username'])
    if not invited_user:
        return jsonify({'error': 'User not found'}), 404
    
    invited_user_id = str(invited_user['_id'])
    
    # Não pode convidar a si mesmo
    if invited_user_id == user_id:
        return jsonify({'error': 'Cannot invite yourself'}), 400
    
    # Criar convite
    invitation_id = Invitation.create_invitation(
        project_id=project_id,
        from_user_id=user_id,
        to_user_id=invited_user_id
    )
    
    return jsonify({
        'message': 'Invitation sent',
        'invitation_id': str(invitation_id)
    }), 201

# Rota para listar convites pendentes
@auth_bp.route('/invitations', methods=['GET'])
@jwt_required()
def list_invitations():
    user_id = get_jwt_identity()
    invitations = Invitation.find_pending_by_user(user_id)
    
    serialized = []
    for inv in invitations:
        project = Project.get_project(str(inv['project_id']), str(inv['from_user_id']))
        from_user = User.get_user(str(inv['from_user_id']))
        
        serialized.append({
            'id': str(inv['_id']),
            'project': {
                'id': str(inv['project_id']),
                'title': project.get('title') if project else 'Unknown Project'
            },
            'from_user': {
                'id': str(inv['from_user_id']),
                'username': from_user.get('username') if from_user else 'Unknown User'
            },
            'created_at': inv['created_at']
        })
    
    return jsonify(serialized), 200

# Rota para responder convite
@auth_bp.route('/invitations/<invitation_id>/respond', methods=['POST'])
@jwt_required()
def respond_invitation(invitation_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('response'):
        return jsonify({'error': 'Response is required'}), 400
    
    invitation = Invitation.find_by_id(invitation_id)
    if not invitation or str(invitation['to_user_id']) != user_id:
        return jsonify({'error': 'Invitation not found'}), 404
    
    if invitation['status'] != 'pending':
        return jsonify({'error': 'Invitation already responded'}), 400
    
    response = data['response']
    if response not in ['accept', 'reject']:
        return jsonify({'error': 'Invalid response'}), 400
    
    # Atualizar status do convite
    Invitation.update_status(invitation_id, response + 'ed')
    
    if response == 'accept':
        # Adicionar usuário como colaborador
        Project.add_collaborator(
            project_id=str(invitation['project_id']),
            user_id=user_id
        )
    
    return jsonify({'message': f'Invitation {response}ed'}), 200