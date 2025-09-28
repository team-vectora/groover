from datetime import datetime
from bson.objectid import ObjectId
from utils.db import mongo

class Invitation:
    @staticmethod
    def create_invitation(project_id, from_user_id, to_user_id):
        invitation = {
            'project_id': ObjectId(project_id),
            'from_user_id': ObjectId(from_user_id),
            'to_user_id': ObjectId(to_user_id),
            'status': 'pending',  # pending, accepted, rejected
            'created_at': datetime.now()
        }
        return mongo.db.invitations.insert_one(invitation).inserted_id

    @staticmethod
    def find_pending_invitation(project_id, to_user_id):
        """Verifica se já existe um convite pendente para um usuário em um projeto."""
        return mongo.db.invitations.find_one({
            'project_id': ObjectId(project_id),
            'to_user_id': ObjectId(to_user_id),
            'status': 'pending'
        })

    @staticmethod
    def find_by_id(invitation_id):
        return mongo.db.invitations.find_one({'_id': ObjectId(invitation_id)})

    @staticmethod
    def find_pending_by_user(user_id):
        return list(mongo.db.invitations.find({
            'to_user_id': ObjectId(user_id),
            'status': 'pending'
        }))

    @staticmethod
    def update_status(invitation_id, status):
        result = mongo.db.invitations.update_one(
            {'_id': ObjectId(invitation_id)},
            {'$set': {'status': status}}
        )
        return result.modified_count > 0