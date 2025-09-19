from datetime import datetime
from bson.objectid import ObjectId
from utils.db import mongo


class Music:
    @staticmethod
    def create_music(project_id, music_data, user_id):
        # music_data agora contém a estrutura completa: channels, patterns, songStructure
        music = {
            'project_id': ObjectId(project_id),
            'channels': music_data.get('channels', []),
            'patterns': music_data.get('patterns', {}),
            'songStructure': music_data.get('songStructure', []),
            'created_at': datetime.now(),
            'created_by': user_id
        }

        music_id = mongo.db.musics.insert_one(music).inserted_id

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

