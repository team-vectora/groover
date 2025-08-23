from datetime import datetime
from bson.objectid import ObjectId
from utils.db import mongo
from utils.genres import GENRES
from bson import Binary

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

