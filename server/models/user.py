from datetime import datetime
from bson.objectid import ObjectId
from utils.db import mongo
from utils.genres import GENRES
from bson import Binary
from utils.similarity import cosine_similarity

from .followers import Followers

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
    def find_by_email(email):
        user = mongo.db.users.find_one({'email': email})
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
        return Followers.get_followers(user_id)

    @staticmethod
    def get_following(user_id):
        return Followers.get_followings(user_id)

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

    @staticmethod
    def find_by_query(query, exclude_user_id):
        """Busca usuários por nome de usuário (autocomplete)."""
        users_cursor = mongo.db.users.find({
            'username': {'$regex': f'^{query}', '$options': 'i'},
            '_id': {'$ne': ObjectId(exclude_user_id)}
        }).limit(10)

        users = []
        for user in users_cursor:
            users.append({
                'id': str(user['_id']),
                'username': user['username'],
                'avatar': user.get('avatar')
            })
        return users
