export const demoAccountId = '1';

export async function leesVoorbeeldgegevens(bestand) {
    const url = new URL('../gegevens/' + bestand, import.meta.url);
    const response = await fetch(url, { cache: 'no-store' });
    if (!response.ok) throw Error('Het laden van ' + bestand + ' is mislukt.');
    return response.json();
}

export function bestandsUrl(file) {
    return 'data:' + file.type + ';base64,' + file.data;
}

export async function readUpload(file, photo = false) {
    const types = photo ? ['image/png', 'image/jpeg'] : ['application/pdf', 'image/png', 'image/jpeg'];
    if (!types.includes(file.type)) throw Error(photo ? 'Kies een PNG- of JPG-foto.' : 'Kies een PDF-, PNG- of JPG-bestand.');
    if (!file.size || file.size > 4 * 1024 * 1024) throw Error('Kies een bestand van maximaal 4 MB dat niet leeg is.');
    const data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = () => reject(Error('Lezen van het bestand is mislukt.'));
        reader.readAsDataURL(file);
    });
    return { name: file.name, type: file.type, data };
}

export function showMessage(text, error = false) {
    const message = document.querySelector('#message');
    message.textContent = text;
    message.setAttribute('role', error ? 'alert' : 'status');
    message.style.color = error ? '#922b24' : '';
}
