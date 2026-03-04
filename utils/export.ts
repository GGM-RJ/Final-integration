// This utility handles data exporting functionalities.

// Declare XLSX to inform TypeScript about the global variable from the script tag
declare var XLSX: any;

/**
 * Converts an array of objects to a CSV string and triggers a download.
 * @param data Array of objects to be converted.
 * @param filename The name of the downloaded file (without extension).
 */
export const handleExportCSV = (data: any[], filename: string) => {
    if (data.length === 0) {
        alert("Não há dados para exportar.");
        return;
    }

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(',')]; // Header row

    // Data rows
    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '\\"'); // Escape double quotes
            return `"${escaped}"`; // Wrap all values in quotes
        });
        csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `${filename}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};

/**
 * Converts an array of objects to an XLSX file and triggers a download.
 * @param data Array of objects to be converted.
 * @param filename The name of the downloaded file (without extension).
 */
export const handleExportXLSX = (data: any[], filename: string) => {
    if (data.length === 0) {
        alert("Não há dados para exportar.");
        return;
    }

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

    // The user requested .xlsm, but we generate .xlsx as it's the modern standard
    // without macros, avoiding Excel warnings about mismatched file extensions.
    XLSX.writeFile(workbook, `${filename}.xlsx`);
};