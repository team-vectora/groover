import {useState , useEffect , useCallback} from 'react';

export default function useProfile(username, token) {
    const [profileData, setProfileData] = useState({
        user: null,
        posts: [],
        projects: [],
        invites: [],
        loading: true,
        error: null
    });

    const fetchData = useCallback(async () => {
        if (!username || !token) return;

        try {
            // Fetch user data
            const userRes = await fetch(`http://localhost:5000/api/users/${username}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!userRes.ok) throw new Error('Erro ao buscar usuário');
            const userData = await userRes.json();

            // Fetch posts
            const postsRes = await fetch(`http://localhost:5000/api/posts/username/${username}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const postsData = await postsRes.json();

            // Fetch projects
            const projectsRes = await fetch(`http://localhost:5000/api/projects/user/${username}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const projectsData = await projectsRes.json();

            // Fetch invites (only for current user)
            let invitesData = [];
            if (localStorage.getItem('username') === username) {
                const invitesRes = await fetch(`http://localhost:5000/api/invitations`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                invitesData = await invitesRes.json();
            }

            setProfileData({
                user: userData,
                posts: postsData,
                projects: projectsData,
                invites: invitesData,
                loading: false,
                error: null
            });
        } catch (error) {
            setProfileData(prev => ({
                ...prev,
                loading: false,
                error: error.message
            }));
        }
    }, [username, token]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { ...profileData, refetch: fetchData };
}