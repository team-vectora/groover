# migration_script.py
from datetime import datetime
from utils.db import mongo
from bson.objectid import ObjectId
import uuid
import json


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


def migrate_music_documents_to_patterns():
    """
    Script para migrar documentos da coleção 'musics' do formato antigo
    de 'layers' para o novo formato de 'channels', 'patterns' e 'songStructure'.
    """
    print("Iniciando o script de migração...")

    db = mongo.db
    music_collection = db.musics
    projects_collection = db.projects

    # Encontra todos os documentos que ainda usam a estrutura antiga de 'layers'
    musics_to_migrate = list(music_collection.find({
        "layers": {"$exists": True},
        "channels": {"$exists": False}
    }))

    if not musics_to_migrate:
        print("Nenhuma música com a estrutura antiga encontrada para migrar. Tudo certo!")
        return

    print(f"Encontrado(s) {len(musics_to_migrate)} documento(s) de música para migrar.")
    migrated_count = 0

    for music in musics_to_migrate:
        music_id = music['_id']
        project_id = music.get('project_id')
        print(f"\nProcessando música com ID: {music_id} (Projeto: {project_id})")

        if not project_id:
            print(f"  -> Aviso: Música {music_id} não tem um 'project_id' associado. Pulando.")
            continue

        # 1. Encontrar o instrumento no projeto original
        project = projects_collection.find_one({'_id': ObjectId(project_id)})
        if not project:
            print(f"  -> Aviso: Projeto {project_id} não encontrado para a música {music_id}. Pulando.")
            continue

        original_instrument = project.get('instrument', 'piano')  # Usa 'piano' como padrão

        # 2. Preparar a nova estrutura
        new_channels = [{
            'id': str(uuid.uuid4()),
            'instrument': original_instrument
        }]
        new_patterns = {}
        new_song_structure = [[]]  # Apenas um canal

        # Mapeamento de conteúdo de compasso para ID de padrão para reutilização
        bar_content_to_pattern_id = {}

        # 3. Concatenar todas as colunas de todas as páginas
        all_columns = []
        old_layers = music.get('layers', [])
        for page in old_layers:
            if isinstance(page, list):
                all_columns.extend(page)

        # 4. Processar colunas em blocos de 4 (formando um compasso)
        for i in range(0, len(all_columns), 4):
            bar_columns = all_columns[i:i + 4]

            # Converte o conteúdo do compasso em uma string JSON para servir como chave única
            # Isso nos permite detectar compassos idênticos e reutilizar padrões
            bar_key = json.dumps(bar_columns)

            if bar_key in bar_content_to_pattern_id:
                # Reutiliza um padrão existente
                pattern_id = bar_content_to_pattern_id[bar_key]
                new_song_structure[0].append(pattern_id)
                print(f"  -> Reutilizando padrão '{pattern_id}' para o compasso {len(new_song_structure[0])}")
            else:
                # Cria um novo padrão
                new_pattern_id = f"migrated-p-{str(uuid.uuid4())[:8]}"
                new_pattern_notes = []

                is_bar_empty = True

                for col_in_bar_idx, column in enumerate(bar_columns):
                    if not isinstance(column, list): continue

                    # A sub-divisão de ritmo era definida por `rhythm` no front-end antigo
                    # Assumimos um valor comum de 4 subdivisões (colcheias) por tempo
                    subdivisions_per_col = 4

                    for pitch_idx, note_array in enumerate(column):
                        if not isinstance(note_array, list): continue

                        subdivisions_per_col = len(note_array)  # Usa o tamanho real se disponível
                        ticks_per_subdivision = 32 / (4 * subdivisions_per_col)

                        for sub_note_idx, sub_note in enumerate(note_array):
                            if sub_note and sub_note.get('name'):
                                is_bar_empty = False
                                start_tick = (col_in_bar_idx * 8) + (sub_note_idx * (8 / subdivisions_per_col))
                                end_tick = start_tick + (8 / subdivisions_per_col)

                                new_pattern_notes.append({
                                    'id': str(uuid.uuid4()),
                                    'pitch': pitch_idx,
                                    'start': round(start_tick),
                                    'end': round(end_tick)
                                })

                if is_bar_empty:
                    new_song_structure[0].append(None)
                    print(f"  -> Compasso {len(new_song_structure[0])} está vazio.")
                else:
                    new_patterns[new_pattern_id] = {'id': new_pattern_id, 'notes': new_pattern_notes}
                    bar_content_to_pattern_id[bar_key] = new_pattern_id
                    new_song_structure[0].append(new_pattern_id)
                    print(f"  -> Novo padrão '{new_pattern_id}' criado para o compasso {len(new_song_structure[0])}")

        # 5. Atualizar o documento no MongoDB
        update_result = music_collection.update_one(
            {'_id': music_id},
            {
                '$set': {
                    'channels': new_channels,
                    'patterns': new_patterns,
                    'songStructure': new_song_structure
                },
                '$unset': {
                    'layers': ""
                }
            }
        )

        if update_result.modified_count > 0:
            print(f"  -> SUCESSO: Música {music_id} migrada com sucesso.")
            migrated_count += 1
        else:
            print(f"  -> ERRO: Falha ao atualizar a música {music_id} no banco de dados.")

    print(f"\nMigração concluída. {migrated_count} de {len(musics_to_migrate)} documentos foram migrados.")


def backup_collections():
    """
    Faz backup das collections 'musics' e 'projects' criando cópias com timestamp
    """
    db = mongo.db
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Backup da collection musics
    music_backup_name = f"musics_backup_{timestamp}"
    music_documents = list(db.musics.find({}))
    if music_documents:
        db[music_backup_name].insert_many(music_documents)
        print(f"Backup de 'musics' criado: {music_backup_name} ({len(music_documents)} documentos)")

    # Backup da collection projects
    projects_backup_name = f"projects_backup_{timestamp}"
    projects_documents = list(db.projects.find({}))
    if projects_documents:
        db[projects_backup_name].insert_many(projects_documents)
        print(f"Backup de 'projects' criado: {projects_backup_name} ({len(projects_documents)} documentos)")

    return music_backup_name, projects_backup_name


# --- EXECUÇÃO DO SCRIPT ---
if __name__ == "__main__":
    print("Iniciando script de migração...")

    migrate_music_documents_to_patterns()
