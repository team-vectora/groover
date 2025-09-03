import os
import random
from pymongo import MongoClient
from werkzeug.security import generate_password_hash
from faker import Faker
from bson.objectid import ObjectId
from datetime import datetime
from db import mongo

# Importa a lista de gêneros do seu arquivo
from utils.genres import GENRES

# --- Configuração do Banco de Dados ---
# Substitua pela sua string de conexão do MongoDB, se necessário
db = mongo.db

# Instancia o Faker para gerar dados fictícios
fake = Faker('pt_BR')
fake_en = Faker()

# --- IDs específicos que devem ser usados ---
SPECIFIC_USER_IDS = [
    '6834520a4d137c707e9cda6d', '683fbea3ad4e573ae7ebe4cf', '683fcb3dad4e573ae7ebe4d8',
    '6840411fa3bb0692e47980d0', '6840ac31c974b47f6fd3284b', '6840acb1c974b47f6fd3284e',
    '6840b73ec974b47f6fd32854', '6840b7f7c974b47f6fd32857', '6840cc1b9202f765dec9a531',
    '6840ecaa60a72bde3e6082f9', '684e34522c588e81773740a6', '684ee515fcd96edc660f21b8',
    '684ee92afcd96edc660f21c1', '68529386276fba74b42152ff', '685988bcdb3afbf14e406071',
    '68598927db3afbf14e406078', '68697f9832fd64fd6ba6e45c', '6869dc875847b304ed64c47c',
    '6875079073eb240f89c47efd', '6875116cb81fdac95e5f6d34', '687691e544dfb760c0c84bb0',
    '6876df4d50f5a9575cd385aa', '68775a97a84e095d97268e54', '6877610894358e1967edfb11',
    '68780fe16956400ab9b03f43', '687824625471bf93f7a972e6', '68783d5d4265b940749dd571',
    '68b6f5b065a3cd77b98378eb', '68b6f5d165a3cd77b98378ec', '68b74cd1238f3499687b7e41'
]

POST_TEMPLATES = [
    "Acabei de descobrir a banda {artist}. O som deles é um {genre} incrível! O que acham? #recomendação",
    "Qual o melhor álbum de {genre} de todos os tempos? Pra mim é '{album}' do {artist}. Debate aberto!",
    "Ansioso para o show do {artist} semana que vem! Quem mais vai? Vai ser épico! #show #{genre}",
    "Tentando criar uma batida nova inspirada em {artist}. Alguém tem alguma dica de VST pra esse tipo de som? #produçãomusical",
    "O novo single '{song_title}' do {artist} não sai da minha cabeça. Produção impecável! 🔥",
    "Opinião polêmica: {genre} atingiu seu auge nos anos 90 e nunca mais foi o mesmo. Concordam ou discordam?",
    "Montando uma playlist de {genre} pra relaxar no fim de semana. Sugestões de músicas são bem-vindas! 🎶",
    "Esse riff de guitarra em '{song_title}' é simplesmente genial. {artist} é um mestre!",
    "A vibe desse som novo do {artist} é perfeita pra uma viagem de carro. Aumenta o som! 🚗💨",
    "Explorando umas paradas de {genre} hoje. Que cena rica e cheia de artistas talentosos!",
    "Relembrando o clássico '{album}' do {artist} hoje. Esse álbum não envelhece nunca! #TBT #Clássico",
    "A letra de '{song_title}' do {artist} é pura poesia. Que verso vocês mais gostam? ✍️",
    "O clipe de '{song_title}' que o {artist} acabou de lançar é uma obra de arte visual. Já viram? 🤯 #videoclipe",
    "Qual a música mais subestimada do {artist}? Pra mim é '{song_title}', merecia muito mais reconhecimento.",
    "Imagina um feat entre {artist} e {artist_suggestion}? Seria a colaboração do século no mundo do {genre}!",
    "A versão ao vivo de '{song_title}' é mil vezes melhor que a de estúdio. Que energia! #aovivo",
    "Quero começar a ouvir {artist}. Qual álbum vocês recomendam para um iniciante? #dica",
    "Finalmente comprei o vinil do '{album}'! A arte da capa é ainda mais bonita pessoalmente. #vinyl #merch",
    "O jeito que {artist} mistura {genre} com {outro_genero} é simplesmente surreal. O futuro da música é isso!",
    "Qual foi o primeiro show do {artist} que vocês foram? O meu foi inesquecível. #memórias #primeiroshow"
]

