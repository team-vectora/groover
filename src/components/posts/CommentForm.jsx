// src/components/posts/CommentForm.jsx
import { useState } from 'react';
import PostFormPopUp from './PostFormPopUp'; // Importe o popup

const CommentForm = ({ postId, token, onCommentAdded, projects }) => {
    const [caption, setCaption] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false); // Estado para controlar o popup

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
        <>
            <form onSubmit={handleSubmit} className="mt-6 max-w-2xl mx-auto p-4 bg-bg-secondary rounded-lg border border-primary">
                <textarea
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Escreva seu comentário..."
                    className="w-full p-2 bg-bg-darker rounded-md"
                    rows="3"
                />
                <div className="flex justify-between items-center mt-2">
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-accent rounded-md">
                        {isSubmitting ? "Enviando..." : "Comentar"}
                    </button>
                    <button type="button" onClick={() => setIsPopupOpen(true)} className="text-sm text-accent hover:underline">
                        Expandir
                    </button>
                </div>
            </form>
            {isPopupOpen && (
                <PostFormPopUp
                    open={isPopupOpen}
                    onClose={() => setIsPopupOpen(false)}
                    projects={projects}
                    isComment={true}
                    postId={postId}
                    initialCaption={caption}
                    onPostCreated={() => {
                        setCaption('');
                        onCommentAdded();
                    }}
                />
            )}
        </>
    );
};

export default CommentForm;