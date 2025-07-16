import React from "react";
import FollowButton from "./FollowButton";

export default function SimilarUsers({ users = [], following, userId }) {
  if (!users || users.length === 0) {
    return <p className="text-center text-gray-400 mt-4">Nenhum usuário similar encontrado.</p>;
  }

  return (
    <section className="max-w-xl mx-auto my-6 p-4 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold text-yellow-400 mb-4 text-center">
        Usuários similares para seguir
      </h2>
      <ul>
        {users.map((user) => (
          <li
            key={user._id}
            className="flex items-center justify-between bg-gray-700 hover:bg-gray-600 transition-colors rounded-md p-3 mb-3"
          >
            <div className="flex items-center">
              <img
                src={user.avatar || "/default-avatar.png"}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-yellow-400"
              />
              <span className="text-gray-100 font-medium">{user.username}</span>
            </div>
             <FollowButton followingId={user._id} userId={userId} following={following} />

          </li>
        ))}
      </ul>
    </section>
  );
}
