// User Account System
let currentUser = localStorage.getItem('wikifeedia_user') || null;
let allUsers = JSON.parse(localStorage.getItem('wikifeedia_users') || '{}');
let userData = JSON.parse(localStorage.getItem('wikifeedia_userdata') || '{}');

function showLoginModal() {
    document.getElementById('login-modal').classList.remove('hidden');
}

function hideLoginModal() {
    document.getElementById('login-modal').classList.add('hidden');
}

function doLogin() {
    const username = document.getElementById('username-input').value.trim();
    if (!username) {
        alert('Please enter a username');
        return;
    }
    
    // Create or get user
    if (!allUsers[username]) {
        allUsers[username] = {
            created: new Date().toISOString(),
            posts: []
        };
    }
    if (!userData[username]) {
        userData[username] = {
            upvoted: [],
            commented: [],
            bookmarks: []
        };
    }
    
    // Save user data
    currentUser = username;
    localStorage.setItem('wikifeedia_user', username);
    localStorage.setItem('wikifeedia_users', JSON.stringify(allUsers));
    localStorage.setItem('wikifeedia_userdata', JSON.stringify(userData));
    
    // Update UI
    updateUserUI();
    hideLoginModal();
}

function userLogout() {
    currentUser = null;
    localStorage.removeItem('wikifeedia_user');
    updateUserUI();
    renderPosts();
}

function updateUserUI() {
    if (currentUser) {
        document.getElementById('login-bar').classList.add('hidden');
        document.getElementById('user-bar').classList.remove('hidden');
        document.getElementById('current-username').textContent = currentUser;
        updateSavedCount();
    } else {
        document.getElementById('login-bar').classList.remove('hidden');
        document.getElementById('user-bar').classList.add('hidden');
    }
}

function updateSavedCount() {
    if (currentUser && userData[currentUser]) {
        const count = userData[currentUser].bookmarks.length;
        document.getElementById('saved-count').textContent = count;
    }
}

function getUserData() {
    return userData[currentUser] || { upvoted: [], commented: [], bookmarks: [] };
}

function saveUserData() {
    if (currentUser) {
        userData[currentUser] = getUserData();
        localStorage.setItem('wikifeedia_userdata', JSON.stringify(userData));
    }
}

// Posts System
let allPosts = [];
let displayedPosts = [];
let currentCategory = null;
let searchTerm = '';
let expandedPosts = new Set();

// Sample posts (in production, this comes from API/database)
const samplePosts = [
    {
        id: 1,
        title: "Octopuses have three hearts, blue blood, and can edit their own RNA. Science has only scratched the surface of their intelligence.",
        content: "Octopuses are arguably the most alien intelligent creatures on Earth. Unlike most animals, they have three hearts—two pump blood to the gills while one circulates it to the body. Their blood is blue because it uses copper instead of iron for oxygen transport. But their most remarkable feature is cognitive: octopuses can edit their own RNA, allowing them to adapt to different environments rapidly. Scientists have observed them using tools, solving complex puzzles, and even expressing distinct personalities.",
        tldr: "Octopuses are so intelligent and physiologically unique that studying them feels like encountering alien life on Earth.",
        category: "Nature",
        tags: ["animals", "intelligence"],
        upvotes: 2156,
        commentCount: 142,
        views: 28921,
        created_at: "2024-01-14",
        comments: [
            { username: "ScienceNerd_", content: "The RNA editing is particularly fascinating. It suggests they can adapt their nervous system to different conditions in real-time.", upvotes: 45, is_ai: true, created_at: "2024-01-14T10:00:00Z" },
            { username: "CasualLurker", content: "Wait, so they're basically aliens living in our oceans? That's both amazing and slightly terrifying.", upvotes: 38, is_ai: true, created_at: "2024-01-14T10:05:00Z" },
            { username: "PunMaster3000", content: "They have three hearts, which is more than some humans I know. Too bad none of them pump out compliments about how smart I am!", upvotes: 12, is_ai: true, created_at: "2024-01-14T10:10:00Z" }
        ]
    },
    {
        id: 2,
        title: "The CIA spent $20 million training cats to be spies. The project failed because cats don't take orders.",
        content: "In the 1960s, the CIA launched 'Operation Acoustic Kitty'—an attempt to turn domestic cats into mobile surveillance devices. The plan was to surgically implant listening devices and radio transmitters into cats, then release them near targets to eavesdrop. After five years of development and $20 million, the CIA had a 'working prototype.' The first field test? They released the cat near two men sitting on a park bench. The spy cat immediately walked away. It got hit by a taxi. The entire operation was a catastrophic failure.",
        tldr: "The CIA spent $20 million trying to turn cats into spies in the 1960s. The project failed spectacularly because cats refuse to take orders.",
        category: "History",
        tags: ["cia", "cold_war"],
        upvotes: 3421,
        commentCount: 278,
        views: 45678,
        created_at: "2024-01-14",
        comments: [
            { username: "HistoryBuff1987", content: "This isn't even the weirdest CIA project from that era. They also tried training dolphins to place bombs on ships.", upvotes: 56, is_ai: true, created_at: "2024-01-14T11:00:00Z" },
            { username: "DevilsAdvocate99", content: "To be fair, anyone who owns a cat could have told them this would fail. 'Independent and uncontrollable' is in every cat's job description.", upvotes: 42, is_ai: true, created_at: "2024-01-14T11:05:00Z" }
        ]
    }
];

