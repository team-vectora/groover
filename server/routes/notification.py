from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import Notification
from utils.mail import mail
from flask_mail import Message
import os
notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route("", methods=["GET"])
@jwt_required()
def get_notifications():
    user_id = get_jwt_identity()
    notifications = Notification.get_unread_notifications(user_id)
    print(notifications)
    return jsonify(notifications)


@notifications_bp.route("/check", methods=["POST"])
@jwt_required()
def see_notification():
    data = request.get_json()
    notification_id = data.get("notification_id")

    if not notification_id:
        return jsonify({"error": "notification_id is required"}), 400

    try:
        updated = Notification.check_notification(notification_id)

        if updated:
            return jsonify({"message": "Notification marked as read"}), 200
        else:
            return jsonify({"error": "Notification not found"}), 404

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@notifications_bp.route("/send-test", methods=["GET"])
def send_test_email():
    msg = Message(
        "Teste de Email",
        sender=os.getenv("MAIL_USERNAME"),
        recipients=["joaoaugusto.haupt@gmail.com"]
    )
    msg.body = "Funcionando com senha de app do Gmail!"
    mail.send(msg)
    return "Email enviado com sucesso!"