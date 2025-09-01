from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Invitation, Project, User

invitations_bp = Blueprint('invitations', __name__)

# Mudar urgente
@invitations_bp.route('', methods=['GET'])
@jwt_required()
def list_invitations():
    user_id = get_jwt_identity()
    invitations = Invitation.find_pending_by_user(user_id)

    serialized = []
    for inv in invitations:

        project = Project.get_project(str(inv['project_id']), str(inv['from_user_id']))
        from_user = User.get_user(str(inv['from_user_id']))
        to_user = User.get_user(str(inv['to_user_id']))

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
            'to_user': {
                'id': str(inv['to_user_id']),
                'username': to_user.get('username') if to_user else 'Unknown User'
            },
            'status': inv['status'],
            'created_at': inv['created_at']
        })

    return jsonify(serialized), 200


@invitations_bp.route('/<invitation_id>/respond', methods=['POST'])
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
