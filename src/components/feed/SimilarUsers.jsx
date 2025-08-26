import React, { useState, useEffect } from "react";
import FollowButton from "./FollowButton";
import Link from "next/link";
import Image from "next/image";

export default function SimilarUsers({ users = [], userId }) {
    const [page, setPage] = useState(0);
    const [followingStates, setFollowingStates] = useState({});
    const pageSize = 3;

    // Inicializar estados de follow
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const following = JSON.parse(localStorage.getItem("following") || "[]");
            const initialFollowingStates = {};

            users.forEach(user => {
                initialFollowingStates[user._id] = following.includes(user._id);
            });

            setFollowingStates(initialFollowingStates);
        }
    }, [users]);

    // Escutar eventos de atualização de follow
    useEffect(() => {
        const handleFollowingUpdate = (event) => {
            setFollowingStates(prev => ({
                ...prev,
                [event.detail.userId]: event.detail.isFollowing
            }));
        };

        window.addEventListener('followingUpdated', handleFollowingUpdate);

        return () => {
            window.removeEventListener('followingUpdated', handleFollowingUpdate);
        };
    }, []);

    if (!users || users.length === 0) {
        return <p className="text-center py-4">Carregando sugestões...</p>;
    }

    const startIndex = page * pageSize;
    const visibleUsers = users.slice(startIndex, startIndex + pageSize);

    const handleMoreClick = () => {
        const nextPage = page + 1;
        setPage(nextPage >= Math.ceil(users.length / pageSize) ? 0 : nextPage);
    };

    return (
        <section className="bg-[#121113] rounded-lg p-4 border-2 border-[#4c4e30] sticky top-24">
            <h2 className="text-2xl font-semibold text-[#c1915d] mb-4 text-center">
                Sugestões para você
            </h2>

            <ul className="space-y-3">
                {visibleUsers.map((user) => (
                    <li
                        key={user._id}
                        className="flex items-center justify-between bg-[#070608] hover:bg-[#0a090d] transition-colors rounded-md p-3"
                    >
                        <div className="flex items-center">
                            <Image
                                src={user.avatar || "/default-avatar.png"}
                                alt={user.username}
                                width={48}
                                height={48}
                                className="rounded-full object-cover border-2 border-[#4c4e30]"
                            />
                            <div className="ml-3">
                                <Link href={`/profile/${user?.username}`} className="text-[#e6e8e3] hover:underline">
                                    <h3 className="text-lg font-medium">{user.username}</h3>
                                </Link>
                                <p className="text-[#e6e8e3] text-sm line-clamp-2 max-w-[100px]">
                                    {user.bio || "Sem biografia"}
                                </p>
                                <p className="text-[#a97f52] text-sm">
                                    {(user.similarity * 100).toFixed(0)}% de match
                                </p>
                            </div>
                        </div>
                        <FollowButton
                            followingId={user._id}
                            userId={userId}
                            isFollowing={followingStates[user._id]}
                            setIsFollowing={(value) => setFollowingStates(prev => ({
                                ...prev,
                                [user._id]: value
                            }))}
                        />
                    </li>
                ))}
            </ul>

            {users.length > pageSize && (
                <button
                    onClick={handleMoreClick}
                    className="w-full mt-3 py-2 bg-[#4c4e30] rounded-md text-[#c1915d] hover:bg-[#61673e] transition-colors"
                >
                    Ver mais
                </button>
            )}
        </section>
    );
}