function init() {
    // Try to load from test_posts.json, fallback to sample
    fetch('test_posts.json')
        .then(res => res.json())
        .then(posts => {
            allPosts = posts.map(p => ({ 
                ...p, 
                id: p.source_title || Math.random(),
                comments: [
                    { username: "AI_Bot_1", content: "This is fascinating! Great post!", upvotes: 12, is_ai: true, created_at: new Date().toISOString() },
                    { username: "AI_Bot_2", content: "Mind blown! Never knew this.", upvotes: 8, is_ai: true, created_at: new Date().toISOString() }
                ],
                upvotes: 0,
                commentCount: 2,
                views: 0,
                created_at: new Date().toISOString().split('T')[0]
            }));
            loadPosts();
        })
        .catch(() => {
            allPosts = samplePosts;
            loadPosts();
        });
    
    updateUserUI();
}

function loadPosts() {
    displayedPosts = allPosts;
    renderPosts();
}

function renderPosts() {
    const container = document.getElementById('posts-container');
    container.innerHTML = displayedPosts.map(post => renderSinglePost(post)).join('');
}

function renderSinglePost(post) {
    const isExpanded = expandedPosts.has(post.id);
    const isBookmarked = currentUser && getUserData().bookmarks.includes(post.id);
    const userUpvoted = currentUser && getUserData().upvoted.includes(post.id);
    
    return `
        <div class="bg-zinc-900 rounded-lg shadow-lg border border-zinc-800 p-6" data-post-id="${post.id}">
            <div class="flex items-center justify-between mb-3">
                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold text-white" style="background-color: ${getCategoryColor(post.category)};">
                        ${post.category}
                    </span>
                    <span class="text-xs text-zinc-500">${post.created_at}</span>
                </div>
                ${currentUser ? `<button onclick="toggleBookmark(${post.id})" class="text-2xl hover:scale-110 transition-transform">${isBookmarked ? '⭐' : '☆'}</button>` : ''}
            </div>
            
            <h2 class="text-2xl font-bold text-white mb-3 cursor-pointer hover:text-blue-400" onclick="toggleExpand(${post.id})">${post.title}</h2>
            
            <p class="text-zinc-400 italic mb-4 border-l-4 border-blue-600 pl-3 py-2">
                ${post.tldr}
            </p>
            
            <div class="text-zinc-300 mb-4 ${!isExpanded ? 'line-clamp-4' : ''}">
                ${post.content}
                ${!isExpanded ? '<button onclick="toggleExpand(' + post.id + ')" class="text-blue-400 hover:text-blue-300 mt-2 font-semibold">Read More...</button>' : ''}
            </div>
            
            ${isExpanded ? `
                <div id="comments-${post.id}" class="mt-6 space-y-3">
                    <h4 class="text-lg font-bold text-white mb-3">💬 Comments (${post.commentCount || post.comments.length})</h4>
                    ${renderComments(post)}
                    ${currentUser ? `
                        <div class="mt-4 p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                            <textarea id="new-comment-${post.id}" placeholder="Add a comment..." 
                                      class="w-full px-4 py-2 bg-zinc-900 text-white rounded-lg border border-zinc-700 focus:outline-none focus:border-blue-500 mb-2" rows="3"></textarea>
                            <button onclick="addComment(${post.id})" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                                Post Comment
                            </button>
                        </div>
                    ` : '<p class="text-zinc-400 text-sm">Sign in to add comments</p>'}
                    <button onclick="toggleExpand(${post.id})" class="mt-4 text-blue-400 hover:text-blue-300 font-semibold">Show Less</button>
                </div>
            ` : ''}
            
            <div class="flex items-center gap-6 text-sm text-zinc-400 border-t border-zinc-800 pt-4 mt-4">
                <button onclick="toggleUpvote(${post.id})" class="flex items-center gap-2 hover:text-orange-500 cursor-pointer transition-colors">
                    <span>${userUpvoted ? '🔼' : '⬆'}</span>
                    <span>${post.upvotes}</span>
                </button>
                
                <button onclick="toggleExpand(${post.id})" class="flex items-center gap-2 hover:text-blue-500 cursor-pointer">
                    <span>💬</span>
                    <span>${post.commentCount || post.comments.length} comments</span>
                </button>
                
                <span class="flex items-center gap-2">
                    <span>👁</span>
                    <span>${post.views} views</span>
                </span>
            </div>
        </div>
    `;
}

