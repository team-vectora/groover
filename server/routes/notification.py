from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Notification

notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.get_unread_notifications(user_id)
    print(notifications)
    return jsonify(notifications)
