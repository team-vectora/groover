import { useEffect, useState } from "react";

const FollowButton = ({ followingId, userId, following }) => {
  const [isFollowing, setIsFollowing] = useState(() =>
    Array.isArray(following) ? following.includes(followingId) : false
  );
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('https://groover-api.onrender.com/api/follow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ following_id: followingId }),
      });

      const data = await response.json();
      console.log(data);

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

      alert(newIsFollowing ? 'Agora você está seguindo!' : 'Você deixou de seguir!');
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
    <button onClick={handleClick} className="follow_button">
      {isFollowing ? 'Seguindo' : loading ? 'Carregando...' : 'Seguir'}
    </button>
  );
};

export default FollowButton;
