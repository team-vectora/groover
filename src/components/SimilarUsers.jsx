import React, { useState } from "react";
import FollowButton from "./FollowButton";
import Link from "next/link";

export default function SimilarUsers({ users = [], following, userId }) {
  const [page, setPage] = useState(0);
  const pageSize = 3;

  if (!users || users.length === 0) {
    return (
      <p className="text-center text-[#61673e] mt-4">
        Nenhum usuário similar encontrado.
      </p>
    );
  }

  // Calcula o índice inicial para o slice
  const startIndex = page * pageSize;
  // Pega o slice dos usuários a mostrar (3 por vez)
  const visibleUsers = users.slice(startIndex, startIndex + pageSize);

  const handleMoreClick = () => {
    const nextPage = page + 1;
    const maxPage = Math.floor(users.length / pageSize);
    if (nextPage >= maxPage) {
      setPage(0);
    } else {
      setPage(nextPage);
    }
  };

  return (
<section
  className="max-w-xl mx-auto my-6 p-4 bg-[#121113] rounded-lg shadow-md border-2 border-[#4c4e30] similar-users-sticky"
>
      <h2 className="text-2xl font-semibold text-[#c1915d] mb-4 text-center">
        Sugestões para você
      </h2>
      <ul>
        {visibleUsers.map((user) => (
          <li
            key={user._id}
            className="flex items-center justify-between bg-[#070608] hover:bg-[#0a090d] transition-colors rounded-md p-3 mb-3"
          >
            <div className="flex items-center">
              <img
                src={user.avatar || "/default-avatar.png"}
                alt={user.username}
                className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-[#4c4e30]"
              />
              <div className="flex flex-col">
                <Link href={`/profile/${user?.username}`}>
                  <h3 className="text-[#e6e8e3] text-xl">{user.username}</h3>
                </Link>
                  <p
                    className="text-[#e6e8e3] font-medium"
                    style={{
                      wordBreak: "break-word",
                      whiteSpace: "normal",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {user.bio}
                  </p>
                <p className="text-[#e6e8e3] text-l">{(user.similarity * 100).toFixed(0)}% de match</p>
              </div>
            </div>
            <FollowButton
              followingId={user._id}
              userId={userId}
              following={following}
            />
          </li>
        ))}
      </ul>
      {users.length > pageSize && (
        <div className="text-center">
          <button
            onClick={handleMoreClick}
            className="mt-2 px-4 py-2 bg-[#4c4e30] rounded-md text-[#c1915d] hover:bg-[#6a6c46] transition-colors"
          >
            Mais
          </button>
        </div>
      )}
    </section>
  );
}
