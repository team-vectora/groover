from flask_socketio import join_room, request
from flask_jwt_extended import decode_token
from app.socket import socketio

@socketio.on("connect")
def handle_connect():
    token = request.cookies.get("access_token_cookie")
    if not token:
        return False  # desconecta se não tiver token
    try:
        decoded = decode_token(token)
        user_id = decoded["sub"]
        # Cada usuário entra na sala com o seu próprio ID
        join_room(f"user_{user_id}")
        print(f"Usuário {user_id} entrou na sala user_{user_id}")
    except Exception as e:
        print("Erro ao autenticar socket:", e)
        return False
