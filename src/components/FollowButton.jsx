import { useEffect, useState } from "react";

const FollowButton = ({ followingId, userId }) => {
  const [isFollowing, setIsFollowing] = useState(false);

  const handleClick = async () => {
    try {
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
      console.log(data);

      if (response.ok) {
        alert('Agora você está seguindo!');
        setIsFollowing(true);
      } else {
        alert(data.error || 'Erro ao seguir');
      }
    } catch (error) {
      console.error('Erro:', error);
      alert('Erro ao conectar com a API');
    }
  };

  return userId == followingId ? null : (
    <button onClick={handleClick} className="follow_button">
      {isFollowing ? 'Seguindo' : 'Seguir'}
    </button>
  );
};

export default FollowButton;
