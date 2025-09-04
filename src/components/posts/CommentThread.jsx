// src/components/posts/CommentThread.jsx
import Post from './Post';

const CommentThread = ({ comments, token, userId, setCurrentProject, handleClickFork, onPostCreated }) => {
    if (!comments || comments.length === 0) {
        return <p className="text-center text-gray-500 mt-8">Nenhum comentário ainda.</p>;
    }

    return (
        <div className="mt-8 max-w-2xl mx-auto border-t border-primary pt-6">
            <h2 className="text-xl font-semibold mb-4">Comentários</h2>
            <div className="space-y-6">
                {comments.map(comment => (
                    <Post
                        key={comment._id}
                        post={comment}
                        token={token}
                        userId={userId}
                        setCurrentProject={setCurrentProject}
                        handleClickFork={handleClickFork}
                        onPostCreated={onPostCreated}
                    />
                ))}
            </div>
        </div>
    );
};

export default CommentThread;