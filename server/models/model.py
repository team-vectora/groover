from datetime import datetime
from bson.objectid import ObjectId
from utils.db import mongo
from utils.genres import GENRES
from bson import Binary
import base64
from utils.similarity import cosine_similarity


class User:
    @staticmethod
    def create(username, password_hash, email=None):
        genres_dict = {genre: 0 for genre in GENRES}

        user = {
            'username': username,
            'avatar': None,
            'bio': None,
            'password': password_hash,
            'email': email,
            'created_at': datetime.now(),
            'active': False,
            'genres': genres_dict
        }
        return mongo.db.users.insert_one(user).inserted_id

    @staticmethod
    def find_by_username(username):
        user = mongo.db.users.find_one({'username': username})
        if user:
            user['_id'] = str(user['_id'])
            user['followers'] = User.get_followers(user['_id'])
            user['following'] = User.get_following(user['_id'])
        return user

    @staticmethod
    def get_user(user_id):
        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        if user:
            user['_id'] = str(user['_id'])

            user['followers'] = User.get_followers(user_id)
            user['following'] = User.get_following(user_id)
        return user

    @staticmethod
    def get_followers(user_id):
        followers_cursor = mongo.db.followers.find({'following_id': ObjectId(user_id)})
        followers = [str(f['follower_id']) for f in followers_cursor]
        return followers

    @staticmethod
    def get_following(user_id):
        following_cursor = mongo.db.followers.find({'follower_id': ObjectId(user_id)})
        following = [str(f['following_id']) for f in following_cursor]
        return following

    @staticmethod
    def recommendation_change(genres, user_id):
        user = User.get_user(user_id)

        if not user:
            return

        user_oid = ObjectId(user_id)

        user_genres = user.get('genres', {})

        for genre in genres:
            if genre in GENRES:
                mongo.db.users.update_one(
                    {'_id': user_oid},
                    {'$inc': {f'genres.{genre}': 5}}
                )

    @staticmethod
    def config_user(user_id, avatar=None, bio=None, music_tags=None):
        user = mongo.db.users.find_one({"_id": ObjectId(user_id)})
        if not user:
            return {"error": "User not found"}, 404

        update_fields = {}

        if avatar:
            update_fields['avatar'] = avatar
        if bio is not None:
            update_fields['bio'] = bio

        if music_tags is not None:
            music_tags = [tag for tag in music_tags if tag in GENRES]

            old_tags = set([genre for genre, score in user.get('genres', {}).items() if score >= 100])
            new_tags = set(music_tags)

            genres = user.get('genres', {})

            for tag in new_tags - old_tags:
                genres[tag] = genres.get(tag, 0) + 100

            for tag in old_tags - new_tags:
                genres[tag] = max(genres.get(tag, 0) - 100, 0)

            update_fields['genres'] = genres

        if not update_fields:
            return {"error": "Nenhum dado para atualizar"}, 400

        result = mongo.db.users.update_one(
            {"_id": ObjectId(user_id)},
            {"$set": update_fields}
        )

        if result.matched_count == 0:
            return {"error": "User not found"}, 404

        return {"message": "User updated successfully"}, 200

    @staticmethod
    def get_similar_users(user_id, limit=20):
        user = User.get_user(user_id)
        if not user:
            return []

        user_genres = user.get('genres', {})
        user_vector = [user_genres.get(g, 0) for g in GENRES]

        following_ids = [ObjectId(f) for f in user.get('following', [])]

        excluded_ids = following_ids + [ObjectId(user_id)]

        users = list(mongo.db.users.find({'_id': {'$nin': excluded_ids}}))

        similar_users = []

        for u in users:
            u_genres = u.get('genres', {})
            u_vector = [u_genres.get(g, 0) for g in GENRES]
            similarity = cosine_similarity(user_vector, u_vector)
            if similarity >= 0.6:
                similar_users.append({
                    '_id': str(u['_id']),
                    'username': u.get('username'),
                    'avatar': u.get('avatar'),
                    'bio': u.get('bio'),
                    'similarity': similarity
                })

        similar_users = sorted(similar_users, key=lambda x: x['similarity'], reverse=True)[:limit]

        return similar_users


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
            'music_versions': [],  # Inicializa vazio, Music cuidará disso depois
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
    def get_project(project_id, user_id):
        # Baita de uma cabanagem pra depois o jsonify nn ficar chorando
        # ain ObjectID nao é serializável ain ain, vou dar erro ai, ain ain

        project = mongo.db.projects.find_one({
            '_id': ObjectId(project_id),
            'user_id': user_id
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


class Music:
    @staticmethod
    def create_music(project_id, layers, user_id):
        music = {
            'project_id': ObjectId(project_id),
            'layers': layers,
            'created_at': datetime.now(),
            'created_by': user_id
        }

        music_id = mongo.db.musics.insert_one(music).inserted_id

        # Ó ele ai, papai ama, papai cuida
        mongo.db.projects.update_one(
            {'_id': ObjectId(project_id)},
            {
                '$set': {
                    'current_music_id': music_id,
                    'updated_at': datetime.now(),
                    'last_updated_by': user_id
                },
                '$push': {
                    'music_versions': {
                        'music_id': music_id,
                        'updated_at': datetime.now(),
                        'update_by': user_id
                    }
                }
            }
        )

        return str(music_id)

    @staticmethod
    def get_music(music_id):
        music = mongo.db.musics.find_one({'_id': ObjectId(music_id)})
        if music:
            music['_id'] = str(music['_id'])
            music['project_id'] = str(music['project_id'])
            music['created_by'] = str(music.get('created_by', ''))

        return music


# Adicionar nova coleção de convites
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


class Post:
    @staticmethod
    def create(user_id, project_id=None, photos=None, caption=None, genres=None):

        post = {
            'user_id': ObjectId(user_id),
            'photos': photos if photos else [],
            'caption': caption if caption else "",
            'created_at': datetime.now(),
            'likes': [],
            'comments': [],
            'project_id': ObjectId(project_id) if project_id else None,
            'genres': genres if genres else []
        }

        return mongo.db.posts.insert_one(post).inserted_id



    @staticmethod
    def get_posts_with_user_and_project(user_id, similarity_threshold=0.5, limit=25):

        def encode_midi_field(post):
            if post.get('project') and post['project'] and 'midi' in post['project'] and post['project']['midi']:
                midi = post['project']['midi']
                if isinstance(midi, bytes):
                    midi_b64 = base64.b64encode(midi).decode('utf-8')
                elif isinstance(midi, str):
                    # Se já começa com o prefixo data:audio/midi;base64, remove para não duplicar
                    if midi.startswith('data:audio/midi;base64,'):
                        midi_b64 = midi.split(',', 1)[1]
                    else:
                        midi_b64 = midi
                else:
                    midi_b64 = None

                if midi_b64:
                    post['project']['midi'] = f"data:audio/midi;base64,{midi_b64}"
                else:
                    post['project']['midi'] = None
            elif post.get('project') and post['project']:
                post['project']['midi'] = None
            return post

        user = mongo.db.users.find_one({'_id': ObjectId(user_id)})
        if not user:
            return []

        user_genres = user.get('genres', {})
        user_vector = [user_genres.get(g, 0) for g in GENRES]

        pipeline = [
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            {
                '$unwind': {
                    'path': '$user',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$lookup': {
                    'from': 'projects',
                    'localField': 'project_id',
                    'foreignField': '_id',
                    'as': 'project'
                }
            },
            {
                '$unwind': {
                    'path': '$project',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$project': {
                    '_id': {'$toString': '$_id'},
                    'caption': 1,
                    'photos': 1,
                    'created_at': 1,
                    'likes': 1,
                    'comments': 1,
                    'genres': 1,
                    'user': {
                        '_id': {'$toString': '$user._id'},
                        'username': '$user.username',
                        'avatar': '$user.avatar',
                        'genres': '$user.genres'
                    },
                    'project': {
                        '$cond': {
                            'if': {'$ifNull': ['$project', False]},
                            'then': {
                                'id': {'$toString': '$project._id'},
                                'user_id': {'$toString': '$project.user_id'},
                                'title': {'$ifNull': ['$project.title', 'New Project']},
                                'description': {'$ifNull': ['$project.description', '']},
                                'bpm': '$project.bpm',
                                'instrument': {'$ifNull': ['$project.instrument', 'piano']},
                                'volume': {'$ifNull': ['$project.volume', -10]},
                                'tempo': '$project.tempo',
                                'midi': '$project.midi',
                                'created_at': '$project.created_at'
                            },
                            'else': None
                        }
                    }
                }
            },
            {
                '$sort': {'created_at': -1}
            },
            {
                '$limit': limit * 3
            }
        ]

        raw_posts = list(mongo.db.posts.aggregate(pipeline))

        filtered_posts = []
        for post in raw_posts:
            post_user_genres = post['user'].get('genres', {})
            if isinstance(post_user_genres, list):
                post_user_genres = {genre: 1 for genre in post_user_genres}

            post_vector = [post_user_genres.get(g, 0) for g in GENRES]

            similarity = cosine_similarity(user_vector, post_vector)

            if similarity >= similarity_threshold:
                if 'likes' in post:
                    post['likes'] = [str(like) if isinstance(like, ObjectId) else like for like in post['likes']]

                post = encode_midi_field(post)

                filtered_posts.append(post)

                if len(filtered_posts) == limit:
                    break

        if len(filtered_posts) < 5:
            fallback_posts = []
            for post in raw_posts:
                if 'likes' in post:
                    post['likes'] = [str(like) if isinstance(like, ObjectId) else like for like in post['likes']]

                post = encode_midi_field(post)

                fallback_posts.append(post)

                if len(fallback_posts) == limit:
                    break

            return fallback_posts

        return filtered_posts


    @staticmethod
    def get_posts():
        return list(mongo.db.posts.find())

    @staticmethod
    def get_post(post_id):
        pipeline = [
            {
                '$match': {
                    '_id': ObjectId(post_id)
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            {
                '$unwind': {
                    'path': '$user',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$lookup': {
                    'from': 'projects',
                    'localField': 'project_id',
                    'foreignField': '_id',
                    'as': 'project'
                }
            },
            {
                '$unwind': {
                    'path': '$project',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$project': {
                    '_id': {'$toString': '$_id'},
                    'caption': 1,
                    'photos': 1,
                    'created_at': 1,
                    'likes': 1,
                    'comments': 1,
                    'genres': 1,
                    'user': {
                        '_id': {'$toString': '$user._id'},
                        'username': '$user.username',
                        'email': '$user.email',
                        'avatar': '$user.avatar'
                    },
                    'project': {
                        '$cond': {
                            'if': {'$ifNull': ['$project', False]},
                            'then': {
                                'id': {'$toString': '$project._id'},
                                'user_id': {'$toString': '$project.user_id'},
                                'title': {'$ifNull': ['$project.title', 'New Project']},
                                'description': {'$ifNull': ['$project.description', '']},
                                'bpm': '$project.bpm',
                                'instrument': {'$ifNull': ['$project.instrument', 'piano']},
                                'volume': {'$ifNull': ['$project.volume', -10]},
                                'tempo': '$project.tempo',
                                'midi': '$project.midi',
                                'created_at': '$project.created_at'
                            },
                            'else': None
                        }
                    }
                }
            }
        ]

        result = list(mongo.db.posts.aggregate(pipeline))

        if not result:
            return None

        post = result[0]

        if 'likes' in post:
            post['likes'] = [str(like) if isinstance(like, ObjectId) else like for like in post['likes']]

        if post.get('project') and post['project'] and 'midi' in post['project'] and post['project']['midi']:
            midi_b64 = base64.b64encode(post['project']['midi']).decode('utf-8')
            post['project']['midi'] = f"data:audio/midi;base64,{midi_b64}"
        elif post.get('project') and post['project']:
            post['project']['midi'] = None

        return post



    @staticmethod
    def get_posts_by_user_id(user_id):
        pipeline = [
            {
                '$match': {
                    'user_id': ObjectId(user_id)
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            {
                '$unwind': {
                    'path': '$user',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$lookup': {
                    'from': 'projects',
                    'localField': 'project_id',
                    'foreignField': '_id',
                    'as': 'project'
                }
            },
            {
                '$unwind': {
                    'path': '$project',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$project': {
                    '_id': {'$toString': '$_id'},
                    'caption': 1,
                    'photos': 1,
                    'created_at': 1,
                    'likes': 1,
                    'comments': 1,
                    'genres': 1,
                    'user': {
                        '_id': {'$toString': '$user._id'},
                        'username': '$user.username',
                        'email': '$user.email',
                        'avatar': '$user.avatar'
                    },
                    'project': {
                        '$cond': {
                            'if': {'$ifNull': ['$project', False]},
                            'then': {
                                'id': {'$toString': '$project._id'},
                                'user_id': {'$toString': '$project.user_id'},
                                'title': {'$ifNull': ['$project.title', 'New Project']},
                                'description': {'$ifNull': ['$project.description', '']},
                                'bpm': '$project.bpm',
                                'instrument': {'$ifNull': ['$project.instrument', 'piano']},
                                'volume': {'$ifNull': ['$project.volume', -10]},
                                'tempo': '$project.tempo',
                                'midi': '$project.midi',
                                'created_at': '$project.created_at'
                            },
                            'else': None
                        }
                    }
                }
            }
        ]

        posts = list(mongo.db.posts.aggregate(pipeline))

        for post in posts:
            if 'likes' in post:
                post['likes'] = [str(like) if isinstance(like, ObjectId) else like for like in post['likes']]

            if post.get('project') and post['project'] and 'midi' in post['project'] and post['project']['midi']:
                midi_b64 = base64.b64encode(post['project']['midi']).decode('utf-8')
                post['project']['midi'] = f"data:audio/midi;base64,{midi_b64}"
            elif post.get('project') and post['project']:
                post['project']['midi'] = None

        return posts

    @staticmethod
    def get_posts_by_username(username):
        user = User.find_by_username(username)
        if user is None:
            return []

        pipeline = [
            {
                '$match': {
                    'user_id': ObjectId(user["_id"])
                }
            },
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            {
                '$unwind': {
                    'path': '$user',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$lookup': {
                    'from': 'projects',
                    'localField': 'project_id',
                    'foreignField': '_id',
                    'as': 'project'
                }
            },
            {
                '$unwind': {
                    'path': '$project',
                    'preserveNullAndEmptyArrays': True
                }
            },
            {
                '$project': {
                    '_id': {'$toString': '$_id'},
                    'caption': 1,
                    'photos': 1,
                    'created_at': 1,
                    'likes': 1,
                    'comments': 1,
                    'genres': 1,
                    'user': {
                        '_id': {'$toString': '$user._id'},
                        'username': '$user.username',
                        'email': '$user.email',
                        'avatar': '$user.avatar',
                        'genres': '$user.genres'
                    },
                    'project': {
                        '$cond': {
                            'if': {'$ifNull': ['$project', False]},
                            'then': {
                                'id': {'$toString': '$project._id'},
                                'user_id': {'$toString': '$project.user_id'},
                                'title': {'$ifNull': ['$project.title', 'New Project']},
                                'description': {'$ifNull': ['$project.description', '']},
                                'bpm': '$project.bpm',
                                'instrument': {'$ifNull': ['$project.instrument', 'piano']},
                                'volume': {'$ifNull': ['$project.volume', -10]},
                                'tempo': '$project.tempo',
                                'midi': '$project.midi',
                                'created_at': '$project.created_at'
                            },
                            'else': None
                        }
                    }
                }
            }
        ]

        posts = list(mongo.db.posts.aggregate(pipeline))

        for post in posts:
            if 'likes' in post:
                post['likes'] = [str(like) if isinstance(like, ObjectId) else like for like in post['likes']]

            if post.get('project') and post['project'] and 'midi' in post['project'] and post['project']['midi']:
                midi_b64 = base64.b64encode(post['project']['midi']).decode('utf-8')
                post['project']['midi'] = f"data:audio/midi;base64,{midi_b64}"
            elif post.get('project') and post['project']:
                post['project']['midi'] = None

        return posts

    @staticmethod
    def like(post_id, user_id):
        post = Post.get_post(post_id)

        if not post:
            return {'error': 'Post não encontrado'}, 404

        post_oid = ObjectId(post_id)

        if user_id in post.get('likes', []):
            mongo.db.posts.update_one(
                {'_id': post_oid},
                {'$pull': {'likes': user_id}}
            )

            return {'message': 'Like removido'}, 200
        else:
            mongo.db.posts.update_one(
                {'_id': post_oid},
                {'$push': {'likes': user_id}}
            )

            genres = post.get('genres', [])
            User.recommendation_change(genres, user_id)

            return {'message': 'Post curtido com sucesso'}, 200


# FAzer bunitinho neh? Separar seguidor da entidade usuario
class Followers:

    @staticmethod
    def create_follow(follower_id, following_id):
        if follower_id == following_id:
            raise ValueError("Can't follow itself.")

        existing = mongo.db.followers.find_one({
            "follower_id": ObjectId(follower_id),
            "following_id": ObjectId(following_id)
        })

        if existing:
            mongo.db.followers.delete_one({
                "_id": existing["_id"]
            })
            return {
                "status": "unfollowed",
                "follow_id": str(existing["_id"])
            }

        follow = {
            "follower_id": ObjectId(follower_id),
            "following_id": ObjectId(following_id),
            "created_at": datetime.utcnow()
        }
        result = mongo.db.followers.insert_one(follow)
        return {
            "status": "followed",
            "follow_id": str(result.inserted_id)
        }

    @staticmethod
    def get_followers(user_id):
        return list(mongo.db.followers.find({"follower_id": ObjectId(user_id)}))

    @staticmethod
    def get_followings(user_id):
        return list(mongo.db.followers.find({"following_id": ObjectId(user_id)}))

    @staticmethod
    def is_following(follower_id, following_id):

        follower_oid = ObjectId(follower_id)
        following_oid = ObjectId(following_id)

        existing = mongo.db.followers.find_one({
            "follower_id": follower_oid,
            "following_id": following_oid
        })

        return bool(existing)