COMMENT_TEMPLATES = [
    "Nossa, nunca tinha ouvido falar! Vou procurar agora mesmo, valeu pela dica!",
    "Concordo 100%! Esse álbum é uma obra-prima do começo ao fim.",
    "Eu vou! Comprei meu ingresso assim que saiu. Vai ser histórico!",
    "Já tentou o Serum? É ótimo para baixos de {genre}.",
    "Sério? Eu não curti tanto essa nova fase dele, preferia o som antigo.",
    "Discordo totalmente! A cena atual de {genre} está cheia de inovação.",
    "Boa! Adiciona '{song_title}' do {artist} nessa playlist, não vai se arrepender.",
    "SIM! Esse riff é um dos melhores que já ouvi.",
    "Total! Já adicionei na minha playlist de estrada.",
    "Se curtiu esse, você precisa ouvir {artist_suggestion}. A pegada é bem parecida.",
    "Polêmico! Entendo seu ponto, mas pra mim '{album_suggestion}' ainda é o melhor deles.",
    "Infelizmente não vou poder ir, mas gravem muitos stories! Aproveitem por mim!",
    "Pra esse tipo de {genre}, experimenta usar um sidechain mais agressivo no baixo. Faz toda a diferença.",
    "Ainda estou processando essa música. A cada ouvida descubro uma camada nova. Genial!",
    "Essa letra é um soco no estômago, né? A caneta do {artist} é pesada.",
    "Boa descoberta! A discografia deles é incrível, você vai viciar.",
    "Começa pelo álbum '{album}', é o mais acessível. Depois vai para o '{album_suggestion}' pra entender a evolução.",
    "A linha de baixo dessa música também é sensacional. {artist} só tem músico bom na banda.",
    "Se está explorando {genre}, dá uma olhada no subgênero {subgenero}. Tem umas coisas bem experimentais rolando.",
    "Verdade! Essa música é um tesouro escondido na discografia dele."
]

