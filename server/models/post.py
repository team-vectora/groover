from datetime import datetime
from bson.objectid import ObjectId
from utils.db import mongo
from utils.genres import GENRES
from bson import Binary
import base64
from utils.similarity import cosine_similarity
import pytz

from models import User

class Post:
    @staticmethod
    def create(user_id, project_id=None, photos=None, caption=None, genres=None, is_comment=False, parent_post_id=None):
        tz = pytz.timezone("America/Sao_Paulo")
        post = {
            'user_id': ObjectId(user_id),
            'project_id': ObjectId(project_id) if project_id else None,
            'parent_post_id': ObjectId(parent_post_id) if parent_post_id else None,  # Novo campo
            'photos': photos if photos else [],
            'caption': caption if caption else "",
            'created_at': datetime.now(tz),
            'likes': [],
            'comments': [],
            'comment_count': 0,
            'is_comment': is_comment,
            'genres': genres if genres else []
        }
        if parent_post_id:
            mongo.db.posts.update_one(
                {'_id': ObjectId(parent_post_id)},
                {'$inc': {'comment_count': 1}}
            )
        return mongo.db.posts.insert_one(post).inserted_id

    @staticmethod
    def get_posts_with_user_and_project(user_id, similarity_threshold=0.7, limit=50):

        def encode_midi_field(post):
            if post.get('project') and post['project'] and 'midi' in post['project'] and post['project']['midi']:
                midi = post['project']['midi']
                if isinstance(midi, bytes):
                    midi_b64 = base64.b64encode(midi).decode('utf-8')
                elif isinstance(midi, str):
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
                '$match': {
                    'is_comment': False
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
                    'comment_count': 1,
                    'genres': 1,
                    'parent_post_id': {'$toString': '$parent_post_id'},
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
                                'cover_image': {'$ifNull': ['$project.cover_image', '']},
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
                print(post_user_genres)
                post = encode_midi_field(post)

                filtered_posts.append(post)

                if len(filtered_posts) == limit:
                    break

        if len(filtered_posts) < 15:
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
                    'comment_count': 1,
                    'genres': 1,
                    'parent_post_id': {'$toString': '$parent_post_id'},
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
                                'cover_image': {'$ifNull': ['$project.cover_image', '']},
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

        post['comments'] = Post.get_comments_for_post(post_id)

        return post

    @staticmethod
    def add_comment(comment, post_id):
        post = Post.get_post(post_id)
        if not post:
            return None

        mongo.db.posts.update_one(
            {'_id': ObjectId(post_id)},
            {'$push': {'comments': comment}}
        )
        return True

    @staticmethod
    def get_comments_for_post(post_id):
        """Busca todos os posts que são comentários do post_id fornecido."""
        pipeline = [
            {'$match': {'parent_post_id': ObjectId(post_id)}},
            {'$sort': {'created_at': -1}},
            {
                '$lookup': {
                    'from': 'users',
                    'localField': 'user_id',
                    'foreignField': '_id',
                    'as': 'user'
                }
            },
            {'$unwind': '$user'},
            {
                '$lookup': {
                    'from': 'projects',
                    'localField': 'project_id',
                    'foreignField': '_id',
                    'as': 'project'
                }
            },
            {'$unwind': {'path': '$project', 'preserveNullAndEmptyArrays': True}},
            {'$project': {
                '_id': {'$toString': '$_id'},
                'caption': 1, 'photos': 1, 'created_at': 1, 'likes': 1, 'comment_count': 1, 'genres': 1,
                'parent_post_id': {'$toString': '$parent_post_id'},
                'user': {
                    '_id': {'$toString': '$user._id'},
                    'username': '$user.username',
                    'avatar': '$user.avatar'
                },
                'project': {
                    '$cond': {
                        'if': {'$ifNull': ['$project', False]},
                        'then': {
                            'id': {'$toString': '$project._id'},
                                'cover_image': {'$ifNull': ['$project.cover_image', '']},
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
            }}
        ]
        comments = list(mongo.db.posts.aggregate(pipeline))
        for comment in comments:
            comment['likes'] = [str(like) for like in comment.get('likes', [])]
            # INÍCIO DA CORREÇÃO
            if comment.get('project') and comment['project'].get('midi'):
                midi_b64 = base64.b64encode(comment['project']['midi']).decode('utf-8')
                comment['project']['midi'] = f"data:audio/midi;base64,{midi_b64}"
            # FIM DA CORREÇÃO
        return comments

    @staticmethod
    def get_posts_by_user_id(user_id):
        pipeline = [
            {
                '$match': {
                    'user_id': ObjectId(user_id)
                }
            },
            {
                '$sort': {'created_at': -1}
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
                    'comment_count': 1,
                    'genres': 1,
                    'parent_post_id': {'$toString': '$parent_post_id'},
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
                                'cover_image': {'$ifNull': ['$project.cover_image', '']},
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
                '$sort': {'created_at': -1}
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
                    'comment_count': 1,
                    'genres': 1,
                    'parent_post_id': {'$toString': '$parent_post_id'},
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
                                'cover_image': {'$ifNull': ['$project.cover_image', '']},
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
        post = mongo.db.posts.find_one({'_id': ObjectId(post_id)})

        if not post:
            return {'error': 'Post não encontrado'}, 404

        post_oid = ObjectId(post_id)
        user_oid = ObjectId(user_id)

        if user_oid in post.get('likes', []):
            mongo.db.posts.update_one(
                {'_id': post_oid},
                {'$pull': {'likes': user_oid}}
            )

            return {'message': 'Like removido'}, 200
        else:
            mongo.db.posts.update_one(
                {'_id': post_oid},
                {'$push': {'likes': user_oid}}
            )

            genres = post.get('genres', [])
            User.recommendation_change(genres, user_id)

            return {'message': 'Post curtido com sucesso'}, 200

    @staticmethod
    def delete_post(post_id, user_id):
        post = mongo.db.posts.find_one({"_id": ObjectId(post_id)})
        if not post:
            return {"error": "Post not found"}, 404

        if str(post['user_id']) != user_id:
            return {"error": "Forbidden"}, 403

        if post.get('parent_post_id'):
            mongo.db.posts.update_one(
                {'_id': post['parent_post_id']},
                {'$inc': {'comment_count': -1}}
            )

        mongo.db.posts.delete_one({"_id": ObjectId(post_id)})
        return {"message": "Post deleted successfully"}, 200

    @staticmethod
    def search_posts(criteria):
        """Busca posts com base em um critério, populando dados do usuário e projeto."""
        pipeline = [
            {'$match': criteria},
            {'$sort': {'created_at': -1}},
            {'$limit': 50},
            {'$lookup': {'from': 'users', 'localField': 'user_id', 'foreignField': '_id', 'as': 'user'}},
            {'$unwind': '$user'},
            {'$lookup': {'from': 'projects', 'localField': 'project_id', 'foreignField': '_id', 'as': 'project'}},
            {'$unwind': {'path': '$project', 'preserveNullAndEmptyArrays': True}},
            {'$project': {
                '_id': {'$toString': '$_id'},
                'caption': 1, 'photos': 1, 'created_at': 1, 'likes': 1, 'comment_count': 1, 'genres': 1,
                'user': {
                    '_id': {'$toString': '$user._id'},
                    'username': '$user.username',
                    'avatar': '$user.avatar'
                },
                'project': {
                    '$cond': {
                        'if': {'$ifNull': ['$project', False]},
                        'then': {
                            'id': {'$toString': '$project._id'},
                            'cover_image': {'$ifNull': ['$project.cover_image', '']},
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
            }}
        ]
        posts = list(mongo.db.posts.aggregate(pipeline))
        for post in posts:
            post['likes'] = [str(like) for like in post.get('likes', [])]
            # **CORREÇÃO APLICADA AQUI**
            if post.get('project') and post['project'].get('midi') and isinstance(post['project']['midi'], bytes):
                midi_b64 = base64.b64encode(post['project']['midi']).decode('utf-8')
                post['project']['midi'] = f"data:audio/midi;base64,{midi_b64}"
        return posts