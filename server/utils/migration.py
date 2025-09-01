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


# --- EXECUÇÃO DO SCRIPT ---
if __name__ == "__main__":
    print("Iniciando script de migração...")

    # ✅ 2. A conexão agora é muito mais simples!
    #    Lembre-se que sua classe Music usa 'musics' (plural).
    music_collection = mongo.db.musics

    # O resto do script permanece o mesmo
    query_for_old_structure = {"layers.0.0.0": {"$type": "object"}}

    documents_to_migrate = list(music_collection.find(query_for_old_structure))
    total_docs = len(documents_to_migrate)

    if total_docs == 0:
        print("Nenhum documento com a estrutura antiga encontrado. Nenhuma migração necessária.")
        exit()

    print(f"Encontrados {total_docs} documentos com a estrutura antiga para migrar.")

    migrated_count = 0
    for doc in documents_to_migrate:
        doc_id = doc['_id']
        print(f"Processando documento ID: {doc_id}...")

        old_layers = doc.get('layers', [])
        new_layers = transform_old_layers_to_new(old_layers)

        result = music_collection.update_one(
            {"_id": doc_id},
            {"$set": {"layers": new_layers}}
        )

        if result.modified_count > 0:
            print(f"  -> Documento {doc_id} migrado com sucesso.")
            migrated_count += 1
        else:
            print(f"  -> AVISO: Documento {doc_id} não foi modificado.")

    print("\n--- Migração Concluída ---")
    print(f"Total de documentos encontrados: {total_docs}")
    print(f"Total de documentos migrados: {migrated_count}")