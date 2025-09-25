from bson import ObjectId
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Project, Music, User, Invitation, Notification
import base64
from bson.binary import Binary
import cloudinary.uploader

projects_bp = Blueprint('projects', __name__)

@projects_bp.route('/upload-image', methods=['POST'])
@jwt_required()
def upload_project_image():
    if 'file' not in request.files:
        return jsonify({'error': 'File not found'}), 400
    try:
        # Adicionada a predefinição para segurança
        result = cloudinary.uploader.upload(request.files['file'], upload_preset='project_covers_preset')
        return jsonify({'secure_url': result['secure_url']}), 200
    except Exception as e:
        return jsonify({'error': str(e), 'msg': 'Cloudinary upload failed'}), 500


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
        'description': data.get('description', ''),
        'cover_image': data.get('cover_image'),
        'bpm': data.get('bpm', 120),
        'volume': data.get('volume', -10),
        'midi': midi_binary
    }

    music_data = {
        'channels': data.get('channels', []),
        'patterns': data.get('patterns', {}),
        'songStructure': data.get('songStructure', [])
    }

    project_id = data.get('id')

    if project_id:
        project = Project.get_project_full_data(project_id)
        if str(project.get('user_id')) != user_id and user_id not in [c['id'] for c in project.get('collaborators', [])]:
            return jsonify({'error': 'Permission denied'}), 403

        if str(project.get('user_id')) != user_id:
            actor_user = User.get_user(user_id)
            Notification.create(
                user_id=str(project.get('user_id')),
                actor=actor_user['username'], type="collaborator_update",
                project_id=project_id, content=project.get('title')
            )

        Music.create_music(project_id=project_id, music_data=music_data, user_id=user_id)
        Project.update_project(project_id, user_id, project_data)
        updated_project = Project.get_project_full_data(project_id)
        return jsonify(updated_project), 200

    else:
        new_project_id = Project.create_project(user_id, project_data)
        Music.create_music(new_project_id, music_data, user_id)
        created_project = Project.get_project_full_data(new_project_id)
        return jsonify(created_project), 201


@projects_bp.route('/<project_id>/collaborators/<collaborator_id>', methods=['DELETE'])
@jwt_required()
def remove_collaborator(project_id, collaborator_id):
    user_id = get_jwt_identity()
    project = Project.get_project(project_id)

    if not project or str(project['user_id']) != user_id:
        return jsonify({'error': 'Permission denied'}), 403

    Project.remove_collaborator(project_id, collaborator_id)
    return jsonify({'message': 'Collaborator removed'}), 200

@projects_bp.route('/teste', methods=["GET"])
@jwt_required()
def teste():
    return Project.get_recent_projects()

@projects_bp.route('/<project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    project = Project.get_project_full_data(project_id)
    if project:
        return jsonify(project), 200
    return jsonify({'error': 'Project not found'}), 404


@projects_bp.route('/<project_id>/versions/<music_id>', methods=['GET'])
@jwt_required()
def get_music_version(project_id, music_id):
    music_version = Music.get_music(music_id)
    if music_version and str(music_version.get('project_id')) == project_id:
        return jsonify(music_version), 200
    return jsonify({'error': 'Music version not found'}), 404


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

    success = Project.revert_to_version(project_id, target_music_id, get_jwt_identity())
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

    project = Project.get_project(project_id)
    if not project or str(project['user_id']) != user_id:
        return jsonify({'error': 'Project not found or permission denied'}), 404

    invited_user = User.find_by_username(data['username'])
    if not invited_user:
        return jsonify({'error': 'user_not_found'}), 404

    invited_user_id = str(invited_user['_id'])
    if invited_user_id == user_id:
        return jsonify({'error': 'cannot_invite_yourself'}), 400

    if ObjectId(invited_user_id) in [ObjectId(c['id']) for c in project.get('collaborators', [])]:
        return jsonify({'error': 'already_collaborator'}), 400

    if Invitation.find_pending_invitation(project_id, invited_user_id):
        return jsonify({'error': 'invitation_already_sent'}), 409

    invitation_id = Invitation.create_invitation(
        project_id=project_id,
        from_user_id=user_id,
        to_user_id=invited_user_id
    )

    user = User.get_user(user_id)
    Notification.create(
        user_id=invited_user_id,
        actor=user['username'],
        type="invitation_received",
        project_id=project_id,
        content=project.get('title')
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

    original_project = Project.get_project_full_data(project_id)
    if not original_project:
        return jsonify({"error": "Project not found"}), 404

    current_music = original_project.get('current_music_id')
    if not current_music:
        return jsonify({"error": "Project doesn't have music to copy"}), 400

    new_project_data = {
        'title': original_project.get('title', '') + ' (Fork)',
        'description': original_project.get('description', ''),
        'bpm': original_project.get('bpm', 120),
        'volume': original_project.get('volume', -10),
        'midi': Binary(base64.b64decode(original_project.get('midi', '').split(',')[-1])) if original_project.get('midi') else None
    }
    new_project_id = Project.create_project(user_id, new_project_data)

    music_data_to_copy = {
        'channels': current_music.get('channels'),
        'patterns': current_music.get('patterns'),
        'songStructure': current_music.get('songStructure')
    }
    Music.create_music(new_project_id, music_data_to_copy, user_id)

    Notification.create(user_id=original_project['user_id'], type="fork", actor=data.get('username_actor'))

    return jsonify({'message': 'Fork created', 'new_project_id': new_project_id}), 201


@projects_bp.route('/<project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    user_id = get_jwt_identity()
    deleted_count = Project.delete_project(project_id, user_id)
    if deleted_count > 0:
        return jsonify({'message': 'Project deleted successfully'}), 200
    else:
        return jsonify({'error': 'Project not found or permission denied'}), 404