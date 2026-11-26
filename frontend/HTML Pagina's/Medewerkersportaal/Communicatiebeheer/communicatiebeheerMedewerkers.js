const POSTS_KEY = 'avond4daagse-communicatieberichten';
const POSTS_JSON_URL = './communicatieberichten.json';

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

function postTemplate(post) {
    const image = post.afbeelding || '../../Images/schoolkids.png';
    const alt = post.alt || post.titel || 'Nieuwsbericht';

    return `
        <article class="card post" id="${escapeHtml(post.id)}">
            <div class="post-image">
                <img class="newsCover" src="${escapeHtml(image)}" alt="${escapeHtml(alt)}">
            </div>
            <h2>${escapeHtml(post.titel)}</h2>
            <p>${escapeHtml(post.beschrijving)}</p>
            <a class="read-more" href="#${escapeHtml(post.id)}">Lees meer <span aria-hidden="true">→</span></a>
            <p class="post-full" hidden>${escapeHtml(post.inhoud || post.beschrijving)}</p>
        </article>`;
}

function getSavedPosts() {
    try {
        return JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
    } catch {
        return [];
    }
}

async function loadPosts() {
    const list = document.querySelector('.post-list');
    if (!list) return;

    try {
        const response = await fetch(POSTS_JSON_URL, { cache: 'no-store' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);

        const jsonPosts = await response.json();
        const posts = [...getSavedPosts(), ...jsonPosts];

        list.innerHTML = posts.length
            ? posts.map(postTemplate).join('')
            : '<p>Er zijn nog geen nieuwsberichten.</p>';
    } catch (error) {
        list.innerHTML = `
            <p>De nieuwsberichten konden niet worden geladen.</p>
            <p class="load-error">Open deze pagina via een lokale webserver (bijvoorbeeld VS Code Live Server). Een JSON-bestand kan niet met <code>fetch()</code> worden geladen wanneer je het HTML-bestand rechtstreeks opent.</p>`;
        console.error('Fout bij laden van communicatieberichten.json:', error);
    }
}

document.addEventListener('click', event => {
    const link = event.target.closest('.read-more');
    if (!link) return;

    event.preventDefault();
    const fullText = link.parentElement.querySelector('.post-full');
    const showFullText = fullText.hidden;

    fullText.hidden = !showFullText;
    link.firstChild.textContent = showFullText ? 'Toon minder ' : 'Lees meer ';
});

document.addEventListener('DOMContentLoaded', loadPosts);
