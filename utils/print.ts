import { StockItem, TransferLog } from '../types';

export const generatePrintableHtml = (title: string, content: string) => {
    return `
        <!DOCTYPE html>
        <html lang="pt">
            <head>
                <meta charset="UTF-8">
                <title>Relatório - ${title}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=JetBrains+Mono&display=swap');
                    
                    body { 
                        font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; 
                        margin: 40px; 
                        color: #1a1a1a; 
                        line-height: 1.5;
                    }
                    
                    .header {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        border-bottom: 2px solid #1a1a1a;
                        padding-bottom: 20px;
                        margin-bottom: 30px;
                    }
                    
                    .header-title {
                        margin: 0;
                    }
                    
                    h1 { 
                        font-size: 28px; 
                        font-weight: 700; 
                        margin: 0;
                        text-transform: uppercase;
                        letter-spacing: -0.02em;
                    }
                    
                    .meta {
                        font-size: 12px;
                        color: #666;
                        text-align: right;
                    }
                    
                    table { 
                        width: 100%; 
                        border-collapse: collapse; 
                        font-size: 11px; 
                        margin-top: 10px; 
                    }
                    
                    th, td { 
                        border-bottom: 1px solid #e5e7eb; 
                        padding: 12px 8px; 
                        text-align: left; 
                    }
                    
                    th { 
                        background-color: #f9fafb; 
                        font-weight: 600; 
                        text-transform: uppercase;
                        font-size: 10px;
                        letter-spacing: 0.05em;
                        color: #4b5563;
                    }
                    
                    td {
                        color: #374151;
                    }

                    .font-mono {
                        font-family: 'JetBrains Mono', monospace;
                    }
                    
                    h2 { 
                        font-size: 16px; 
                        font-weight: 700;
                        margin-top: 40px; 
                        margin-bottom: 15px;
                        padding-left: 8px;
                        border-left: 4px solid #7c3aed;
                        background-color: #f3f4f6;
                        padding-top: 8px;
                        padding-bottom: 8px;
                    }
                    
                    .summary { 
                        margin-top: 30px; 
                        padding: 20px; 
                        background-color: #f8fafc; 
                        border: 1px solid #e2e8f0; 
                        border-radius: 8px;
                        font-size: 13px; 
                    }

                    .summary-title {
                        font-weight: 700;
                        margin-bottom: 10px;
                        display: block;
                        color: #1e293b;
                    }
                    
                    @media print {
                        body { margin: 20px; }
                        .no-print { display: none; }
                        tr { page-break-inside: avoid; }
                        thead { display: table-header-group; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="header-title">
                        <p style="font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; color: #7c3aed; font-weight: 700; margin-bottom: 4px;">Relatório de Sistema</p>
                        <h1>${title}</h1>
                    </div>
                    <div class="meta">
                        <p>Gerado em: ${new Date().toLocaleString('pt-PT')}</p>
                        <p>Vinho Stock Management</p>
                    </div>
                </div>
                ${content}
                <div class="no-print" style="margin-top: 40px; text-align: center;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #7c3aed; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 600;">Imprimir Agora</button>
                </div>
            </body>
        </html>
    `;
};

export const handlePrint = (title: string, content: string) => {
    const htmlContent = generatePrintableHtml(title, content);
    const printWindow = window.open('', '_blank');
    if (printWindow) {
        printWindow.document.write(htmlContent);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
    }
};
