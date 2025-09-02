from datetime import datetime
from bson import ObjectId
from utils.db import mongo

class Notification:

    @staticmethod
    def create(user_id, actor, type, post_id=None, project_id=None, content=None):
        notification = {
            'user_id': ObjectId(user_id),
            'type': type,
            "actor": actor,
            'post_id': ObjectId(post_id) if post_id else None,
            'project_id': ObjectId(project_id) if project_id else None,
            'created_at': datetime.now(),
            'content': content if content else None,
            'read': False
        }

        return mongo.db.notifications.insert_one(notification).inserted_id

    @staticmethod
    def get_unread_notifications(user_id):
        notifs = list(mongo.db.notifications.find({
            'user_id': ObjectId(user_id),
            'read': False
        }).sort('created_at', -1))


        serialized = []
        for n in notifs:
            serialized.append({
                "_id": str(n["_id"]),
                "user_id": str(n["user_id"]),
                "type": n["type"],
                # Nao tinha adicionado antes o actor
                'content': n.get("content", ''),
                "actor": n.get("actor", None),
                "post_id": str(n["post_id"]) if n.get("post_id") else None,
                "project_id": str(n["project_id"]) if n.get("project_id") else None,
                "created_at": n["created_at"].isoformat(),
                "read": n["read"]
            })
        return serialized

    @staticmethod
    def get_all_notifications():
        return list(
            mongo.db.notifications.find().sort('created_at', -1)
        )

    @staticmethod
    def check_notification(notification_id):
        result = mongo.db.notifications.update_one(
            {"_id": ObjectId(notification_id)},
            {"$set": {"read": True}}
        )

        if result.modified_count > 0:
            return True
        return False

