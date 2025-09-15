import os

from flask import Blueprint, jsonify, request, render_template
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Followers
from itsdangerous import URLSafeSerializer, SignatureExpired
from flask_mail import Message
from utils.mail import mail
from html import escape
users_bp = Blueprint('users', __name__)
s = URLSafeSerializer(os.getenv('AUTH_KEY'))

@users_bp.route("/<username>", methods=["GET"])
def get_user_by_username(username):
    user = User.find_by_username(username)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["_id"] = str(user["_id"])
    return jsonify(user), 200

@users_bp.route("/delete", methods=["POST"])
@jwt_required()
def delete_email():
    user_id = get_jwt_identity()
    user = User.get_user(user_id)  # retorna dict
    if not user:
        return jsonify({"error": "Usuário não encontrado"}), 404

    # Cria token para deleção
    token = s.dumps(user["email"], salt=os.getenv("SALT_DELETE"))
    delete_url = f"{request.host_url}api/users/delete-confirm/{token}"

    # HTML do email com botão
    html_body = f"""
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

    msg = Message(
        subject="Confirm Account Deletion",
        recipients=[user["email"]],
        html=html_body,
        sender=os.getenv("MAIL_USERNAME")
    )

    mail.send(msg)

    return jsonify({"message": "Check your email to confirm account deletion."}), 200


@users_bp.route("/delete-confirm/<token>", methods=["GET"])
def delete_confirm(token):

    try:
        email = s.loads(token, salt=os.getenv("SALT_DELETE"), max_age=300)
        status = "success"
    except SignatureExpired:
        email = None
        status = "error"
    except Exception:
        email = None
        status = "error"

    if status == "success":
        user = User.find_by_email(email)
        if not user or user["email"] != email:
            status = "error"
        else:
            result = User.delete(email)
            if getattr(result, "deleted_count", 0) == 0:
                status = "error"

    return render_template(
        "delete_account_template.html",
        status=status,
        email=email
    )

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

    avatar = data.get("avatar")
    bio = data.get("bio")
    music_tags = data.get("music_tags") or []

    if bio and len(bio) > 50:
        return jsonify({'error': 'Bio too long'}), 400

    if not isinstance(music_tags, list) or not all(isinstance(tag, str) for tag in music_tags):
        return jsonify({'error': 'Invalid music tags'}), 400

    # Limita a 5 gêneros
    if len(music_tags) > 5:
        music_tags = music_tags[:5]
    print(music_tags)
    result, status_code = User.config_user(
        user_id=current_user_id,
        avatar=avatar,
        bio=bio,
        music_tags=music_tags
    )
    return jsonify(result), status_code



@users_bp.route('/follow', methods=['POST'])
@jwt_required()
def post_follower():
    user_id = get_jwt_identity()
    data = request.get_json() or {}

    following_id = data.get('following_id')
    if not following_id:
        return jsonify({'error': 'missing following_id'}), 400

    try:
        result = Followers.create_follow(user_id, following_id)
        # result já é um dict: {"status": "...", "follow_id": "..."}
        status_code = 201 if result.get('status') == 'followed' else 200
        return jsonify(result), status_code
    except ValueError as ve:
        return jsonify({'error': str(ve)}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@users_bp.route('/follow/<string:following_id>', methods=['GET'])
@jwt_required()
def check_follow_status(following_id):
    user_id = get_jwt_identity()

    try:
        is_following = Followers.is_following(user_id, following_id)
        return jsonify({"is_following": is_following})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@users_bp.route("/search", methods=["GET"])
@jwt_required()
def search_users():
    query = request.args.get('q', '')
    if len(query) < 5:
        return jsonify([]), 200  # Retorna vazio se a busca for muito curta

    current_user_id = get_jwt_identity()

    # Busca por usuários que começam com a query, excluindo o próprio usuário
    # O 'i' no regex torna a busca case-insensitive
    users = User.find_by_query(query, current_user_id)

    return jsonify(users), 200


@users_bp.route('/<username>/followers', methods=['GET'])
@jwt_required()
def get_followers_list(username):
    user = User.find_by_username(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    followers_details = User.get_user_details_by_ids(user['followers'])
    return jsonify(followers_details), 200


@users_bp.route('/<username>/following', methods=['GET'])
@jwt_required()
def get_following_list(username):
    user = User.find_by_username(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    following_details = User.get_user_details_by_ids(user['following'])
    return jsonify(following_details), 200
        