/**
 * Utilitários para manipulação de datas considerando o timezone brasileiro
 */

/**
 * Obtém a data atual no formato YYYY-MM-DD considerando o timezone local
 */
export function getLocalDate(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Obtém a hora atual no formato HH:MM:SS considerando o timezone local
 */
export function getLocalTime(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}

/**
 * Obtém a hora atual no formato HH:MM considerando o timezone local
 */
export function getLocalTimeShort(): string {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

/**
 * Converte uma data ISO para o formato brasileiro DD/MM/YYYY
 */
export function formatDateBR(dateString: string): string {
    if (!dateString) return '-';
    const date = new Date(dateString + 'T00:00:00'); // Adiciona hora para evitar timezone issues
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
}

/**
 * Converte uma data/hora ISO para o formato brasileiro DD/MM/YYYY HH:MM
 */
export function formatDateTimeBR(dateString: string, timeString?: string): string {
    if (!dateString) return '-';
    const datePart = formatDateBR(dateString);
    if (timeString) {
        return `${datePart} ${timeString}`;
    }
    return datePart;
}
