import { AgendaItem, ChallengeCardData } from '../types';

export const generateMarkdown = (agenda: AgendaItem[], selectedCards: ChallengeCardData[], customerName: string) => {
    let md = `# AI Day Plan: ${customerName}\n\n`;

    md += '---\n\n';

    // Agenda
    md += `## Agenda\n\n`;
    md += `| Time | Topic | Presenter | Description |\n`;
    md += `|------|-------|-----------|-------------|\n`;
    agenda.forEach(item => {
        md += `| ${item.time} | ${item.topic} | ${item.presenter} | ${item.description.replace(/\n/g, '<br />')} |\n`;
    });
    md += '\n';

    // Challenge Cards
    if (selectedCards.length > 0) {
        md += '---\n\n';
        md += '## Workshop Challenge Cards\n\n';

        const allSources = new Map<string, string>();
        selectedCards.forEach(card => card.supportingSources.forEach(source => {
            if (!allSources.has(source.uri)) {
                allSources.set(source.uri, source.title);
            }
        }));
        const sourceUriToId = new Map(Array.from(allSources.keys()).map((uri, i) => [uri, i + 1]));

        selectedCards.forEach(card => {
            const sourceLinks = card.supportingSources.map(source => `[<sup>[${sourceUriToId.get(source.uri)}]</sup>](${source.uri})`).join(' ');

            md += `### ${card.title}\n\n`;
            md += `**Relevance:** ${card.relevance}\n\n`;
            md += `**Potential Impact:** ${card.potentialImpact}\n\n`;
            md += `**Success Criteria:** ${card.successCriteria}\n\n`;
            md += `**AI Solution Opportunities:**\n`;
            card.aiSolutionOpportunities.forEach(opp => {
                md += `* ${opp}\n`;
            });
            md += `\n**Sources:** ${sourceLinks}\n\n`;
            md += '---\n\n';
        });

        // Appendix
        if (allSources.size > 0) {
            md += '## Appendix: Sources\n\n';
            Array.from(allSources.entries()).forEach(([uri, title]) => {
                md += `${sourceUriToId.get(uri)}. **${title}**: <${uri}>\n`;
            });
            md += '\n';
        }
    }

    // Download logic
    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `AI_Day_Plan_${customerName.replace(/\s/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