usuarios_especificos_projetos = {
    '6834520a4d137c707e9cda6d': ['683462de1c13163dcd215550', '68346351a16eeca691d913b5', '683464e1e2a14b9b74e390d4',
                                 '683485dd64a44f8a594fa7e6', '683486b8a6ca18ed21baf4d3'],
    '683fbea3ad4e573ae7ebe4cf': ['683fbfb1ad4e573ae7ebe4d0'],
    '683fcb3dad4e573ae7ebe4d8': ['68409193b0261b0613a51eed', '6840919eb0261b0613a51eef', '6840924cb0261b0613a51ef1',
                                 '68409253b0261b0613a51ef3', '68409372b0261b0613a51ef5', '6840937ab0261b0613a51ef7',
                                 '684094ceb0261b0613a51efb', '68409587b0261b0613a51efe', '6840a372b0261b0613a51f04',
                                 '6840a731b0261b0613a51f06', '6840ab06b0261b0613a51f08', '684ee738fcd96edc660f21bd',
                                 '684ee791fcd96edc660f21bf', '685299caccdaae2942588caa', '6852c5b06eb7c50d1d0c81f8',
                                 '6869df9e5847b304ed64c480', '6869dfaf5847b304ed64c484'],
    '6840411fa3bb0692e47980d0': ['68409dbdb0261b0613a51f01'],
    '6840ac31c974b47f6fd3284b': ['6840ac45c974b47f6fd3284c'],
    '6840acb1c974b47f6fd3284e': ['6840acf8c974b47f6fd3284f'],
    '6840b73ec974b47f6fd32854': ['6840b74dc974b47f6fd32855'],
    '6840b7f7c974b47f6fd32857': ['6840b816c974b47f6fd32858'],
    '6840cc1b9202f765dec9a531': ['6840cd3c9202f765dec9a532', '6840d7ae4c1c790bb1b8b789', '6840dd1a60a72bde3e6082ee'],
    '6840ecaa60a72bde3e6082f9': ['6840ed4260a72bde3e6082fa'],
    '684e34522c588e81773740a6': ['684e34fe2c588e81773740a9', '684e34fe2c588e81773740aa'],
    '684ee515fcd96edc660f21b8': ['684ee521fcd96edc660f21b9', '684ee560fcd96edc660f21bb'],
    '684ee92afcd96edc660f21c1': ['684ee934fcd96edc660f21c2', '684ee9dcfcd96edc660f21c4'],
    '68529386276fba74b42152ff': ['6852aa80ccb9818fd375d328', '6852c69c7d7f6e5fd3c354f7', '6859624ce2c46bc7c9b0ed72',
                                 '68597f7409bf95a10c9054da', '685987901bc3e285462d7310', '685987f2db3afbf14e406069',
                                 '68598857db3afbf14e40606c', '68598869db3afbf14e40606e', '6859aabddb3afbf14e406087',
                                 '68697f7632fd64fd6ba6e456'],
    '685988bcdb3afbf14e406071': ['685988ccdb3afbf14e406074', '6859b6539d705bd820860f6b', '6859b79630a12d1f2fc5e746',
                                 '6859ca6130a12d1f2fc5e752', '6859ca6730a12d1f2fc5e754', '6859ca8a30a12d1f2fc5e756',
                                 '6859cabe30a12d1f2fc5e758', '6859cad930a12d1f2fc5e75a'],
    '68598927db3afbf14e406078': ['68598937db3afbf14e40607b', '68598938db3afbf14e40607d', '6859893bdb3afbf14e40607f',
                                 '6859bf0630a12d1f2fc5e74a', '6859bf1030a12d1f2fc5e74c'],
    '68697f9832fd64fd6ba6e45c': ['68697fb532fd64fd6ba6e461', '6869921145580eec0036c7ee', '686998cf45580eec0036c7f8',
                                 '6872a9e954899a325e63d298', '6872aa5e115a7e078fd15807', '6872ae753daab5f77539a8f7',
                                 '6872af5d415ff508fe83c9d2', '6872b0860dbafe7330ce5135', '6873c1653fbd48868970cffb',
                                 '6873c16f3fbd48868970cffd', '6873c9ab63affd6aee45df02', '6873d25f9d3ec38dd14fa035',
                                 '6873d27a9d3ec38dd14fa037', '6873d4bd99e4439daaaa8ca7', '6873d4c199e4439daaaa8ca9',
                                 '6875ce5c01bab13254cb69ad', '6875cf3201bab13254cb69af', '6875d06701bab13254cb69b1',
                                 '6875d22ee7b73741ef1963fa', '6876f74f84793977554583c0', '6876f75684793977554583c2',
                                 '68773c351b1445ea7bdccb21', '687740061b1445ea7bdccb23', '687740231b1445ea7bdccb25',
                                 '68774bc9d9b548f1e5c100a6', '68774cbbd9b548f1e5c100a8', '68774d69d9b548f1e5c100aa',
                                 '68774f1e1265fae171f45d94', '6877502d8d6751791601c92a', '687752df9657caee250e8175',
                                 '6877531e9657caee250e8177', '687753269657caee250e8179', '687753349657caee250e817b',
                                 '687753949657caee250e817e', '687754639657caee250e8180', '687754d459b0175f84e8e0ae',
                                 '6877561aee7da6325d4f0a9f', '68775642ee7da6325d4f0aa1', '68775957ee7da6325d4f0aa3',
                                 '68775cf294358e1967edfb05', '68775cf594358e1967edfb07', '68775cf794358e1967edfb09',
                                 '68775cfa94358e1967edfb0b', '68775d3f94358e1967edfb0d'],
    '6869dc875847b304ed64c47c': ['6869e00d5847b304ed64c48a', '6869e0425847b304ed64c48c'],
    '6875079073eb240f89c47efd': ['68750faccfa3ec0eca429149', '68765d5b584a11f7ae9e0b80', '68765da8584a11f7ae9e0b82',
                                 '68765db5584a11f7ae9e0b84', '68765e24584a11f7ae9e0b86', '68765f82584a11f7ae9e0b88',
                                 '68765fc9584a11f7ae9e0b8a', '68765fdc584a11f7ae9e0b8c', '687705c0258a027d7318c199',
                                 '687727b6c84fce390fb7bb7f', '68773662e8f8cd7df359f79d', '687768a45a3f522b80de16ec',
                                 '6878006561905d43e043b1d4', '68b06ae12522d4e193073c0f', '68b06bc62522d4e193073c11',
                                 '68b1be613d0989a9859b021c', '68b1bfcf342717b26eadab4a', '68b592c941a6b2c6652feb4d',
                                 '68b5b913a469917676e80f04', '68b5b99ea469917676e80f06'],
    '6875116cb81fdac95e5f6d34': ['68751186b81fdac95e5f6d4b', '68751a5614cb6a3723245bd1'],
    '687691e544dfb760c0c84bb0': ['6876932344dfb760c0c84bb2', '687800ef61905d43e043b1d9', '687800f061905d43e043b1db',
                                 '6878072361905d43e043b1dd', '6878098261905d43e043b1df'],
    '6876df4d50f5a9575cd385aa': ['6876e25fa757395ee08ee7a7', '6876e413a757395ee08ee7a9', '6876f78984793977554583c4',
                                 '6876f85b84793977554583c7'],
    '68775a97a84e095d97268e54': ['68775aafa84e095d97268e55'],
    '6877610894358e1967edfb11': ['6877b4dfb8b7c457a5883fa0', '6877f08ca2a57e72e7c8a12f'],
    '68780fe16956400ab9b03f43': ['687810c16956400ab9b03f45'],
    '687824625471bf93f7a972e6': ['687824ec5471bf93f7a972e7'],
    '68783d5d4265b940749dd571': ['68783de84265b940749dd573'],
    '68b6f5b065a3cd77b98378eb': ['68b6fd2065a3cd77b98378f7', '68b6fe57cc7cd96e6afb4374', '68b6ff56d4982608ebd719f5'],
    '68b6f5d165a3cd77b98378ec': ['68b6faa665a3cd77b98378f2', '68b7214ece3a90cdaa3a09a9', '68b721eace3a90cdaa3a09b1'],
    '68b74cd1238f3499687b7e41': ['68b74ebb238f3499687b7e44']
}


