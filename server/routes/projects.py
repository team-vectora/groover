from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Project, Music, User, Invitation
import base64
from bson.binary import Binary

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('', methods=['POST'])
@jwt_required()
def save_project():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    midi_base64 = data.get('midi')
    midi_binary = base64.b64decode(midi_base64) if midi_base64 else None

    project_data = {
        'title': data.get('title', 'New Project'),
        'midi': midi_binary,
        'description': data.get('description', ''),
        'bpm': data.get('bpm', 120),
        'instrument': data.get('instrument', 'piano'),
        'volume': data.get('volume', -10)
    }

    if 'id' in data:
        project_id = data['id']
        if data.get('layers'):
            Music.create_music(project_id=project_id, layers=data.get('layers'), user_id=user_id)
        success = Project.update_project(project_id, user_id, project_data)
        project = Project.get_project_full_data_without_user_id(project_id)
        if success:
            return jsonify(project), 200
        return jsonify({'error': 'Project not found or update failed'}), 404
    else:
        project_id = Project.create_project(user_id, project_data)
        Music.create_music(project_id, data.get('layers', {}), user_id)
        project = Project.get_project_full_data(project_id, user_id)
        return jsonify(project), 201


@projects_bp.route('/<project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    project = Project.get_project_full_data_without_user_id(project_id)
    if project:
        return jsonify(project), 200
    return jsonify({'error': 'Project not found'}), 404


@projects_bp.route('/user/<username>', methods=['GET'])
@jwt_required()
def list_projects_by_username(username):
    projects = Project.get_user_projects_by_username(username)
    return jsonify(projects or []), 200


@projects_bp.route('/<project_id>/revert', methods=['POST'])
@jwt_required()
def revert_project_version(project_id):
    data = request.get_json()
    target_music_id = data.get('music_id')
    if not target_music_id:
        return jsonify({'error': 'music_id is required'}), 400

    success = Project.revert_to_version(project_id, target_music_id)
    if success:
        return jsonify({'message': 'Project reverted successfully'}), 200
    return jsonify({'error': 'Invalid project or music ID'}), 400


@projects_bp.route('/<project_id>/invite', methods=['POST'])
@jwt_required()
def invite_user(project_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('username'):
        return jsonify({'error': 'Username is required'}), 400

    project = Project.get_project(project_id, user_id)
    if not project:
        return jsonify({'error': 'Project not found or permission denied'}), 404

    invited_user = User.find_by_username(data['username'])
    if not invited_user:
        return jsonify({'error': 'User not found'}), 404

    invited_user_id = str(invited_user['_id'])
    if invited_user_id == user_id:
        return jsonify({'error': 'Cannot invite yourself'}), 400

    invitation_id = Invitation.create_invitation(
        project_id=project_id,
        from_user_id=user_id,
        to_user_id=invited_user_id
    )

    return jsonify({'message': 'Invitation sent', 'invitation_id': str(invitation_id)}), 201

@projects_bp.route('/fork', methods=['POST'])
@jwt_required()
def fork_project():
    data = request.get_json()
    user_id = get_jwt_identity()

    project_id = data.get('project_id')
    if not project_id:
        return jsonify({"error": "project_id not found"}), 400

    project = Project.get_project_full_data_without_user_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    music = project.get('current_music_id')
    if not music:
        return jsonify({"error": "Project doesn't have music to copy"}), 400

    layers = music.get('layers', [])
    midi_base64 = project.get('midi')

    if midi_base64 and midi_base64.startswith('data:audio/midi;base64,'):
        midi_base64 = midi_base64.split(',')[1]

    midi_bytes = base64.b64decode(midi_base64) if midi_base64 else None


    new_project_id = Project.create_project(
        user_id,
        {
            'title': project.get('title', '') + ' (Fork)',
            'midi': Binary(midi_bytes) if midi_bytes else None,
            'description': project.get('description', ''),
            'bpm': project.get('bpm', 120),
            'instrument': project.get('instrument', 'piano'),
            'volume': project.get('volume', -10),
            'tempo': project.get('tempo', None)
        }
    )

    Music.create_music(
        new_project_id,
        layers,
        user_id
    )

    return jsonify({
        'message': 'Fork created',
        'new_project_id': new_project_id
    }), 201