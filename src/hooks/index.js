// src/hooks/index.js

// Exportações de autenticação
export { default as useAuth } from './auth/useAuth';
export { default as useLogin } from './auth/useLogin';
export { default as useSignUp } from './auth/useSignUp';
export { default as useProfile } from './auth/useProfile';

// Exportações de posts
export { default as usePosts } from './posts/usePosts';
export { default as useLikePost } from './posts/useLikePost';
export { default as useSimilarUsers } from './posts/useSimilarUsers';
export { default as useFollow } from './posts/useFollow';
export { default as useOutsideClick } from './posts/useOutsideClick';
export { default as useDeletePost } from './posts/useDeletePost';

// Exportações de projetos
export { default as useForkProject } from './projects/useForkProject';
export { default as useShareProject } from './projects/useShareProject';
export { default as useHandleInvite } from './projects/useHandleInvite';
export { default as useDeleteProject } from './projects/useDeleteProject';

// Exportações de editor
export { default as useMidiPlayer } from './editor/useMidiPlayer';
export { default as useProjectStates } from './editor/useProjectStates';
export { default as useProjectAPI } from './editor/useProjectAPI';
export { default as useTonePlayer } from './editor/useTonePlayer';

// Exportações de search
export { default as useDebounce } from './search/useDebounce';
