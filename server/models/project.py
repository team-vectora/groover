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
            'user_id': user_id,
            'midi': Binary(project_data.get('midi')) if project_data.get('midi') else None,
            'collaborators': [],  # Nova lista de colaboradores
            'title': project_data.get('title', 'New Project'),
            'description': project_data.get('description', ''),
            'bpm': project_data.get('bpm'),
            'instrument': project_data.get('instrument', 'piano'),
            'volume': project_data.get('volume', -10),
            'tempo': project_data.get('tempo'),
            'music_versions': project_data.get('music_versions', []),  # Inicializa vazio, Music cuidará disso depois
            'created_at': datetime.now(),
            'created_by': user_id,
            'updated_at': datetime.now(),
            'last_updated_by': user_id
            # sem current_music_id mas o Music também vai cuidar papai
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
    def update_project(project_id, user_id, update_data):
        update_data['updated_at'] = datetime.now()
        update_data['last_updated_by'] = user_id

        result = mongo.db.projects.update_one(
            {'_id': ObjectId(project_id)},
            {'$set': update_data}
        )
        return result.modified_count > 0

    @staticmethod
    def get_project(project_id):
        # Baita de uma cabanagem pra depois o jsonify nn ficar chorando
        # ain ObjectID nao é serializável ain ain, vou dar erro ai, ain ain

        project = mongo.db.projects.find_one({
            '_id': ObjectId(project_id)
        })
        if project:
            project['_id'] = str(project['_id'])
            if 'current_music_id' in project:
                project['current_music_id'] = str(project['current_music_id'])
            if 'music_versions' in project:
                for version in project['music_versions']:
                    version['music_id'] = str(version['music_id'])
                    version['update_by'] = str(version.get('update_by', ''))

            if 'midi' in project:
                midi_b64 = base64.b64encode(project['midi']).decode('utf-8')
                project['midi'] = f"data:audio/midi;base64,{midi_b64}"

            if 'collaborators' in project:
                project['collaborators'] = [str(id_collab) for id_collab in project['collaborators']]

            project['created_by'] = str(project.get('created_by', ''))
            project['last_updated_by'] = str(project.get('last_updated_by', ''))
        return project

    @staticmethod
    def get_project_full_data(project_id, user_id):
        project = mongo.db.projects.find_one({
            '_id': ObjectId(project_id),
            'user_id': user_id
        })
        if project:
            project['_id'] = str(project['_id'])

            if 'current_music_id' in project:
                project['current_music_id'] = Music.get_music(project['current_music_id'])

            if 'music_versions' in project:
                for version in project['music_versions']:
                    version['music_id'] = Music.get_music(version['music_id'])
                    version['update_by'] = User.get_user(version['update_by'])

            if 'midi' in project:
                midi_b64 = base64.b64encode(project['midi']).decode('utf-8')
                project['midi'] = f"data:audio/midi;base64,{midi_b64}"

            if 'collaborators' in project:
                project['collaborators'] = [str(id_collab) for id_collab in project['collaborators']]

            project['created_by'] = User.get_user(project.get('created_by', ''))
            project['last_updated_by'] = User.get_user(project.get('last_updated_by', ''))
        return project

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

            if 'midi' in project:
                midi_b64 = base64.b64encode(project['midi']).decode('utf-8')
                project['midi'] = f"data:audio/midi;base64,{midi_b64}"

            if 'collaborators' in project:
                project['collaborators'] = [str(id_collab) for id_collab in project['collaborators']]

            project['created_by'] = User.get_user(project.get('created_by', ''))
            project['last_updated_by'] = User.get_user(project.get('last_updated_by', ''))
        return project

    @staticmethod
    def get_user_projects_by_username(username):
        user = User.find_by_username(username)
        if not user:
            return []

        user_id_str = str(user['_id'])

        project_count = mongo.db.projects.count_documents({'user_id': user_id_str})
        if project_count == 0:
            print(f"No projects found for user {username} with ID {user_id_str}")
            return []

        projects = mongo.db.projects.find({
            '$or': [
                {'collaborators': {'$in': [ObjectId(user_id_str)]}},
                {'user_id': user_id_str}
            ]
        })

        result = []
        for p in projects:
            # Handle MIDI data conversion
            midi_data = p.get('midi')
            if midi_data is not None:
                try:
                    midi_data = f"data:audio/midi;base64,{base64.b64encode(midi_data).decode('utf-8')}"
                except Exception as e:
                    print(f"Error encoding MIDI for project {p['_id']}: {str(e)}")
                    midi_data = None

            result.append({
                'id': str(p['_id']),
                'midi': midi_data,
                'collaborators': [str(id_collab) for id_collab in p['collaborators']],
                'title': p.get('title', 'Untitled'),
                'bpm': p.get('bpm', 0),
                'tempo': p.get('tempo', ''),
                'description': p.get('description', ''),
                'created_at': p.get('created_at', ''),
                'updated_at': p.get('updated_at', ''),
                'created_by': User.get_user(p.get('created_by', '')),
                'last_updated_by': User.get_user(p.get('last_updated_by', '')),
                'is_owner': True
            })

        return result

    @staticmethod
    def get_user_projects(user_id):
        # Busca projetos onde o usuário é dono OU colaborador
        projects = mongo.db.projects.find({
            '$or': [
                {'user_id': user_id},
                {'collaborators': ObjectId(user_id)}
            ]
        })
        return [{
            'id': str(p['_id']),
            'midi': (lambda project:
                     f"data:audio/midi;base64," + base64.b64encode(project['midi']).decode('utf-8')
                     if 'midi' in project
                     else None
                     )(p),
            'title': p.get('title'),
            'bpm': p.get('bpm'),
            'tempo': p.get('tempo'),
            'created_at': p.get('created_at'),
            'updated_at': p.get('updated_at'),
            'created_by': str(p.get('created_by', '')),
            'last_updated_by': str(p.get('last_updated_by', '')),
            'is_owner': p['user_id'] == user_id
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
                    'last_updated_by': user_id
                },
                '$push': {
                    'music_versions': {
                        'music_id': ObjectId(target_music_id),
                        'updated_at': datetime.now(),
                        'update_by': user_id
                    }
                }
            }
        )
        return result.modified_count > 0

    @staticmethod
    def delete_project(project_id, user_id):
        """Exclui um projeto se o usuário for o proprietário."""
        project = mongo.db.projects.find_one({
            '_id': ObjectId(project_id),
            'user_id': user_id  # Garante que apenas o dono possa excluir
        })

        if not project:
            return 0  # Retorna 0 se o projeto não for encontrado ou o usuário não tiver permissão

        # Opcional: excluir músicas associadas para limpar o DB
        if 'music_versions' in project and project['music_versions']:
            music_ids = [v['music_id'] for v in project['music_versions']]
            mongo.db.musics.delete_many({'_id': {'$in': music_ids}})

        # Opcional: excluir convites pendentes
        mongo.db.invitations.delete_many({'project_id': ObjectId(project_id)})

        result = mongo.db.projects.delete_one({'_id': ObjectId(project_id)})
        return result.deleted_count
