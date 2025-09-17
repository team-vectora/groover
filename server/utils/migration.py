# migration_script.py
from bson.objectid import ObjectId

# ✅ 1. Importe sua instância 'mongo' já configurada
#    (Ajuste o caminho se o seu arquivo não estiver em 'utils/db.py')
from utils.db import mongo


# --- LÓGICA DE TRANSFORMAÇÃO ---
# (Esta função permanece exatamente a mesma, com a correção do 'None')
def transform_old_layers_to_new(old_layers):
    """
    Converte a estrutura de layers antiga (com objetos de nota) para a nova (com arrays de nota).
    Também aplica a lógica de compactação que desenvolvemos.
    """
    if not isinstance(old_layers, list):
        return old_layers

    new_layers = []
    for page in old_layers:
        new_page = []
        for column in page:
            new_column = []
            for old_note_obj in column:
                if isinstance(old_note_obj, dict) and 'subNotes' in old_note_obj:
                    sub_notes_array = old_note_obj.get('subNotes', [])

                    compacted_sub_notes = []
                    for sub_note in sub_notes_array:
                        if sub_note and sub_note.get('name'):
                            compacted_sub_notes.append({
                                'name': sub_note['name'],
                                'isSeparated': sub_note.get('isSeparated', False)
                            })
                        else:
                            compacted_sub_notes.append(None)  # Corrigido para None

                    if all(sn is None for sn in compacted_sub_notes):
                        new_column.append(None)
                    else:
                        new_column.append(compacted_sub_notes)
                else:
                    new_column.append(old_note_obj)

            new_page.append(new_column)
        new_layers.append(new_page)
    return new_layers


def update_all_users_active_field():
    """
    Atualiza o campo 'active' para True em todos os documentos da coleção 'users'
    """
    # Acessa a coleção 'users'
    users_collection = mongo.db.users

    # Atualiza todos os documentos definindo 'active' como True
    result = users_collection.update_many(
        {},  # Filtro vazio = todos os documentos
        {"$set": {"active": True}}
    )

    print(f"Documentos modificados: {result.modified_count}")
    print(f"Documentos correspondentes: {result.matched_count}")


# --- EXECUÇÃO DO SCRIPT ---
if __name__ == "__main__":
    print("Iniciando script de migração...")

    update_all_users_active_field()
