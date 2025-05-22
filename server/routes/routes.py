from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from ..models.project import Project
from bson.objectid import ObjectId

project_bp = Blueprint('projects', __name__)

@project_bp.route('/projects', methods=['POST'])
@jwt_required()
def save_project():
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if 'id' in data:  # Projeto existente - atualizar
        project_id = data['id']
        if Project.update_project(project_id, user_id, data):
            return jsonify({'message': 'Project updated', 'id': project_id}), 200
        return jsonify({'error': 'Project not found or update failed'}), 404
    else:  # Novo projeto - criar
        project_id = Project.create_project(user_id, data)
        return jsonify({'message': 'Project created', 'id': project_id}), 201

@project_bp.route('/projects/<project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    user_id = get_jwt_identity()
    project = Project.get_project(project_id, user_id)
    
    if project:
        return jsonify(project), 200
    return jsonify({'error': 'Project not found'}), 404

@project_bp.route('/projects', methods=['GET'])
@jwt_required()
def list_projects():
    user_id = get_jwt_identity()
    projects = Project.get_user_projects(user_id)
    return jsonify(projects), 200