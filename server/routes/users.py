import os
from flask import Blueprint, jsonify, request, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Followers, Post, Project, Invitation
from itsdangerous import URLSafeSerializer, SignatureExpired
from flask_mail import Message
from utils.mail import mail
from html import escape
import cloudinary.uploader

users_bp = Blueprint('users', __name__)
s = URLSafeSerializer(os.getenv('AUTH_KEY'))

# ROTA ADICIONADA PARA LIDAR COM UPLOAD DE AVATAR
@users_bp.route('/upload-avatar', methods=['POST'])
@jwt_required()
def upload_avatar():
    if 'file' not in request.files:
        return jsonify({'error': 'File not found'}), 400
    try:
        # Usamos um upload_preset específico para avatares para maior segurança
        result = cloudinary.uploader.upload(request.files['file'], upload_preset='user_avatars')
        return jsonify({'secure_url': result['secure_url']}), 200
    except Exception as e:
        # Retorna uma mensagem de erro mais clara
        return jsonify({'error': str(e), 'msg': 'Cloudinary upload failed'}), 500


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
    invites = []
    if user['_id'] == current_user_id:
        invites = Invitation.find_pending_by_user(current_user_id)

    profile_data = { "user": user, "posts": posts, "projects": projects, "invites": invites }
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

    html_body = render_template("delete_email.html", username=escape(user['username']), delete_url=delete_url)

    msg = Message(subject="Confirm Account Deletion", recipients=[user["email"]], html=html_body, sender=os.getenv("MAIL_USERNAME"))
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