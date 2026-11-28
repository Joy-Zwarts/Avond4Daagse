const POSTS_KEY = 'avond4daagse-communicatieberichten';

function createId(title) {
    return `${title.toLowerCase().trim().replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-${Date.now()}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.querySelector('#new-post-form');
    const imageInput = document.querySelector('#post-image');
    const imageName = document.querySelector('#image-name');

    imageInput?.addEventListener('change', () => {
        imageName.textContent = imageInput.files[0]
            ? `Geselecteerd: ${imageInput.files[0].name}`
            : 'PDF, JPG of PNG tot 10 MB';
    });

    form?.addEventListener('submit', event => {
        event.preventDefault();

        const title = document.querySelector('#post-title').value.trim();
        const description = document.querySelector('#post-description').value.trim();
        const content = document.querySelector('#post-content').value.trim();
        if (!title || !description || !content) return;

        const selectedImage = imageInput.files[0];
        const savePost = afbeelding => {
            const post = {
                id: createId(title),
                titel: title,
                beschrijving: description,
                inhoud: content,
                afbeelding: afbeelding || '../../Images/schoolkids.png',
                alt: title,
                datum: new Date().toISOString().slice(0, 10),
                nieuwsbrief: document.querySelector('#newsletter').checked
            };
            const posts = JSON.parse(localStorage.getItem(POSTS_KEY) || '[]');
            posts.unshift(post);
            localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
            window.location.href = 'communicatiebeheerMedewerkers.html';
        };

        if (selectedImage) {
            const reader = new FileReader();
            reader.addEventListener('load', () => savePost(reader.result));
            reader.readAsDataURL(selectedImage);
        } else {
            savePost('');
        }
    });
});