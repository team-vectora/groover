# routes/users.py
import os
from flask import Blueprint, jsonify, request, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Followers, Post, Project, Invitation, Notification
from itsdangerous import URLSafeSerializer, SignatureExpired
from flask_mail import Message
from utils.mail import mail
from html import escape
from utils.socket import socketio

users_bp = Blueprint('users', __name__)
s = URLSafeSerializer(os.getenv('AUTH_KEY'))


@users_bp.route("/<username>", methods=["GET"])
@jwt_required()
def get_user_by_username(username):
    current_user_id = get_jwt_identity()
    user = User.find_by_username(username, current_user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(user), 200


@users_bp.route("/profile/<username>", methods=["GET"])
@jwt_required()
def get_user_profile(username):
    current_user_id = get_jwt_identity()
    user = User.find_by_username(username, current_user_id)

    if not user:
        return jsonify({"error": "User not found"}), 404

    posts = Post.get_posts_by_username(username)
    projects = Project.get_user_projects_by_username(username)

    invites_cursor = []
    # Apenas busca convites se o perfil visualizado for o do usuário logado
    if str(user['_id']) == current_user_id:
        invites_from_db = Invitation.find_pending_by_user(current_user_id)
        # **CORREÇÃO APLICADA AQUI**
        # Serializa os convites para converter ObjectId para string
        for inv in invites_from_db:
            project = Project.get_project(str(inv['project_id']))
            from_user = User.get_user(str(inv['from_user_id']))
            invites_cursor.append({
                'id': str(inv['_id']),
                'project': {
                    'id': str(inv['project_id']),
                    'title': project.get('title') if project else 'Unknown Project'
                },
                'from_user': {
                    'id': str(inv['from_user_id']),
                    'username': from_user.get('username') if from_user else 'Unknown User'
                },
                'status': inv['status'],
                'created_at': inv['created_at'].isoformat()  # Converte datetime para string
            })

    profile_data = {"user": user, "posts": posts, "projects": projects, "invites": invites_cursor}
    return jsonify(profile_data), 200


@users_bp.route("/delete", methods=["POST"])
@jwt_required()
def delete_email():
    user_id = get_jwt_identity()
    user = User.get_user(user_id)
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    token = s.dumps(user["email"], salt=os.getenv("SALT_DELETE"))
    delete_url = f"{request.host_url}api/users/delete-confirm/{token}"

    html_body = html_body = f"""
    <html>
      <body style="font-family: Arial, sans-serif; background-color:#0a090d; color:#e6e8e3; padding:20px;">
        <div style="max-width:600px; margin:auto; background:#121113; border-radius:10px; padding:30px; box-shadow:0 2px 10px rgba(0,0,0,0.5);">
          <h2 style="color:#4c4e30; text-align:center;">Groover Account Deletion</h2>
          <p style="font-size:16px; line-height:1.5; color:#e6e8e3;">
            Hello {escape(user['username'])}, we received a request to delete your Groover account.
          </p>
          <p style="font-size:16px; line-height:1.5; color:#e6e8e3;">
            To confirm the deletion, please click the button below. This link expires in 5 minutes.
          </p>
          <p style="text-align:center; margin:30px 0;">
            <a href="{delete_url}" style="
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
              Confirm Deletion
            </a>
          </p>
          <p style="font-size:12px; color:#e6e8e3; text-align:center; margin-top:20px;">
            If you didn’t request this deletion, you can safely ignore this email.
          </p>
          <hr style="border:none; border-top:1px solid #070608; margin:20px 0;">
          <p style="font-size:12px; color:#61673e; text-align:center;">
            © 2025 Groover. All rights reserved.
          </p>
        </div>
      </body>
    </html>
    """

    msg = Message(subject="Confirm Account Deletion", recipients=[user["email"]], html=html_body,
                  sender=os.getenv("MAIL_USERNAME"))
    mail.send(msg)
    return jsonify({"message": "Check your email to confirm account deletion."}), 200


@users_bp.route("/delete-confirm/<token>", methods=["GET"])
def delete_confirm(token):
    try:
        email = s.loads(token, salt=os.getenv("SALT_DELETE"), max_age=300)
        user = User.find_by_email(email)
        if not user: raise Exception("User not found")
        User.delete(user["_id"])
        status = "success"
    except SignatureExpired:
        status = "expired"
    except Exception:
        status = "error"

    return render_template("delete_account_template.html", status=status)


@users_bp.route("/similar", methods=["GET"])
@jwt_required()
def get_users_similar():
    users = User.get_similar_users(user_id=get_jwt_identity())
    if users is None:
        return jsonify({"error": "User not found"}), 404
    return jsonify(users), 200


@users_bp.route('/config', methods=['PUT'])
@jwt_required()
def config_user():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    result, status_code = User.config_user(
        user_id=current_user_id,
        avatar=data.get("avatar"),
        bio=data.get("bio"),
        music_tags=data.get("music_tags") or []
    )
    return jsonify(result), status_code


@users_bp.route('/follow', methods=['POST'])
@jwt_required()
def post_follower():
    user_id = get_jwt_identity()
    data = request.get_json() or {}
    following_id = data.get('following_id')
    if not following_id: return jsonify({'error': 'missing following_id'}), 400
    try:
        result = Followers.create_follow(user_id, following_id)
        status_code = 201 if result.get('status') == 'followed' else 200

        # --- INÍCIO DA CORREÇÃO ---
        # Se a ação foi "followed", cria e envia a notificação
        if result.get('status') == 'followed':
            actor_user = User.get_user(user_id) # O usuário que clicou em seguir
            if actor_user:
                # Cria a notificação no banco de dados
                Notification.create(
                    user_id=following_id,       # O usuário que foi seguido recebe
                    type='new_follower',
                    actor=actor_user['username']
                )
                # Emite o evento via WebSocket
                socketio.emit(
                    "new_notification"
                )
        # --- FIM DA CORREÇÃO ---

        return jsonify(result), status_code
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400


@users_bp.route("/search", methods=["GET"])
@jwt_required()
def search_users():
    query = request.args.get('q', '')
    if len(query) < 3: return jsonify([]), 200
    users = User.find_by_query(query, get_jwt_identity())
    return jsonify(users), 200


@users_bp.route('/<username>/followers', methods=['GET'])
@jwt_required()
def get_followers_list(username):
    user = User.find_by_username(username)
    if not user: return jsonify({"error": "User not found"}), 404
    followers_details = User.get_user_details_by_ids(user['followers'])
    return jsonify(followers_details), 200


@users_bp.route('/<username>/following', methods=['GET'])
@jwt_required()
def get_following_list(username):
    user = User.find_by_username(username)
    if not user: return jsonify({"error": "User not found"}), 404
    following_details = User.get_user_details_by_ids(user['following'])
    return jsonify(following_details), 200