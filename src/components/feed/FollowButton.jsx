import { useState } from "react";

const FollowButton = ({ followingId, userId, following }) => {
  const [isFollowing, setIsFollowing] = useState(() =>
      Array.isArray(following) ? following.includes(followingId) : false
  );
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('http://localhost:5000/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ following_id: followingId }),
      });

      const data = await response.json();

      if (response.ok) {
        const newIsFollowing = !isFollowing;
        setIsFollowing(newIsFollowing);

        let updatedFollowing = Array.isArray(following) ? [...following] : [];

        if (newIsFollowing) {
          if (!updatedFollowing.includes(followingId)) {
            updatedFollowing.push(followingId);
          }
        } else {
          updatedFollowing = updatedFollowing.filter(id => id !== followingId);
        }

        localStorage.setItem('following', JSON.stringify(updatedFollowing));
      } else {
        alert(data.error || 'Erro ao seguir/deixar de seguir');
      }

    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com a API');
    } finally {
      setLoading(false);
    }
  };

  return userId == followingId ? null : (
      <button
          onClick={handleClick}
          disabled={loading}
          className={`
        px-4 py-2 rounded-full text-sm font-medium transition-colors
        ${isFollowing
              ? 'bg-[#4c4e30] text-[#e6e8e3] border border-[#4c4e30] hover:bg-[#61673e]'
              : 'bg-transparent text-[#e6e8e3] border border-[#a97f52] hover:bg-[#a97f52]'}
        ${loading ? 'opacity-70 cursor-not-allowed' : ''}
      `}
      >
        {loading ? 'Carregando...' : isFollowing ? 'Seguindo' : 'Seguir'}
      </button>
  );
};

export default FollowButton;