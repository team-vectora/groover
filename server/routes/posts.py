from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Post
import cloudinary.uploader

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
    print("MEU ID"+user_id)
    print("ID DO NOTIFICAOD"+user_id_owner)
    noti = Notification.create(user_id=user_id_owner, type="like")
    print(noti)
    return jsonify(response), status


@posts_bp.route('/alguemmeajuda', methods=['POST'])
@jwt_required()
def save_project_quadro():
    print("Entrou")
    return 201