def create_user(username, password_hash, email=None, specific_id=None):
    """Cria um usuário no banco de dados com gostos musicais definidos."""
    favorite_genres = random.sample(GENRES, k=random.randint(2, 5))
    genres_dict = {genre: (random.randint(50, 150) if genre in favorite_genres else random.randint(0, 20)) for genre in
                   GENRES}

    user_data = {
        'username': username,
        'avatar': f'https://picsum.photos/200/200?random={random.randint(1, 1000)}',
        'bio': f"Apaixonado por {', '.join(favorite_genres)}.",
        'password': password_hash,
        'email': email,
        'created_at': datetime.now(),
        'active': True,
        'genres': genres_dict
    }

    if specific_id:
        user_data['_id'] = ObjectId(specific_id)

    return db.users.insert_one(user_data).inserted_id


def create_post(user_id, caption, genres):
    """Cria um post no banco de dados."""
    post_data = {
        'user_id': user_id,
        'project_id': None,
        'parent_post_id': None,
        'photos': [f'https://picsum.photos/800/600?random={random.randint(1, 1000)}' for _ in
                   range(random.randint(0, 1))],
        'caption': caption,
        'created_at': datetime.now(),
        'likes': [],
        'comments': [],
        'comment_count': 0,
        'is_comment': False,
        'genres': genres
    }

    user_id_str = str(user_id)
    if (user_id_str in usuarios_especificos_projetos and
            random.random() < 0.3 and
            usuarios_especificos_projetos[user_id_str]):
        project_id = random.choice(usuarios_especificos_projetos[user_id_str])
        post_data['project_id'] = ObjectId(project_id)
        print(f"    ✅ Project ID {project_id} adicionado ao post do usuário {user_id_str}")

    return db.posts.insert_one(post_data).inserted_id


def create_comment(parent_post_id, user_id, content):
    comment_data = {
        'user_id': ObjectId(user_id),
        'parent_post_id': ObjectId(parent_post_id),
        'caption': content,
        'is_comment': True,
        'created_at': datetime.now(),
        'likes': [], 'photos': [], 'comments': [], 'comment_count': 0, 'genres': []
    }
    comment_id = db.posts.insert_one(comment_data).inserted_id
    db.posts.update_one({'_id': ObjectId(parent_post_id)}, {'$inc': {'comment_count': 1}})
    return comment_id


def like_post(post_id, user_id):
    post = db.posts.find_one({'_id': post_id})
    if not post or user_id in post.get('likes', []):
        return

    db.posts.update_one({'_id': post_id}, {'$push': {'likes': user_id}})

    post_genres = post.get('genres', [])
    if post_genres:
        update_query = {'$inc': {}}
        for genre in post_genres:
            if genre in GENRES:
                update_query['$inc'][f'genres.{genre}'] = 5
        db.users.update_one({'_id': user_id}, update_query)


