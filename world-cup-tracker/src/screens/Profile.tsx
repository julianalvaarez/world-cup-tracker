import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Antigravity } from '../services/antigravity';

const STORAGE_KEY_PROFILE = 'wc_tracker_profile';

interface UserProfile {
    name: string;
    team: string;
}

interface ProfileProps {
    initialProfile: UserProfile;
    trophies: any[];
    onUpdate: (profile: UserProfile) => void;
}

export const Profile: React.FC<ProfileProps> = ({ initialProfile, trophies, onUpdate }) => {
    const [profile, setProfile] = useState<UserProfile>(initialProfile);
    const [isEditing, setIsEditing] = useState(false);

    // Edit Form State
    const [editName, setEditName] = useState('');
    const [editTeam, setEditTeam] = useState('');

    // Dark Mode State
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Check Dark Mode
        setIsDark(document.documentElement.classList.contains('dark'));
    }, []);

    // Sync state if initialProfile changes
    useEffect(() => {
        setProfile(initialProfile);
    }, [initialProfile]);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            setIsDark(true);
        }
    };

    const handleEditClick = () => {
        setEditName(profile.name);
        setEditTeam(profile.team);
        setIsEditing(true);
    };

    const handleSaveProfile = async () => {
        if (!editName.trim()) return;
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { error } = await supabase
            .from('profiles')
            .update({ username: editName })
            .eq('id', user.id);

        if (!error) {
            const newProfile = { ...profile, name: editName };
            setProfile(newProfile);
            onUpdate(newProfile);
            setIsEditing(false);
        }
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
    };

    return (
        <div className="flex flex-col min-h-full pb-24 bg-background-light dark:bg-background-dark">
            <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md px-4 py-4 flex items-center justify-between">
                <div className="flex items-center justify-center w-10 h-10"></div>
                <h1 className="text-slate-900 dark:text-white text-lg font-bold tracking-tight">Player Profile</h1>
                <button
                    onClick={handleEditClick}
                    className="w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-slate-200 dark:hover:bg-white/10 rounded-full transition-colors"
                >
                    <span className="material-symbols-outlined text-2xl text-primary">edit</span>
                </button>
            </header>

            <main className="flex-1 w-full max-w-md mx-auto">
                <section className="flex flex-col items-center py-8 px-4">
                    <div className="text-center">
                        <div className="size-24 rounded-full bg-primary/20 mx-auto flex items-center justify-center mb-4 border-2 border-primary/50 relative overflow-hidden">
                            <span className="material-symbols-outlined text-5xl text-primary">person</span>
                        </div>
                        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">{profile.name}</h2>
                        {profile.team && (
                            <div className="flex items-center justify-center gap-2 mt-2">
                                <span className="text-primary font-medium bg-primary/10 px-3 py-1 rounded-full text-sm">Favorite Team: {profile.team}</span>
                            </div>
                        )}
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-3">Member since 2026</p>
                    </div>
                </section>

                <section className="px-4 mt-2">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-2 mb-3">Trophy Cabinet</h3>
                    <div className="flex flex-wrap gap-4">
                        {trophies.length === 0 ? (
                            <div className="w-full p-8 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/5 flex flex-col items-center justify-center opacity-50">
                                <span className="material-symbols-outlined text-4xl mb-2">emoji_events</span>
                                <span className="text-sm font-medium">No hay trofeos aún</span>
                            </div>
                        ) : (
                            trophies.map((trophy, i) => (
                                <div key={i} className="size-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-600 flex flex-col items-center justify-center shadow-lg shadow-yellow-500/20 group relative">
                                    <span className="material-symbols-outlined text-white text-4x animate-pulse">emoji_events</span>
                                    <div className="absolute -bottom-1 -right-1 size-6 bg-white dark:bg-[#1c1022] rounded-full flex items-center justify-center text-[10px] font-bold shadow-sm border border-yellow-500">
                                        {i + 1}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </section>

                <section className="mt-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-6 mb-2">Account Settings</h3>
                    <div className="mx-4 overflow-hidden rounded-xl bg-white dark:bg-[#2a1d31]">
                        <button className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors border-b border-slate-100 dark:border-slate-800">
                            <div className="flex items-center justify-center rounded-lg bg-primary/20 text-primary shrink-0 size-10">
                                <span className="material-symbols-outlined">person</span>
                            </div>
                            <span className="text-base font-medium flex-1 text-left text-slate-900 dark:text-white">Account Management</span>
                            <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                        </button>
                        <button className="w-full flex items-center gap-4 px-4 py-4 hover:bg-slate-50 dark:hover:bg-primary/10 transition-colors">
                            <div className="flex items-center justify-center rounded-lg bg-primary/20 text-primary shrink-0 size-10">
                                <span className="material-symbols-outlined">language</span>
                            </div>
                            <span className="text-base font-medium flex-1 text-left text-slate-900 dark:text-white">Language</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-slate-400">English</span>
                                <span className="material-symbols-outlined text-slate-400">chevron_right</span>
                            </div>
                        </button>
                    </div>
                </section>

                <section className="mt-8">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 px-6 mb-2">App Preferences</h3>
                    <div className="mx-4 overflow-hidden rounded-xl bg-white dark:bg-[#2a1d31]">
                        <div
                            onClick={toggleTheme}
                            className="w-full flex items-center gap-4 px-4 py-4 border-b border-slate-100 dark:border-slate-800 cursor-pointer hover:bg-slate-50 dark:hover:bg-primary/5 transition-colors"
                        >
                            <div className="flex items-center justify-center rounded-lg bg-primary/20 text-primary shrink-0 size-10">
                                <span className="material-symbols-outlined">dark_mode</span>
                            </div>
                            <span className="text-base font-medium flex-1 text-left text-slate-900 dark:text-white">Dark Mode</span>
                            <div className={`relative inline-flex items-center pointer-events-none transition-colors duration-200 ${isDark ? 'bg-primary' : 'bg-slate-300'} w-11 h-6 rounded-full`}>
                                <div className={`absolute left-[2px] top-[2px] bg-white w-5 h-5 rounded-full shadow transition-transform duration-200 ${isDark ? 'translate-x-5' : 'translate-x-0'}`}></div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="px-4 mt-10">
                    <button
                        onClick={handleLogout}
                        className="w-full bg-white dark:bg-[#2a1d31] text-red-500 font-bold py-4 rounded-xl shadow-sm active:scale-[0.98] transition-all flex items-center justify-center gap-2 border border-red-500/10"
                    >
                        <span className="material-symbols-outlined">logout</span>
                        Logout
                    </button>
                    <p className="text-center text-xs text-slate-500 dark:text-slate-500 mt-6">
                        Mundial PLM v1.1.0<br />
                        Crafted for World Cup Fans ⚽️
                    </p>
                </section>
            </main>

            {/* Edit Profile Modal */}
            {isEditing && (
                <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsEditing(false)} />
                    <div className="relative w-full max-w-md bg-background-light dark:bg-[#1c1022] rounded-t-xl sm:rounded-xl overflow-hidden animate-slide-up shadow-2xl">
                        <div className="flex items-center p-4 pb-2 justify-between border-b border-slate-200 dark:border-white/5">
                            <button onClick={() => setIsEditing(false)} className="text-gray-800 dark:text-white flex size-12 shrink-0 items-center justify-start">
                                <span className="material-symbols-outlined cursor-pointer">close</span>
                            </button>
                            <h2 className="text-gray-900 dark:text-white text-lg font-bold">Edit Profile</h2>
                            <div className="w-12"></div>
                        </div>
                        <div className="p-4 flex flex-col gap-4 pb-8">
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-white font-medium">Display Name</span>
                                <input
                                    value={editName}
                                    onChange={e => setEditName(e.target.value)}
                                    className="w-full rounded-lg bg-white dark:bg-[#2a1d31] border border-slate-300 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </label>
                            <label className="flex flex-col gap-2">
                                <span className="text-slate-900 dark:text-white font-medium">Favorite Team</span>
                                <input
                                    value={editTeam}
                                    onChange={e => setEditTeam(e.target.value)}
                                    className="w-full rounded-lg bg-white dark:bg-[#2a1d31] border border-slate-300 dark:border-slate-700 p-3 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:outline-none"
                                />
                            </label>
                            <button
                                onClick={handleSaveProfile}
                                className="mt-4 w-full bg-primary text-white font-bold py-3.5 rounded-xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};