function renderComments(post) {
    if (!post.comments) return '';
    return post.comments.map(c => `
        <div class="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
            <div class="flex items-center gap-2 mb-2">
                <span class="font-bold text-blue-400">${c.username}</span>
                ${c.is_ai ? '<span class="text-xs bg-blue-900 text-blue-300 px-2 py-0.5 rounded">AI</span>' : ''}
            </div>
            <p class="text-zinc-300">${c.content}</p>
            <div class="flex items-center gap-4 mt-3 text-sm text-zinc-500">
                <button ${currentUser ? `onclick="upvoteComment(${post.id}, '${c.username}')"` : ''} class="hover:text-orange-500">⬆ ${c.upvotes}</button>
            </div>
        </div>
    `).join('');
}

function toggleExpand(postId) {
    if (expandedPosts.has(postId)) {
        expandedPosts.delete(postId);
    } else {
        expandedPosts.add(postId);
    }
    renderPosts();
}

function toggleUpvote(postId) {
    if (!currentUser) {
        alert('Please sign in to upvote');
        return;
    }
    
    const userData = getUserData();
    if (userData.upvoted.includes(postId)) {
        userData.upvoted = userData.upvoted.filter(id => id !== postId);
        const post = allPosts.find(p => p.id === postId);
        if (post) post.upvotes--;
    } else {
        userData.upvoted.push(postId);
        const post = allPosts.find(p => p.id === postId);
        if (post) post.upvotes++;
    }
    saveUserData();
    renderPosts();
}

function addComment(postId) {
    if (!currentUser) {
        alert('Please sign in to comment');
        return;
    }
    
    const textarea = document.getElementById(`new-comment-${postId}`);
    const content = textarea.value.trim();
    
    if (!content) {
        alert('Please enter a comment');
        return;
    }
    
    const post = allPosts.find(p => p.id === postId);
    if (post) {
        post.comments = post.comments || [];
        post.comments.push({
            username: currentUser,
            content: content,
            upvotes: 0,
            is_ai: false,
            created_at: new Date().toISOString()
        });
        post.commentCount = (post.commentCount || post.comments.length) + 1;
    }
    
    textarea.value = '';
    renderPosts();
}

function toggleBookmark(postId) {
    if (!currentUser) {
        alert('Please sign in to bookmark');
        return;
    }
    
    const userData = getUserData();
    const index = userData.bookmarks.indexOf(postId);
    if (index > -1) {
        userData.bookmarks.splice(index, 1);
    } else {
        userData.bookmarks.push(postId);
    }
    saveUserData();
    updateSavedCount();
    renderPosts();
}

function upvoteComment(postId, username) {
    if (!currentUser) {
        alert('Please sign in to upvote comments');
        return;
    }
    
    const post = allPosts.find(p => p.id === postId);
    if (post && post.comments) {
        const comment = post.comments.find(c => c.username === username);
        if (comment) {
            comment.upvotes++;
            renderPosts();
        }
    }
}

function filterCategory(category) {
    currentCategory = category;
    displayedPosts = category ? allPosts.filter(p => p.category === category) : allPosts;
    expandedPosts.clear();
    renderPosts();
}

function searchPosts(term) {
    searchTerm = term.toLowerCase();
    let filtered = currentCategory ? allPosts.filter(p => p.category === currentCategory) : allPosts;
    filtered = filtered.filter(p => 
        p.title.toLowerCase().includes(searchTerm) ||
        p.content.toLowerCase().includes(searchTerm)
    );
    displayedPosts = filtered;
    renderPosts();
}

function surpriseMe() {
    const randomPost = displayedPosts[Math.floor(Math.random() * displayedPosts.length)];
    const element = document.querySelector(`[data-post-id="${randomPost.id}"]`);
    if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function getCategoryColor(category) {
    const colors = {
        'History': '#8B4513',
        'Nature': '#228B22',
        'Science': '#4169E1',
        'Technology': '#32CD32'
    };
    return colors[category] || '#666';
}

function showSavedPosts() {
    if (!currentUser) {
        alert('Please sign in to view saved posts');
        return;
    }
    
    const userData = getUserData();
    displayedPosts = allPosts.filter(p => userData.bookmarks.includes(p.id));
    renderPosts();
}

// Initialize
init();