def main():
    print("Iniciando o script para popular o banco de dados...")
    db.users.delete_many({})
    db.posts.delete_many({})
    print("Coleções 'users' e 'posts' limpas.")

    num_users = 50
    posts_per_user = 10
    users_data = []
    post_ids = []

    print(f"Criando {len(SPECIFIC_USER_IDS)} usuários com IDs específicos...")
    for i, specific_id in enumerate(SPECIFIC_USER_IDS):
        username = fake.user_name()
        email = fake.email()
        password = 'password123'
        hashed_password = generate_password_hash(password)

        if db.users.find_one({'_id': ObjectId(specific_id)}):
            print(f"  Usuário com ID {specific_id} já existe, pulando...")
            user_doc = db.users.find_one({'_id': ObjectId(specific_id)})
            users_data.append({
                '_id': ObjectId(specific_id), 'username': user_doc['username'],
                'favorite_genres': [g for g, s in user_doc.get('genres', {}).items() if s > 20]
            })
            continue

        user_id = create_user(username, hashed_password, email, specific_id)
        user_doc = db.users.find_one({'_id': user_id})
        users_data.append({
            '_id': user_id, 'username': username,
            'favorite_genres': [g for g, s in user_doc.get('genres', {}).items() if s > 20]
        })
        print(f"  ({i + 1}/{len(SPECIFIC_USER_IDS)}) Usuário criado com ID específico: {username} ({specific_id})")

    remaining_users = num_users - len(SPECIFIC_USER_IDS)
    print(f"\nCriando {remaining_users} usuários adicionais...")
    for i in range(remaining_users):
        username = fake.user_name()
        email = fake.email()
        password = 'password123'
        hashed_password = generate_password_hash(password)

        if db.users.find_one({'username': username}) or db.users.find_one({'email': email}):
            continue

        user_id = create_user(username, hashed_password, email)
        user_doc = db.users.find_one({'_id': user_id})
        users_data.append({
            '_id': user_id, 'username': username,
            'favorite_genres': [g for g, s in user_doc.get('genres', {}).items() if s > 20]
        })
        print(f"  ({i + 1}/{remaining_users}) Usuário adicional criado: {username}")

    print(f"\nCriando {posts_per_user} posts para cada usuário...")
    for i, user in enumerate(users_data):
        print(f"  Posts para o usuário {user['username']} ({user['_id']}):")
        for j in range(posts_per_user):
            template = random.choice(POST_TEMPLATES)
            genre = random.choice(user['favorite_genres'])

            caption = template.format(
                artist=fake_en.name(), genre=genre, album=fake.catch_phrase(),
                song_title=fake.bs().title(), artist_suggestion=fake_en.name(),
                outro_genero=random.choice([g for g in GENRES if g != genre])
            )

            post_id = create_post(user['_id'], caption, [genre])
            post_ids.append(post_id)
            print(f"    - Post {j + 1}/{posts_per_user} criado.")

    print("\nAdicionando comentários aos posts...")
    comment_count = 0
    for i, post_id in enumerate(post_ids):
        if (i + 1) % 4 == 0:
            post_doc = db.posts.find_one({'_id': post_id})
            post_author_id = post_doc['user_id']
            post_genre = post_doc['genres'][0] if post_doc['genres'] else 'música'

            possible_commenters = [u for u in users_data if
                                   u['_id'] != post_author_id and post_genre in u['favorite_genres']]
            if len(possible_commenters) < 2:
                possible_commenters = [u for u in users_data if u['_id'] != post_author_id]

            commenters = random.sample(possible_commenters, k=min(2, len(possible_commenters)))

            for commenter in commenters:
                template = random.choice(COMMENT_TEMPLATES)
                comment_content = template.format(
                    genre=post_genre, song_title=fake.bs().title(), artist=fake_en.name(),
                    artist_suggestion=fake_en.name(), album=fake.catch_phrase(), album_suggestion=fake.catch_phrase(),
                    subgenero=fake.word()
                )
                create_comment(post_id, commenter['_id'], comment_content)
                comment_count += 1

            print(f"  - 2 comentários adicionados ao post {str(post_id)[-6:]}...")

    print(f"\nTotal de {comment_count} comentários criados.")

    print("\nAdicionando likes aos posts...")
    total_likes = 0
    for i, post_id in enumerate(post_ids):
        num_likes = random.randint(0, 15)
        liker_ids = random.sample([u['_id'] for u in users_data], k=min(num_likes, len(users_data)))

        for user_id in liker_ids:
            like_post(post_id, user_id)
            total_likes += 1

        if num_likes > 0:
            print(f"  - {len(liker_ids)} likes adicionados ao post {str(post_id)[-6:]}...")

    print(f"\nTotal de {total_likes} likes distribuídos.")
    print("\nScript concluído! O banco de dados foi populado com sucesso.")
    print(f"Foram criados {len(users_data)} usuários no total, incluindo {len(SPECIFIC_USER_IDS)} com IDs específicos.")


if __name__ == "__main__":
    main()