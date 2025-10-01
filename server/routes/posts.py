from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Post, User
import cloudinary.uploader
# from utils.socket import socketio
from models.notification import Notification

posts_bp = Blueprint('posts', __name__)

@posts_bp.route('', methods=['POST'])
@jwt_required()
def create_post():
    data = request.get_json()
    user_id = get_jwt_identity()

    post_id = Post.create(
        user_id=user_id,
        project_id=data.get('project_id'),
        photos=data.get('photos', []),
        caption=data.get('caption', ""),
        genres=data.get('genres')
    )

    
    # socketio.emit("new_post_notification")

    return jsonify({'message': 'Post created', 'post_id': str(post_id)}), 201


@posts_bp.route('/upload-image', methods=['POST'])
@jwt_required()
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'File not found'}), 400

    image_file = request.files['file']

    try:
        result = cloudinary.uploader.upload(image_file)
        return jsonify({'secure_url': result['secure_url']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@posts_bp.route('', methods=['GET'])
@jwt_required()
def get_posts():
    user_id = get_jwt_identity()
    posts = Post.get_posts_with_user_and_project(user_id)
    return jsonify(posts), 200


@posts_bp.route('/<id>', methods=['GET'])
@jwt_required()
def get_post_by_id(id):
    post = Post.get_post(id)
    if not post:
        return jsonify({"error": "Post not found"}), 404
    return jsonify(post), 200


@posts_bp.route('/username/<username>', methods=['GET'])
@jwt_required()
def get_posts_user(username):
    posts = Post.get_posts_by_username(username)
    return jsonify(posts), 200


@posts_bp.route('/like', methods=['POST'])
@jwt_required()
def post_like():
    user_id = get_jwt_identity()
    data = request.get_json()
    post_id = data.get('post_id')

    if not post_id:
        return jsonify({'error': 'missing post_id'}), 400

    response, status = Post.like(post_id, user_id)

    user_id_owner = data.get('owner_id')
    user = User.get_user(user_id)

    Notification.create(
        user_id=user_id_owner,
        type="like",
        actor=user["username"],
        post_id=post_id
    )

    # socketio.emit("new_notification")


    return jsonify(response), status


@posts_bp.route('/<post_id>/comment', methods=['POST'])
@jwt_required()
def add_comment_to_post(post_id):
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data or not data.get('caption'):
        return jsonify({'error': 'O texto do comentário é obrigatório'}), 400

    comment_id = Post.create(
        user_id=user_id,
        parent_post_id=post_id,
        caption=data.get('caption'),
        is_comment=True,
        photos=data.get('photos', []),
        project_id=data.get('project_id', None),
        genres=data.get('genres', [])
    )

    original_post = Post.get_post(post_id)
    if original_post and str(original_post['user']['_id']) != user_id:
        actor_user = User.get_user(user_id)

        # Cria a notificação no banco
        Notification.create(
            user_id=str(original_post['user']['_id']),
            actor=actor_user['username'],
            type="comment",
            post_id=post_id,
            content=data.get('caption')
        )

        # Dispara notificação via WebSocket
        # socketio.emit("new_notification")


    return jsonify({'message': 'Comentário adicionado', 'comment_id': str(comment_id)}), 201


@posts_bp.route('/<post_id>', methods=['DELETE'])
@jwt_required()
def delete_post_route(post_id):
    user_id = get_jwt_identity()
    response, status_code = Post.delete_post(post_id, user_id)
    return jsonify(response), status_code
