from db import mongo

# Buscar apenas o campo user_id de todos os projetos
projetos = list(mongo.db.projects.find(
    {},
    {"user_id": 1, "_id": 1}  # _id é o project_id
))

# Exibir os IDs dos donos
for projeto in projetos:
    print(projeto)