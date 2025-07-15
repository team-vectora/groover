import base64

from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required, 
    get_jwt_identity,
    create_access_token
)
# from similarity import cosine_similarity
from werkzeug.security import generate_password_hash, check_password_hash
from models.model import Followers, Music, Project, User, Post, Invitation
from bson.objectid import ObjectId
from datetime import datetime, timedelta
import cloudinary.uploader
auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/signup', methods=['POST'])
def signup():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    if User.find_by_username(data['username']):
        return jsonify({'error': 'Username already exists'}), 409
    
    hashed_pw = generate_password_hash(data['password'])
    user_id = User.create(
        username=data['username'],
        password_hash=hashed_pw,
        email=data.get('email')
    )
    
    return jsonify({
        'message': 'User created successfully',
        'id': str(user_id)
    }), 201

@auth_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    
    if not data or not data.get('username') or not data.get('password'):
        return jsonify({'error': 'Username and password are required'}), 400
    
    user = User.find_by_username(data['username'])
    
    if not user or not check_password_hash(user['password'], data['password']):
        return jsonify({'error': 'Invalid credentials'}), 401
    
    expires = timedelta(hours=24)
    access_token = create_access_token(
        identity=str(user['_id']), 
        expires_delta=expires
    )
    followings = Followers.get_followings(user['_id'])
    print(followings)

    if 'avatar' not in user.keys():
        user['avatar'] = None

    return jsonify({
        'access_token': access_token,
        'user_id': str(user['_id']),
        'username': user['username'],
        'avatar': user['avatar']
    }), 200

