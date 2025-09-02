// src/components/posts/CommentForm.jsx
import { useState } from 'react';

const CommentForm = ({ postId, token, onCommentAdded }) => {
    const [caption, setCaption] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!caption.trim()) return;
        setIsSubmitting(true);
        try {
            await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ caption })
            });
            setCaption('');
            onCommentAdded(); // Recarrega os comentários no pai
        } catch (err) {
            console.error("Erro ao comentar:", err);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-6 p-4 bg-bg-secondary rounded-lg border border-primary">
            <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Escreva seu comentário..."
                className="w-full p-2 bg-bg-darker rounded-md"
                rows="3"
            />
            <button type="submit" disabled={isSubmitting} className="mt-2 px-4 py-2 bg-accent rounded-md">
                {isSubmitting ? "Enviando..." : "Comentar"}
            </button>
        </form>
    );
};

export default CommentForm;