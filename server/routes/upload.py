from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
import cloudinary.uploader

upload_bp = Blueprint('api', __name__)


@upload_bp.route('/', methods=['POST'])
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
