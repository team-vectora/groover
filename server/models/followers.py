from datetime import datetime
from bson.objectid import ObjectId
from utils.db import mongo
from utils.genres import GENRES
from bson import Binary

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
            # unfollow
            mongo.db.followers.delete_one({"_id": existing["_id"]})
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
        cursor = mongo.db.followers.find({"following_id": ObjectId(user_id)})
        return [str(f['follower_id']) for f in cursor]

    @staticmethod
    def get_followings(user_id):
        # retorna lista de ids (strings) que user_id segue
        cursor = mongo.db.followers.find({"follower_id": ObjectId(user_id)})
        return [str(f['following_id']) for f in cursor]

    @staticmethod
    def is_following(follower_id, following_id):
        follower_oid = ObjectId(follower_id)
        following_oid = ObjectId(following_id)
        existing = mongo.db.followers.find_one({
            "follower_id": follower_oid,
            "following_id": following_oid
        })
        return bool(existing)