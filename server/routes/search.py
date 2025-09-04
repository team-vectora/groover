# routes/search.py
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models.search import Search

search_bp = Blueprint('search', __name__)

@search_bp.route('', methods=['GET'])
@jwt_required()
def perform_search():
    """
    Endpoint de busca geral.
    Query Params:
        q: O termo de busca principal (string).
        tags: Gêneros para filtrar, separados por vírgula (string).
        type: O tipo de conteúdo a ser buscado ('posts', 'users', 'projects').
    """
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({"error": "Usuário não autenticado"}), 401

    query = request.args.get('q', default="", type=str)
    tags_str = request.args.get('tags', default="", type=str)
    search_type = request.args.get('type', default="all", type=str)

    # Converte a string de tags em uma lista
    tags = [tag.strip() for tag in tags_str.split(',') if tag.strip()]

    # Validação mínima
    if not query and not tags:
        return jsonify({"error": "Pelo menos um termo de busca ou tag é necessário"}), 400

    results = Search.perform_search(query, tags, search_type, user_id)

    return jsonify(results), 200