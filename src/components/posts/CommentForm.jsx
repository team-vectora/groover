import { useState } from 'react';
import PostFormPopUp from './PostFormPopUp';
import { apiFetch } from "../../lib/util/apiFetch";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';

const CommentForm = ({ postId, token, onCommentAdded, projects }) => {
    const { t } = useTranslation();
    const [caption, setCaption] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isPopupOpen, setIsPopupOpen] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!caption.trim()) {
            toast.error(t('validation.comment_required'));
            return;
        }
        setIsSubmitting(true);
        try {
            await apiFetch(`/posts/${postId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ caption }),
                credentials: 'include'
            });
            setCaption('');
            onCommentAdded();
        } catch (err) {
            console.error("Error submitting comment:", err);
            toast.error(t('errors.network_error'));
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
                    placeholder={t('postForm.commentPlaceholder')}
                    className="w-full p-2 bg-bg-darker rounded-md"
                    rows="3"
                />
                <div className="flex justify-between items-center mt-2">
                    <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-accent rounded-md">
                        {isSubmitting ? (
                            <div className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin"></div>
                        ) : (isComment ? t('postForm.comment') : t('postForm.publish'))}
                    </button>
                    <button type="button" onClick={() => setIsPopupOpen(true)} className="text-sm text-accent hover:underline">
                        {t('midiPlayer.expand')}
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