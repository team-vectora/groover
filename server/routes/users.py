from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import User, Followers

users_bp = Blueprint('users', __name__)

@users_bp.route("/<username>", methods=["GET"])
def get_user_by_username(username):
    user = User.find_by_username(username)
    if not user:
        return jsonify({"error": "User not found"}), 404
    user["_id"] = str(user["_id"])
    return jsonify(user), 200

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
    music_tags = data.get("music_tags")

    if len(bio) > 50:
        return jsonify({'error': 'Bio too long'}), 400
    if music_tags and len(music_tags) > 5:
        music_tags = music_tags[:5]

    result, status_code = User.config_user(user_id=current_user_id, avatar=avatar, bio=bio, music_tags=music_tags)
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

        