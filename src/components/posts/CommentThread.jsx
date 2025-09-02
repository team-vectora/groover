// src/components/posts/CommentThread.jsx
import Link from 'next/link';
import Image from 'next/image';

const CommentThread = ({ comments }) => {
    if (!comments || comments.length === 0) {
        return <p className="text-center text-gray-500 mt-8">Nenhum comentário ainda.</p>;
    }

    return (
        <div className="mt-8 border-t border-primary pt-6">
            <h2 className="text-xl font-semibold mb-4">Comentários</h2>
            <ul className="space-y-5">
                {comments.map(comment => (
                    <li key={comment._id} className="flex gap-4">
                        <Image src={comment.user.avatar || '/img/default_avatar.png'} alt="avatar" width={48} height={48} className="rounded-full h-12 w-12 object-cover"/>
                        <div className="flex-1 bg-bg-secondary p-3 rounded-lg">
                            <Link href={`/profile/${comment.user.username}`} className="font-bold hover:underline">{comment.user.username}</Link>
                            <p className="text-sm text-gray-400 mb-2">{new Date(comment.created_at).toLocaleString()}</p>
                            <p>{comment.caption}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default CommentThread;