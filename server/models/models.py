# models/search.py
from .user import User
from .post import Post
from .project import Project


class Search:
    @staticmethod
    def perform_search(query, tags, search_type, current_user_id):
        """
        Executa a busca no banco de dados para diferentes coleções.
        """
        results = {
            'users': [],
            'posts': [],
            'projects': []
        }

        # Opção de busca case-insensitive com regex
        regex_query = {'$regex': query, '$options': 'i'}

        # Busca por Usuários
        if search_type in ['all', 'users']:
            user_search_criteria = {'username': regex_query}
            results['users'] = User.find_by_query(query, current_user_id)

        # Busca por Posts
        if search_type in ['all', 'posts']:
            post_search_criteria = {'caption': regex_query, 'is_comment': False}
            if tags:
                post_search_criteria['genres'] = {'$all': tags}
            # Reutiliza a busca de posts do feed, mas com o critério de busca
            results['posts'] = Post.search_posts(post_search_criteria)

        # Busca por Projetos
        if search_type in ['all', 'projects']:
            project_search_criteria = {
                '$or': [
                    {'title': regex_query},
                    {'description': regex_query}
                ]
            }
            # A busca por tags em projetos pode ser adicionada aqui se o modelo de projeto tiver um campo 'genres'
            results['projects'] = Project.search_projects(project_search_criteria)

        return results