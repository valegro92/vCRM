/**
 * Generates an ICS file content from a task object
 * @param {Object} task - The task object
 * @returns {string} The ICS file content
 */
export const generateICS = (task) => {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        // Format: YYYYMMDD
        return dateStr.replace(/-/g, '');
    };

    const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

    // Default to 1 hour duration if no time specified, or all day if just date
    const startDate = formatDate(task.dueDate);

    // For all-day events (since we only have date), end date is next day
    const endDate = new Date(task.dueDate);
    endDate.setDate(endDate.getDate() + 1);
    const endDateStr = formatDate(endDate.toISOString().split('T')[0]);

    const description = `Priorità: ${task.priority || 'Normale'}\\nTipo: ${task.type || 'Generico'}\\n\\n${task.description || ''}`;

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//vCRM//Calendar Export//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${task.id}@vcrm.app
DTSTAMP:${now}
DTSTART;VALUE=DATE:${startDate}
DTEND;VALUE=DATE:${endDateStr}
SUMMARY:${task.title}
DESCRIPTION:${description}
STATUS:${task.status === 'Completata' ? 'CONFIRMED' : 'TENTATIVE'}
END:VEVENT
END:VCALENDAR`;
};

/**
 * Triggers a download of the ICS file
 * @param {Object} task - The task object
 */
export const downloadICS = (task) => {
    const content = generateICS(task);
    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${task.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
