
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AgendaItem, ChallengeCardData } from '../types';

// This function creates a temporary, off-screen element for rendering
const createPrintableElement = (agenda: AgendaItem[], selectedCards: ChallengeCardData[]): HTMLElement => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '1200px';
    container.style.padding = '40px';
    container.style.fontFamily = 'sans-serif';
    container.style.color = '#000'; // Ensure text is black for PDF
    container.style.backgroundColor = '#fff';

    let html = `
        <h1 style="font-size: 36px; font-weight: bold; margin-bottom: 30px; text-align: center;">AI Day Plan</h1>
        
        <h2 style="font-size: 28px; font-weight: bold; margin-top: 40px; margin-bottom: 20px; border-bottom: 2px solid #ccc; padding-bottom: 10px;">Agenda</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <thead>
                <tr style="background-color: #f2f2f2;">
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Time</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Topic</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Presenter</th>
                    <th style="padding: 12px; border: 1px solid #ddd; text-align: left;">Description</th>
                </tr>
            </thead>
            <tbody>
                ${agenda.map(item => `
                    <tr>
                        <td style="padding: 12px; border: 1px solid #ddd;">${item.time}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${item.topic}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${item.presenter}</td>
                        <td style="padding: 12px; border: 1px solid #ddd;">${item.description}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        
        <div style="page-break-before: always;"></div>
        
        <h2 style="font-size: 28px; font-weight: bold; margin-top: 40px; margin-bottom: 20px; border-bottom: 2px solid #ccc; padding-bottom: 10px;">Workshop Challenge Cards</h2>
    `;
    
    const allSources = new Map<string, string>();

    selectedCards.forEach((card, index) => {
        const sourceLinks = card.supportingSources.map((source, i) => {
            const sourceId = `S${allSources.size + 1}`;
            if (!allSources.has(source.uri)) {
                allSources.set(source.uri, source.title);
            }
            return `<sup><a href="${source.uri}">[${sourceId}]</a></sup>`;
        }).join(' ');

        html += `
            <div style="border: 1px solid #ddd; border-radius: 8px; padding: 20px; margin-bottom: 20px; background-color: #f9f9f9; page-break-inside: avoid;">
                <h3 style="font-size: 22px; font-weight: bold; margin-top: 0; margin-bottom: 15px;">${card.title}</h3>
                <p><strong>Relevance:</strong> ${card.relevance}</p>
                <p><strong>Potential Impact:</strong> ${card.potentialImpact}</p>
                <p><strong>Success Criteria:</strong> ${card.successCriteria}</p>
                <strong>AI Solution Opportunities:</strong>
                <ul style="margin-top: 5px; padding-left: 20px;">
                    ${card.aiSolutionOpportunities.map(opp => `<li>${opp}</li>`).join('')}
                </ul>
                <p style="font-size: 14px; margin-top: 10px;"><strong>Sources:</strong> ${sourceLinks}</p>
            </div>
        `;
    });

    html += `
        <div style="page-break-before: always;"></div>
        <h2 style="font-size: 28px; font-weight: bold; margin-top: 40px; margin-bottom: 20px; border-bottom: 2px solid #ccc; padding-bottom: 10px;">Appendix: Sources & References</h2>
        <ol style="padding-left: 20px;">
            ${Array.from(allSources.entries()).map(([uri, title]) => `
                <li style="margin-bottom: 10px;">
                    <span style="font-weight: bold;">${title}</span><br/>
                    <a href="${uri}" style="color: #0066cc; text-decoration: none;">${uri}</a>
                </li>
            `).join('')}
        </ol>
    `;

    container.innerHTML = html;
    document.body.appendChild(container);
    return container;
};

export const generatePdf = async (agenda: AgendaItem[], selectedCards: ChallengeCardData[]) => {
    const printableElement = createPrintableElement(agenda, selectedCards);

    const canvas = await html2canvas(printableElement, {
        scale: 2,
        useCORS: true,
        windowWidth: printableElement.scrollWidth,
        windowHeight: printableElement.scrollHeight
    });

    document.body.removeChild(printableElement);

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const ratio = imgWidth / imgHeight;
    const canvasHeightInPdf = pdfWidth / ratio;
    
    let heightLeft = imgHeight * pdfWidth / imgWidth;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, heightLeft);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
        position = heightLeft - (imgHeight * pdfWidth / imgWidth);
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, (imgHeight * pdfWidth / imgWidth));
        heightLeft -= pdfHeight;
    }
    
    pdf.save('AI_Day_Plan.pdf');
};
