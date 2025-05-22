from datetime import datetime
from . import mongo
from bson.objectid import ObjectId
from bson.json_util import dumps
import json

class Project:
    @staticmethod
    def create_project(user_id, project_data):
        project = {
            'user_id': user_id,
            'title': project_data.get('title', 'Novo Projeto'),
            'description': project_data.get('description', ''),
            'bpm': project_data.get('bpm', 120),
            'tempo': project_data.get('tempo', '8n'),
            'matrixNotes': project_data.get('matrixNotes', []),
            'instruments': project_data.get('instruments', {}),
            'created_at': datetime.utcnow(),
            'updated_at': datetime.utcnow()
        }
        result = mongo.db.projects.insert_one(project)
        return str(result.inserted_id)

    @staticmethod
    def get_project(project_id, user_id):
        project = mongo.db.projects.find_one({
            '_id': ObjectId(project_id),
            'user_id': user_id
        })
        if project:
            project['_id'] = str(project['_id'])
        return project

    @staticmethod
    def update_project(project_id, user_id, update_data):
        update_data['updated_at'] = datetime.utcnow()
        result = mongo.db.projects.update_one(
            {
                '_id': ObjectId(project_id),
                'user_id': user_id
            },
            {'$set': update_data}
        )
        return result.modified_count > 0

    @staticmethod
    def get_user_projects(user_id):
        projects = mongo.db.projects.find({'user_id': user_id})
        return [{'id': str(p['_id']), 'title': p['title'], 'updated_at': p['updated_at']} for p in projects]