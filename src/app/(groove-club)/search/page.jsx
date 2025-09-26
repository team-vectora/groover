'use client';
import { useState, useEffect } from 'react';
import { useAuth, useDebounce } from '../../../hooks';
import { GENRES } from '../../../constants';
import { Post, ProjectCard, UserSearchResult, LoadingDisc } from '../../../components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { useTranslation } from 'react-i18next';
import { API_BASE_URL } from "../../../config";

export default function SearchPage() {
    const { t, i18n } = useTranslation();
    const [query, setQuery] = useState('');
    const [selectedTags, setSelectedTags] = useState([]);
    const [searchType, setSearchType] = useState('all');
    const [tagsExpanded, setTagsExpanded] = useState(false);
    const [results, setResults] = useState({ users: [], posts: [], projects: [] });
    const [loading, setLoading] = useState(false);

    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        const performSearch = async () => {
            if (!debouncedQuery && selectedTags.length === 0) {
                setResults({ users: [], posts: [], projects: [] });
                return;
            }

            setLoading(true);
            const tagsQuery = selectedTags.join(',');
            const response = await fetch(`${API_BASE_URL}/search?q=${debouncedQuery}&tags=${tagsQuery}&type=${searchType}`, {
                credentials: "include"
            });
            const data = await response.json();
            console.log("Projects")
            console.log(data)
            setResults(data);
            setLoading(false);
        };
        performSearch();

    }, [debouncedQuery, selectedTags, searchType]);


    const toggleTag = (tag) => {
        setSelectedTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const renderResults = () => {
        if (loading) return <LoadingDisc />;

        const hasResults =
            (results.users?.length || 0) > 0 ||
            (results.posts?.length || 0) > 0 ||
            (results.projects?.length || 0) > 0;

        if (!hasResults) return <p className="text-center mt-8 text-gray-400">{t('search.noResults')}</p>;

        return (
            <div className="space-y-12 mt-8">
                {results.users?.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-accent-light">{t('search.users')}</h2>
                        <div className="space-y-4">
                            {results.users.map(user => <UserSearchResult key={user.id} user={user} />)}
                        </div>
                    </section>
                )}
                {results.posts?.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-accent-light">{t('search.posts')}</h2>
                        <div className="space-y-6">
                            {results.posts.map(post => <Post key={post._id} post={post} />)}
                        </div>
                    </section>
                )}
                {results.projects?.length > 0 && (
                    <section>
                        <h2 className="text-2xl font-bold mb-4 text-accent-light">{t('search.projects')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {results.projects?.map((project, idx) => (
                              <ProjectCard key={project._id || idx} project={project} isYourProfile={false} />
                            ))}
                        </div>
                    </section>
                )}
            </div>
        );
    };


    const filterButtons = [
        { label: t('search.all'), value: 'all' },
        { label: t('search.posts'), value: 'posts' },
        { label: t('search.projects'), value: 'projects' },
        { label: t('search.users'), value: 'users' }
    ];

    return (
        <div className="py-8">
            <h1 className="text-3xl font-bold mb-6">{t('search.title')}</h1>
            <div className="relative mb-4">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t('search.placeholder')}
                    className="w-full p-4 pl-12 bg-bg-secondary rounded-lg border border-primary focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <FontAwesomeIcon icon={faSearch} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            </div>

            <div className="flex items-center gap-2 mb-4">
                <span className="font-semibold">{t('search.filterBy')}</span>
                {filterButtons.map(btn => (
                    <button
                        key={btn.value}
                        onClick={() => setSearchType(btn.value)}
                        className={`px-3 py-1 rounded-full text-sm transition ${searchType === btn.value ? 'bg-accent text-white' : 'bg-primary hover:bg-primary-light'}`}
                    >
                        {btn.label}
                    </button>
                ))}
            </div>

            <div className="mb-6">
                <button
                    onClick={() => setTagsExpanded(!tagsExpanded)}
                    className="font-semibold mb-3 flex items-center gap-2 text-foreground hover:text-accent transition"
                >
                    {t('search.filterGenres')}
                    <FontAwesomeIcon icon={tagsExpanded ? faChevronUp : faChevronDown} />
                </button>

                {tagsExpanded && (
                    <div className="flex flex-wrap gap-2 animate-fade-in">
                        {GENRES.map(genre => (
                            <button
                                key={genre}
                                onClick={() => toggleTag(genre)}
                                className={`px-3 py-1 rounded-full text-sm transition ${selectedTags.includes(genre) ? 'bg-accent text-white' : 'bg-primary hover:bg-primary-light'}`}
                            >
                                {t(`genres.${genre}`)}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {renderResults()}
        </div>
    );
}
