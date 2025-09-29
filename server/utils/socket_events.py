from flask_socketio import join_room, request
from flask_jwt_extended import decode_token
from app.socket import socketio

@socketio.on("connect")
def handle_connect():
    # --- CORREÇÃO APLICADA AQUI ---
    # Alterado de "access_token_cookie" para "access_token" para corresponder
    # ao cookie que é realmente definido no momento do login.
    token = request.cookies.get("access_token")
    # --- FIM DA CORREÇÃO ---

    if not token:
        print("Socket connection failed: No access token found in cookies.")
        return False  # desconecta se não tiver token
    try:
        decoded = decode_token(token)
        user_id = decoded["sub"]
        # Cada usuário entra na sala com o seu próprio ID
        join_room(f"user_{user_id}")
        print(f"User {user_id} successfully joined room user_{user_id}")
    except Exception as e:
        print(f"Error authenticating socket: {e}")
        return False