@auth_bp.route("/user/<username>", methods=["GET"])
def get_user_by_username(username):
    user = User.find_by_username(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    user["_id"] = str(user["_id"])
    return jsonify(user), 200



@auth_bp.route('/config', methods=['PUT'])
@jwt_required()
def config_user():
    current_user_id = get_jwt_identity()

    data = request.get_json()
    avatar = data.get("avatar")
    bio = data.get("bio")
    music_tags = data.get("music_tags")

    if music_tags is not None and len(music_tags) > 5:
        music_tags = music_tags[:5]

    result, status_code = User.config_user(
        user_id=current_user_id,
        avatar=avatar,
        bio=bio,
        music_tags=music_tags
    )

    return jsonify(result), status_code

@auth_bp.route('/projects', methods=['POST'])
@jwt_required()
def save_project():
    user_id = get_jwt_identity()
    data = request.get_json()

    if not data:
        return jsonify({'error': 'No data provided'}), 400

    midi_base64 = data.get('midi')
    midi_binary = base64.b64decode(midi_base64) if midi_base64 else None

    project_data = {
        'title': data.get('title', 'New Project'),
        'midi': midi_binary,
        'description': data.get('description', ''),
        'bpm': data.get('bpm', 120),
        'instrument': data.get('instrument', 'piano'),
        'volume': data.get('volume', -10)
    }

    if 'id' in data:
        project_id = data['id']

        if data.get('layers'):
            music_id = Music.create_music(
                project_id=project_id,
                layers=data.get('layers'),
                user_id=user_id
            )

        success = Project.update_project(project_id, user_id, project_data)
        project = Project.get_project_full_data(project_id, user_id)

        if success:
            return jsonify(project), 200
        return jsonify({'error': 'Project not found or update failed'}), 404
    else:
        project_id = Project.create_project(user_id, project_data)

        music_id = Music.create_music(
            project_id=project_id,
            layers=data.get('layers', {}),
            user_id=user_id
        )

        project = Project.get_project_full_data(project_id, user_id)

        return jsonify(project), 201


@auth_bp.route('/projects/<project_id>', methods=['GET'])
@jwt_required()
def get_project(project_id):
    user_id = get_jwt_identity()
    project = Project.get_project_full_data(project_id, user_id)

    if project:
        return jsonify(project), 200

    return jsonify({'error': 'Project not found'}), 404

@auth_bp.route('/projects/user/<username>', methods=['GET'])
@jwt_required()
def list_projects_by_username(username):
    print("oi")
    projects = Project.get_user_projects_by_username(username)

    if not projects:
        return jsonify([]), 200

    for project in projects:
        print("oi")
        print( project.get('midi'))

    return jsonify(projects), 200



@auth_bp.route('/projects/<project_id>/revert', methods=['POST'])
@jwt_required()
def revert_project_version(project_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    target_music_id = data.get('music_id')

    if not target_music_id:
        return jsonify({'error': 'music_id is required'}), 400

    success = Project.revert_to_version(project_id, target_music_id)
    if success:
        return jsonify({'message': 'Project reverted successfully'}), 200
    return jsonify({'error': 'Invalid project or music ID'}), 400

# Rota para enviar convite
@auth_bp.route('/projects/<project_id>/invite', methods=['POST'])
@jwt_required()
def invite_user(project_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('username'):
        return jsonify({'error': 'Username is required'}), 400
    
    # Verificar se o usuário atual é dono do projeto
    project = Project.get_project(project_id, user_id)
    if not project:
        return jsonify({'error': 'Project not found or permission denied'}), 404
    
    # Buscar usuário convidado
    invited_user = User.find_by_username(data['username'])
    if not invited_user:
        return jsonify({'error': 'User not found'}), 404
    
    invited_user_id = str(invited_user['_id'])
    
    # Não pode convidar a si mesmo
    if invited_user_id == user_id:
        return jsonify({'error': 'Cannot invite yourself'}), 400
    
    # Criar convite
    invitation_id = Invitation.create_invitation(
        project_id=project_id,
        from_user_id=user_id,
        to_user_id=invited_user_id
    )
    
    return jsonify({
        'message': 'Invitation sent',
        'invitation_id': str(invitation_id)
    }), 201

# Rota para listar convites pendentes
@auth_bp.route('/invitations', methods=['GET'])
@jwt_required()
def list_invitations():
    user_id = get_jwt_identity()
    invitations = Invitation.find_pending_by_user(user_id)
    
    serialized = []
    for inv in invitations:
        project = Project.get_project(str(inv['project_id']), str(inv['from_user_id']))
        from_user = User.get_user(str(inv['from_user_id']))
        
        serialized.append({
            'id': str(inv['_id']),
            'project': {
                'id': str(inv['project_id']),
                'title': project.get('title') if project else 'Unknown Project'
            },
            'from_user': {
                'id': str(inv['from_user_id']),
                'username': from_user.get('username') if from_user else 'Unknown User'
            },
            'created_at': inv['created_at']
        })
    
    return jsonify(serialized), 200

# Rota para responder convite
@auth_bp.route('/invitations/<invitation_id>/respond', methods=['POST'])
@jwt_required()
def respond_invitation(invitation_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or not data.get('response'):
        return jsonify({'error': 'Response is required'}), 400
    
    invitation = Invitation.find_by_id(invitation_id)
    if not invitation or str(invitation['to_user_id']) != user_id:
        return jsonify({'error': 'Invitation not found'}), 404
    
    if invitation['status'] != 'pending':
        return jsonify({'error': 'Invitation already responded'}), 400
    
    response = data['response']
    if response not in ['accept', 'reject']:
        return jsonify({'error': 'Invalid response'}), 400
    
    # Atualizar status do convite
    Invitation.update_status(invitation_id, response + 'ed')
    
    if response == 'accept':
        # Adicionar usuário como colaborador
        Project.add_collaborator(
            project_id=str(invitation['project_id']),
            user_id=user_id
        )
    
    return jsonify({'message': f'Invitation {response}ed'}), 200



@auth_bp.route('/post', methods=['POST'])
@jwt_required()
def create_post():
    data = request.get_json()
    user_id = get_jwt_identity()

    caption = data.get('caption', "")
    photos = data.get('photos', [])
    project_id = data.get('project_id', None)


    post_id = Post.create(
        user_id=user_id,
        project_id=project_id,
        photos=photos,
        caption=caption,
    )

    return jsonify({'message': 'Post created', 'post_id': str(post_id)}), 201

@auth_bp.route('/upload-image', methods=['POST'])
@jwt_required()
def upload_image():
    if 'file' not in request.files:
        return jsonify({'error': 'File not found'}), 400

    image_file = request.files['file']

    try:
        result = cloudinary.uploader.upload(image_file)
        return jsonify({'secure_url': result['secure_url']}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@auth_bp.route('/post', methods=['GET'])
@jwt_required()
def get_posts():
    posts = Post.get_posts_with_user_and_project()
    return jsonify(posts), 200


@auth_bp.route('/post/<id>', methods=['GET'])
@jwt_required()
def get_post_by_id(id):

    post = Post.get_post(id)
    serialized = []

    user = User.get_user(post.get('user_id'))

    user_data = {
        'id': str(user['_id']),
        'username': user.get('username'),
        'avatar': user.get('avatar')
    } if user else None

    serialized.append({
        'id': str(post.get('_id', '')),
        'user': user_data,
        'caption': post.get('caption', ''),
        'photos': post.get('photos', []),
        'created_at': post.get('created_at'),
        'likes': post.get('likes', []),
        'comments': post.get('comments', []),
    })

    return jsonify(serialized), 200

@auth_bp.route('/post/username/<username>', methods=['GET'])
@jwt_required()
def get_posts_user(username):
    posts = Post.get_posts_by_username(username)

    return jsonify(posts), 200

@auth_bp.route('/post/like', methods=['POST'])
@jwt_required()
def post_like():
    user_id = get_jwt_identity()
    data = request.get_json()

    post_id = data.get('post_id')

    if not post_id:
        return jsonify({'error': 'missing post_id'}), 400
    print(post_id)
    response, status = Post.like(post_id, user_id)
    
    return jsonify(response), status

@auth_bp.route('/follow', methods=['POST'])
@jwt_required()
def post_follower():
    user_id =get_jwt_identity()
    data = request.get_json()

    following_id = data.get('following_id')
    print(user_id)
    try:
        follow_id = Followers.create_follow(user_id, following_id)
        return jsonify({
            "message": "Sucess",
            "follow_id": str(follow_id)
        }), 201
    except Exception as e:
        return jsonify({"error"}), 500

@auth_bp.route('/follow/<string:following_id>', methods=['GET'])
@jwt_required()
def check_follow_status(following_id):
    user_id = get_jwt_identity()

    try:
        is_following = Followers.is_following(user_id, following_id)
        return jsonify({"is_following": is_following})
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@auth_bp.route('/fork', methods=['POST'])
@jwt_required()
def fork_project():
    data = request.get_json()
    user_id = get_jwt_identity()

    project_id = data.get('project_id')
    if not project_id:
        return jsonify({"error": "project_id not found"}), 400

    project = Project.get_project_full_data_without_user_id(project_id)
    if not project:
        return jsonify({"error": "Project not found"}), 404

    music = project.get('current_music_id')
    if not music:
        return jsonify({"error": "Projct doesnt have music to copy"}), 400

    layers = music.get('layers', [])

    new_project_id = Project.create_project(
        user_id,
        {
            'title': project.get('title', '') + ' (Fork)',
            'midi': project.get('midi', ''),
            'description': project.get('description', ''),
            'bpm': project.get('bpm', 120),
            'instrument': project.get('instrument', 'piano'),
            'volume': project.get('volume', -10),
            'tempo': project.get('tempo', None)
        }
    )
    
    Music.create_music(
        new_project_id,
        layers,
        user_id
    )

    return jsonify({
        'message': 'Fork created',
        'new_project_id': new_project_id
    }), 201

"""
Colocar tambem seguidores e em alta

Na verdade pode pegar uns usuarios parecidos e suas postagens

@auth_bp.route('/post/feed', methods=['GET'])
@jwt_required()
def posts_feed():
    user_id = get_jwt_identity()

    user = User.get_user(user_id)
    posts = Post.get_posts()
    post_list = list()
    for post in posts():
        if(cosine_similarity(user["genres"], post.genres)>0.8):
            post_list.append(post)
    
    return post, 200
"""