# models/project.py
import random
from datetime import datetime
from bson.objectid import ObjectId
from utils.db import mongo
from utils.genres import GENRES
from bson import Binary
import base64
from utils.similarity import cosine_similarity
from .music import Music
from .user import User


class Project:
    @staticmethod
    def create_project(user_id, project_data):
        project = {
            'user_id': ObjectId(user_id),
            'collaborators': [],
            'title': project_data.get('title', 'New Project'),
            'description': project_data.get('description', ''),
            'cover_image': project_data.get('cover_image'),
            'bpm': project_data.get('bpm'),
            'volume': project_data.get('volume', -10),
            'midi': Binary(project_data.get('midi')) if project_data.get('midi') else None,
            'music_versions': [],
            'created_at': datetime.now(),
            'created_by': ObjectId(user_id),
            'updated_at': datetime.now(),
            'last_updated_by': ObjectId(user_id)
        }
        return str(mongo.db.projects.insert_one(project).inserted_id)

    @staticmethod
    def create_project_fork(project_data):
        return str(mongo.db.projects.insert_one(project_data).inserted_id)

    @staticmethod
    def add_collaborator(project_id, user_id):
        result = mongo.db.projects.update_one(
            {'_id': ObjectId(project_id)},
            {'$addToSet': {'collaborators': ObjectId(user_id)}}
        )
        return result.modified_count > 0

    @staticmethod
    def remove_collaborator(project_id, user_id_to_remove):
        result = mongo.db.projects.update_one(
            {'_id': ObjectId(project_id)},
            {'$pull': {'collaborators': ObjectId(user_id_to_remove)}}
        )
        return result.modified_count > 0

    @staticmethod
    def update_project(project_id, user_id, update_data):
        update_data.pop('channels', None)
        update_data.pop('patterns', None)
        update_data.pop('songStructure', None)
        update_data['updated_at'] = datetime.now()
        update_data['last_updated_by'] = ObjectId(user_id)
        result = mongo.db.projects.update_one(
            {'_id': ObjectId(project_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0

    @staticmethod
    def get_project(project_id):
        project = mongo.db.projects.find_one({'_id': ObjectId(project_id)})
        if project:
            project['_id'] = str(project['_id'])
            if 'current_music_id' in project:
                project['current_music_id'] = str(project['current_music_id'])
            if 'music_versions' in project:
                for version in project['music_versions']:
                    version['music_id'] = str(version['music_id'])
                    version['update_by'] = str(version.get('update_by', ''))
            if 'midi' in project and project['midi']:
                midi_b64 = base64.b64encode(project['midi']).decode('utf-8')
                project['midi'] = f"data:audio/midi;base64,{midi_b64}"

            collaborator_ids = project.get('collaborators', [])
            project['collaborators'] = User.get_user_details_by_ids(collaborator_ids)

            project['user_id'] = str(project['user_id'])
            project['created_by'] = User.get_user(project.get('user_id', ''))
            project['last_updated_by'] = User.get_user(project.get('last_updated_by', ''))

        return project

    @staticmethod
    def get_explore_feed(sample_size=15, pool_size=50):
        """
        Busca projetos recentes e retorna uma amostra aleatória com dados do usuário criador,
        usando uma única agregação otimizada.
        """
        pipeline = [
            {'$sort': {'created_at': -1}},
            {'$limit': pool_size},
            {'$sample': {'size': sample_size}},
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'created_by',
                    'foreignField': '_id',
                    'as': 'created_by_user'
                }
            },
            {'$unwind': {'path': '$created_by_user', 'preserveNullAndEmptyArrays': True}},
            {
                '$project': {
                    '_id': 1,
                    'title': 1,
                    'description': 1,
                    'cover_image': 1,
                    'bpm': 1,
                    'volume': 1,
                    'created_at': 1,
                    'user_id': 1,
                    'midi': 1,
                    'created_by_user': {
                        '_id': '$created_by_user._id',
                        'username': '$created_by_user.username',
                        'avatar': '$created_by_user.avatar'
                    },
                    'last_updated_by': 1,
                    'collaborators': 1
                }
            }
        ]

        raw_projects = list(mongo.db.projects.aggregate(pipeline))

        # A serialização e formatação final são feitas aqui, na aplicação
        projects = []
        for p in raw_projects:
            project_id_str = str(p['_id'])
            created_by_user = p.get('created_by_user')

            # Processamento do MIDI
            midi_data = None
            if p.get('midi') and isinstance(p['midi'], bytes):
                midi_b64 = base64.b64encode(p['midi']).decode('utf-8')
                midi_data = f"data:audio/midi;base64,{midi_b64}"

            projects.append({
                '_id': project_id_str,
                'title': p.get('title'),
                'description': p.get('description'),
                'cover_image': p.get('cover_image'),
                'bpm': p.get('bpm'),
                'volume': p.get('volume'),
                'created_at': p.get('created_at'),
                'user_id': str(p.get('user_id')),
                'midi': midi_data,
                'created_by': {
                    '_id': str(created_by_user.get('_id')) if created_by_user else None,
                    'username': created_by_user.get('username') if created_by_user else "Unknown",
                    'avatar': created_by_user.get('avatar') if created_by_user else None
                }
            })

        return projects

    @staticmethod
    def get_project_full_data(project_id):
        project = mongo.db.projects.find_one({'_id': ObjectId(project_id)})
        if project:
            project['_id'] = str(project['_id'])
            if 'current_music_id' in project:
                project['current_music_id'] = Music.get_music(project['current_music_id'])
            if 'music_versions' in project:
                for version in project['music_versions']:
                    version['music_id'] = str(version['music_id'])
                    version['update_by'] = User.get_user(version['update_by'])
            if 'midi' in project and project.get('midi'):
                midi_b64 = base64.b64encode(project['midi']).decode('utf-8')
                project['midi'] = f"data:audio/midi;base64,{midi_b64}"

            collaborator_ids = project.get('collaborators', [])
            project['collaborators'] = User.get_user_details_by_ids(collaborator_ids)

            project['user_id'] = str(project['user_id'])
            project['created_by'] = User.get_user(project.get('created_by', ''))
            project['last_updated_by'] = User.get_user(project.get('last_updated_by', ''))
        return project

    @staticmethod
    def get_recent_projects(limit=5):
        cursor = mongo.db.projects.find().sort('created_at', -1).limit(limit)

        projects = []
        for project in cursor:
            project['_id'] = str(project['_id'])

            if 'current_music_id' in project:
                project['current_music_id'] = Music.get_music(project['current_music_id'])

            if 'music_versions' in project:
                for version in project['music_versions']:
                    version['music_id'] = str(version['music_id'])
                    version['update_by'] = User.get_user(version['update_by'])

            if 'midi' in project and project.get('midi'):
                midi_b64 = base64.b64encode(project['midi']).decode('utf-8')
                project['midi'] = f"data:audio/midi;base64,{midi_b64}"

            collaborator_ids = project.get('collaborators', [])
            project['collaborators'] = User.get_user_details_by_ids(collaborator_ids)

            project['user_id'] = str(project['user_id'])
            project['created_by'] = User.get_user(project.get('created_by', ''))
            project['last_updated_by'] = User.get_user(project.get('last_updated_by', ''))

            projects.append(project)

        return projects

    @staticmethod
    def get_project_full_data_without_user_id(project_id):
        project = mongo.db.projects.find_one({
            '_id': ObjectId(project_id)
        })
        if project:
            project['_id'] = str(project['_id'])
            if 'current_music_id' in project:
                project['current_music_id'] = Music.get_music(project['current_music_id'])
            if 'music_versions' in project:
                for version in project['music_versions']:
                    version['music_id'] = Music.get_music(version['music_id'])
                    version['update_by'] = User.get_user(version['update_by'])

            if 'midi' in project and project['midi']:
                midi_b64 = base64.b64encode(project['midi']).decode('utf-8')
                project['midi'] = f"data:audio/midi;base64,{midi_b64}"

            collaborator_ids = project.get('collaborators', [])
            project['collaborators'] = User.get_user_details_by_ids(collaborator_ids)

            project['created_by'] = User.get_user(project.get('created_by', ''))
            project['last_updated_by'] = User.get_user(project.get('last_updated_by', ''))
        return project

    @staticmethod
    def get_user_projects_by_username(username):
        user = User.find_by_username(username)
        if not user:
            return []
        user_id_obj = ObjectId(user['_id'])
        projects_cursor = mongo.db.projects.find({
            '$or': [{'user_id': user_id_obj}, {'collaborators': user_id_obj}]
        })

        projects = list(projects_cursor)
        if not projects:
            return []
        result = []
        for p in projects:
            created_by_user = User.get_user(p.get('created_by'))
            collaborator_ids = p.get('collaborators', [])
            collaborators = User.get_user_details_by_ids(collaborator_ids)
            result.append({
                'id': str(p['_id']),
                'cover_image': p.get('cover_image'),
                'title': p.get('title', 'Untitled'),
                'description': p.get('description', ''),
                'bpm': p.get('bpm', 120),
                'midi': (f"data:audio/midi;base64," + base64.b64encode(p['midi']).decode('utf-8')
                         if 'midi' in p and p.get('midi') else None),
                'created_at': p.get('created_at'),
                'created_by': created_by_user,
                'is_owner': str(p.get('user_id')) == str(user_id_obj),
                'collaborators': collaborators
            })
        return result

    @staticmethod
    def get_user_projects(user_id):
        user_id_obj = ObjectId(user_id)
        projects = mongo.db.projects.find({
            '$or': [
                {'user_id': user_id_obj},
                {'collaborators': user_id_obj}
            ]
        })
        return [{
            'id': str(p['_id']),
            'midi': (lambda project:
                     f"data:audio/midi;base64," + base64.b64encode(project['midi']).decode('utf-8')
                     if 'midi' in project and project['midi']
                     else None
                     )(p),
            'title': p.get('title'),
            'bpm': p.get('bpm'),
            'created_at': p.get('created_at'),
            'updated_at': p.get('updated_at'),
            'created_by': User.get_user(p.get('created_by')),
            'last_updated_by': User.get_user(p.get('last_updated_by')),
            'is_owner': p.get('user_id') == user_id_obj,
            'collaborators': User.get_user_details_by_ids(p.get('collaborators', []))
        } for p in projects]

    @staticmethod
    def revert_to_version(project_id, target_music_id, user_id):
        music = mongo.db.musics.find_one({'_id': ObjectId(target_music_id)})
        if not music:
            return False

        result = mongo.db.projects.update_one(
            {'_id': ObjectId(project_id)},
            {
                '$set': {
                    'current_music_id': ObjectId(target_music_id),
                    'updated_at': datetime.now(),
                    'last_updated_by': ObjectId(user_id)
                }
            }
        )
        return result.modified_count > 0

    @staticmethod
    def delete_project(project_id, user_id):
        """Exclui um projeto se o usuário for o proprietário."""
        project = mongo.db.projects.find_one({
            '_id': ObjectId(project_id),
            'user_id': ObjectId(user_id)
        })

        if not project:
            return 0

        if 'music_versions' in project and project['music_versions']:
            music_ids = [v['music_id'] for v in project['music_versions']]
            mongo.db.musics.delete_many({'_id': {'$in': music_ids}})

        mongo.db.invitations.delete_many({'project_id': ObjectId(project_id)})

        result = mongo.db.projects.delete_one({'_id': ObjectId(project_id)})
        return result.deleted_count

    @staticmethod
    def search_projects(criteria):
        projects_cursor = mongo.db.projects.find(criteria).limit(50)
        results = []
        for p in projects_cursor:
            created_by_user = User.get_user(str(p.get('created_by')))
            collaborator_ids = p.get('collaborators', [])
            collaborators = User.get_user_details_by_ids(collaborator_ids)
            results.append({
                'id': str(p['_id']),
                'title': p.get('title', 'Untitled'),
                'description': p.get('description', ''),
                'cover_image': p.get('cover_image'),
                'bpm': p.get('bpm'),
                'created_at': p.get('created_at').isoformat() if p.get('created_at') else None,
                'created_by': created_by_user,
                'user_id': str(p.get('user_id')),
                'collaborators': collaborators
            })
        return results