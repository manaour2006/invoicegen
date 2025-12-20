import { jsPDF } from 'jspdf';

export const generateInvoicePDF = (invoice) => {
    const doc = new jsPDF();

    // Colors
    const primaryColor = [59, 130, 246]; // Blue
    const textColor = [26, 26, 26];
    const mutedColor = [102, 102, 102];

    // Calculate totals
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const taxAmount = (subtotal * invoice.tax) / 100;
    const total = subtotal + taxAmount;

    // Currency formatter
    const formatCurrency = (amount) => {
        const symbol = invoice.currency === 'INR' ? '₹' : invoice.currency === 'USD' ? '$' : '€';
        return `${symbol}${amount.toLocaleString('en-IN')}`;
    };

    // Header
    doc.setFontSize(28);
    doc.setTextColor(...primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('INVOICE', 20, 25);

    doc.setFontSize(10);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`#${invoice.invoiceNumber}`, 20, 32);

    // Company Info (From)
    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.from.name, 140, 25);

    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    const fromLines = invoice.from.address.split('\n');
    let yPos = 30;
    fromLines.forEach(line => {
        doc.text(line, 140, yPos);
        yPos += 4;
    });
    doc.text(invoice.from.email, 140, yPos);

    // Bill To Section
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'bold');
    doc.text('BILL TO', 20, 55);

    doc.setFontSize(11);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.to.name || 'Client Name', 20, 62);

    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'normal');
    const toLines = (invoice.to.address || 'Client Address').split('\n');
    yPos = 67;
    toLines.forEach(line => {
        doc.text(line, 20, yPos);
        yPos += 4;
    });

    // Date
    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'bold');
    doc.text('DATE', 140, 55);

    doc.setFontSize(10);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');
    doc.text(invoice.date, 140, 62);

    // Items Table
    const tableTop = 90;

    // Table Header
    doc.setFillColor(243, 244, 246);
    doc.rect(20, tableTop, 170, 8, 'F');

    doc.setFontSize(8);
    doc.setTextColor(...mutedColor);
    doc.setFont('helvetica', 'bold');
    doc.text('DESCRIPTION', 22, tableTop + 5);
    doc.text('QTY', 130, tableTop + 5, { align: 'center' });
    doc.text('PRICE', 155, tableTop + 5, { align: 'right' });
    doc.text('TOTAL', 185, tableTop + 5, { align: 'right' });

    // Table Rows
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.setFont('helvetica', 'normal');

    let currentY = tableTop + 15;
    invoice.items.forEach((item, index) => {
        doc.text(item.description || 'Item Name', 22, currentY);
        doc.text(String(item.quantity), 130, currentY, { align: 'center' });
        doc.text(formatCurrency(item.price), 155, currentY, { align: 'right' });
        doc.setFont('helvetica', 'bold');
        doc.text(formatCurrency(item.quantity * item.price), 185, currentY, { align: 'right' });
        doc.setFont('helvetica', 'normal');

        // Line separator
        doc.setDrawColor(243, 244, 246);
        doc.line(20, currentY + 3, 190, currentY + 3);

        currentY += 10;
    });

    // Totals Section
    const totalsX = 125;
    currentY += 10;

    doc.setFontSize(9);
    doc.setTextColor(...mutedColor);
    doc.text('Subtotal', totalsX, currentY);
    doc.setTextColor(...textColor);
    doc.text(formatCurrency(subtotal), 185, currentY, { align: 'right' });

    currentY += 7;
    doc.setTextColor(...mutedColor);
    doc.text(`Tax (${invoice.tax}%)`, totalsX, currentY);
    doc.setTextColor(...textColor);
    doc.text(formatCurrency(taxAmount), 185, currentY, { align: 'right' });

    // Total line
    doc.setDrawColor(243, 244, 246);
    doc.setLineWidth(0.5);
    doc.line(totalsX, currentY + 3, 190, currentY + 3);

    currentY += 10;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...textColor);
    doc.text('Total', totalsX, currentY);
    doc.text(formatCurrency(total), 185, currentY, { align: 'right' });

    // Notes Section
    if (invoice.notes) {
        currentY += 20;
        doc.setFillColor(248, 250, 252);
        doc.roundedRect(20, currentY - 5, 170, 25, 3, 3, 'F');

        doc.setFontSize(8);
        doc.setTextColor(...mutedColor);
        doc.setFont('helvetica', 'bold');
        doc.text('NOTES', 22, currentY);

        doc.setFontSize(9);
        doc.setTextColor(...textColor);
        doc.setFont('helvetica', 'normal');
        const noteLines = doc.splitTextToSize(invoice.notes, 165);
        doc.text(noteLines, 22, currentY + 5);
    }

    return doc;
};

export const downloadInvoicePDF = (invoice) => {
    const doc = generateInvoicePDF(invoice);
    doc.save(`${invoice.invoiceNumber}.pdf`);
};

export const getInvoicePDFBlob = (invoice) => {
    const doc = generateInvoicePDF(invoice);
    return doc.output('blob');
};
