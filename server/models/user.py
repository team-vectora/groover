import os
from datetime import datetime
from bson.objectid import ObjectId
from utils.db import mongo
from utils.genres import GENRES
from itsdangerous import URLSafeTimedSerializer, SignatureExpired # Corrigido
from flask_mail import Message
from utils.mail import mail
from .followers import Followers
from markupsafe import escape
from werkzeug.security import generate_password_hash

# Corrigido: Use o TimedSerializer para tokens com expiração
s = URLSafeTimedSerializer(os.getenv('AUTH_KEY'))

# Textos de e-mail para internacionalização
EMAIL_CONTENT = {
    'pt-BR': {
        'subject': "Por favor, confirme seu e-mail",
        'title': "Bem-vindo ao Groover, {username}!",
        'body': "Obrigado por se registrar. Para ativar sua conta, por favor, confirme seu e-mail clicando no botão abaixo:",
        'button': "Confirmar E-mail",
        'footer': "Se você não criou esta conta, pode ignorar este e-mail com segurança."
    },
    'en': {
        'subject': "Please confirm your email",
        'title': "Welcome to Groover, {username}!",
        'body': "Thank you for signing up. To activate your Groover account, please confirm your email by clicking the button below:",
        'button': "Confirm Email",
        'footer': "If you didn’t create this account, you can safely ignore this email."
    }
}


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
    def send_email_verification(email, username, host_url, lang='en'):
        token = s.dumps(email, salt=os.getenv('SALT_AUTH'))
        confirm_url = f"{host_url}api/auth/confirm_email/{token}"

        # Seleciona o idioma ou usa inglês como padrão
        content = EMAIL_CONTENT.get(lang, EMAIL_CONTENT['en'])

        html_body = f"""
        <html>
          <body style="font-family: Arial, sans-serif; background-color:#0a090d; color:#e6e8e3; padding:20px;">
            <div style="max-width:600px; margin:auto; background:#121113; border-radius:10px; padding:30px; box-shadow:0 2px 10px rgba(0,0,0,0.5);">
              <h2 style="color:#4c4e30; text-align:center;">{content['title'].format(username=escape(username))}</h2>
              <p style="font-size:16px; line-height:1.5; color:#e6e8e3;">
                {content['body']}
              </p>
              <p style="text-align:center; margin:30px 0;">
                <a href="{confirm_url}" style="
                  display:inline-block;
                  padding:14px 28px;
                  background:#a97f52;
                  color:#ffffff;
                  text-decoration:none;
                  border-radius:6px;
                  font-weight:bold;
                  font-size:16px;
                  transition:all 0.3s;
                " onmouseover="this.style.background='#c1915d';">
                  {content['button']}
                </a>
              </p>
              <p style="font-size:12px; color:#e6e8e3; text-align:center; margin-top:20px;">
                {content['footer']}
              </p>
              <hr style="border:none; border-top:1px solid #070608; margin:20px 0;">
              <p style="font-size:12px; color:#61673e; text-align:center;">
                © 2025 Groover. All rights reserved.
              </p>
            </div>
          </body>
        </html>
        """

        msg = Message(
            subject=content['subject'],
            recipients=[email],
            html=html_body,
            sender=os.getenv('MAIL_USERNAME')
        )
        mail.send(msg)

    @staticmethod
    def update_password(email, new_password):
        hashed_pw = generate_password_hash(new_password)
        print(hashed_pw)
        result = mongo.db.users.update_one(
            {'email': email},
            {'$set': {'password': hashed_pw}}
        )
        print(User.find_by_email(email))
        return result.modified_count > 0

    @staticmethod
    def send_reset_password_email(email, username, reset_url):
        html_body = f"""
        <html>
        <body style="font-family: Arial; background:#0a090d; color:#e6e8e3; padding:20px;">
        <div style="max-width:600px;margin:auto;background:#121113;padding:30px;border-radius:10px;">
        <h2 style="color:#4c4e30;text-align:center;">Password Reset for {escape(username)}</h2>
        <p>Click below to reset your password:</p>
        <p style="text-align:center;">
            <a href="{reset_url}" style="padding:14px 28px;background:#a97f52;color:#fff;text-decoration:none;border-radius:6px;">Reset Password</a>
        </p>
        </div>
        </body>
        </html>
        """

        msg = Message(
            subject="Groover Password Reset",
            recipients=[email],
            body=f"Hello {username}, reset your password: {reset_url}",
            html=html_body,
            sender=os.getenv('MAIL_USERNAME')
        )
        mail.send(msg)
    # ... resto do arquivo user.py sem alterações ...
    @staticmethod
    def delete(email):
        result = mongo.db.users.delete_one({'email': email})
        return result.deleted_count > 0

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
    def activate_user(email):
        result = mongo.db.users.update_one(
            {"email": email},
            {"$set": {"active": True}}
        )
        return result.matched_count > 0


    @staticmethod
    def get_user(user_id):
        if not user_id:
            return None

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
            if similarity >= 0.4:
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

    @staticmethod
    def get_user_details_by_ids(user_ids):
        """Busca detalhes básicos de uma lista de usuários por seus IDs."""
        if not user_ids:
            return []

        user_object_ids = [ObjectId(uid) for uid in user_ids]

        users_cursor = mongo.db.users.find(
            {'_id': {'$in': user_object_ids}},
            {'username': 1, 'avatar': 1, 'bio': 1}  # Projeção para retornar apenas campos necessários
        )

        users = []
        for user in users_cursor:
            users.append({
                'id': str(user['_id']),
                'username': user['username'],
                'avatar': user.get('avatar'),
                'bio': user.get('bio', '')
            })
        return users