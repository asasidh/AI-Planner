import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { AgendaItem, ChallengeCardData } from '../types';

// This function creates a temporary, off-screen element for rendering
const createPrintableElement = (agenda: AgendaItem[], selectedCards: ChallengeCardData[], customerName: string): HTMLElement => {
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.width = '1240px'; // A bit wider for presentation layout
    container.style.fontFamily = 'sans-serif';
    container.style.color = '#333';
    container.style.backgroundColor = '#fff';

    const slideBaseStyle = `width: 1200px; height: 675px; padding: 50px; border: 1px solid #eee; margin-bottom: 20px; display: flex; flex-direction: column; background-color: #fdfdfd; page-break-after: always;`;

    // --- Title Slide ---
    let html = `
        <div style="${slideBaseStyle} justify-content: center; align-items: center; text-align: center;">
            <h1 style="font-size: 64px; font-weight: bold; color: #1e3a8a;">AI Day Plan</h1>
            <p style="font-size: 32px; margin-top: 20px; color: #4b5563;">Prepared for</p>
            <p style="font-size: 48px; font-weight: bold; margin-top: 10px; color: #1e3a8a;">${customerName}</p>
        </div>
    `;

    // --- Agenda Slide ---
    html += `
        <div style="${slideBaseStyle}">
            <h2 style="font-size: 48px; font-weight: bold; margin-bottom: 30px; color: #1e3a8a;">Agenda</h2>
            <table style="width: 100%; border-collapse: collapse; font-size: 18px;">
                <thead>
                    <tr style="background-color: #e0e7ff;">
                        <th style="padding: 16px; border-bottom: 2px solid #a5b4fc; text-align: left; width: 15%;">Time</th>
                        <th style="padding: 16px; border-bottom: 2px solid #a5b4fc; text-align: left; width: 30%;">Topic</th>
                        <th style="padding: 16px; border-bottom: 2px solid #a5b4fc; text-align: left; width: 20%;">Presenter</th>
                        <th style="padding: 16px; border-bottom: 2px solid #a5b4fc; text-align: left; width: 35%;">Description</th>
                    </tr>
                </thead>
                <tbody>
                    ${agenda.map(item => `
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding: 16px; vertical-align: top;">${item.time}</td>
                            <td style="padding: 16px; vertical-align: top; font-weight: 500;">${item.topic}</td>
                            <td style="padding: 16px; vertical-align: top;">${item.presenter}</td>
                            <td style="padding: 16px; vertical-align: top;">${item.description}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    const allSources = new Map<string, string>();
    selectedCards.forEach(card => card.supportingSources.forEach(source => {
        if (!allSources.has(source.uri)) {
            allSources.set(source.uri, source.title);
        }
    }));
    const sourceUriToId = new Map(Array.from(allSources.keys()).map((uri, i) => [uri, `S${i + 1}`]));

    // --- Challenge Card Slides ---
    selectedCards.forEach((card) => {
        const sourceLinks = card.supportingSources.map(source => {
            const sourceId = sourceUriToId.get(source.uri);
            return `<sup><a href="${source.uri}" style="color: #4f46e5; text-decoration: none;">[${sourceId}]</a></sup>`;
        }).join(' ');

        html += `
            <div style="${slideBaseStyle}">
                 <h2 style="font-size: 48px; font-weight: bold; margin-bottom: 30px; color: #1e3a8a;">Challenge Card</h2>
                 <h3 style="font-size: 32px; font-weight: bold; margin-top: 0; margin-bottom: 25px; color: #374151;">${card.title}</h3>
                 <div style="font-size: 18px; line-height: 1.6; display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                    <div><p><strong>Relevance:</strong> ${card.relevance}</p></div>
                    <div><p><strong>Potential Impact:</strong> ${card.potentialImpact}</p></div>
                    <div><p><strong>Success Criteria:</strong> ${card.successCriteria}</p></div>
                    <div>
                        <strong>AI Solution Opportunities:</strong>
                        <ul style="margin-top: 5px; padding-left: 20px;">
                            ${card.aiSolutionOpportunities.map(opp => `<li>${opp}</li>`).join('')}
                        </ul>
                    </div>
                 </div>
                 <p style="font-size: 16px; margin-top: auto; padding-top: 20px;"><strong>Sources:</strong> ${sourceLinks}</p>
            </div>
        `;
    });

    // --- Appendix Slide ---
    if (allSources.size > 0) {
        html += `
            <div style="${slideBaseStyle}">
                <h2 style="font-size: 48px; font-weight: bold; margin-bottom: 30px; color: #1e3a8a;">Appendix: Sources</h2>
                <ol style="padding-left: 20px; font-size: 16px; columns: 2; gap: 40px;">
                    ${Array.from(allSources.entries()).map(([uri, title]) => `
                        <li style="margin-bottom: 15px;">
                            <span style="font-weight: bold;">[${sourceUriToId.get(uri)}] ${title}</span><br/>
                            <a href="${uri}" style="color: #4f46e5; text-decoration: none; font-size: 14px; word-break: break-all;">${uri}</a>
                        </li>
                    `).join('')}
                </ol>
            </div>
        `;
    }

    container.innerHTML = html;
    document.body.appendChild(container);
    return container;
};

export const generatePdf = async (agenda: AgendaItem[], selectedCards: ChallengeCardData[], customerName: string) => {
    const printableElement = createPrintableElement(agenda, selectedCards, customerName);

    const canvas = await html2canvas(printableElement, {
        scale: 2,
        useCORS: true,
        windowWidth: printableElement.scrollWidth,
        windowHeight: printableElement.scrollHeight
    });

    document.body.removeChild(printableElement);

    const imgData = canvas.toDataURL('image/png');
    // Using landscape orientation for presentation style
    const pdf = new jsPDF('l', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // The printable element contains multiple "slides" vertically.
    // Each slide's height in the canvas is (canvasWidth * 9/16) if we assume 16:9.
    // The element height is 675px + 20px margin, width is 1200px. Aspect ratio is 1200/695.
    // Let's calculate based on the number of slides.
    const numSlides = 1 + 1 + selectedCards.length + (Array.from(selectedCards).length > 0 ? 1 : 0);
    const totalHeightOfSlidesInDOM = printableElement.scrollHeight; // approximately numSlides * (675 + 20)
    const heightOfOneSlideOnCanvas = canvasHeight / numSlides;

    let yPosition = 0;

    for (let i = 0; i < numSlides; i++) {
        if (i > 0) {
            pdf.addPage();
        }
        const sourceY = i * heightOfOneSlideOnCanvas;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvasWidth;
        tempCanvas.height = heightOfOneSlideOnCanvas;
        const tempCtx = tempCanvas.getContext('2d');
        if (tempCtx) {
            tempCtx.drawImage(canvas, 0, sourceY, canvasWidth, heightOfOneSlideOnCanvas, 0, 0, canvasWidth, heightOfOneSlideOnCanvas);
            const slideImgData = tempCanvas.toDataURL('image/png');
            pdf.addImage(slideImgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        }
    }
    
    pdf.save(`AI_Day_Plan_${customerName.replace(/\s/g, '_')}.pdf`);
};
