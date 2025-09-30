// src/components/search/UserSearchResult.jsx
import Link from 'next/link';
import Image from 'next/image';
import { FollowButton } from '../../components';
import { useAuth } from '../../hooks';
import { useState, useEffect } from 'react';

export default function UserSearchResult({ user }) {
    const { userId } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const followingList = JSON.parse(localStorage.getItem("following") || "[]");
            setIsFollowing(followingList.includes(user.id));
        }
    }, [user.id]);

    return (
        <div className="flex items-center justify-between p-3 bg-bg-secondary rounded-lg hover:bg-primary/20 transition-colors">
            <Link href={`/profile/${user.username}`} className="flex items-center gap-4">
                <Image src={user.avatar || '/img/default_avatar.png'} alt={user.username} width={50} height={50} className="rounded-full" />
                <div>
                    <p className="font-bold text-foreground">{user.username}</p>
                    <p className="text-sm text-text-lighter dark:text-text-lighter">{user.bio}</p>
                </div>
            </Link>
            {userId !== user.id && (
                <FollowButton
                    followingId={user.id}
                    userId={userId}
                    isFollowing={isFollowing}
                    setIsFollowing={setIsFollowing}
                />
            )}
        </div>
    );
}