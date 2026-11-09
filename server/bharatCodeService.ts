import { 
  AIAnalysisResult, 
  ChatMessage, 
  ImportantChangeItem, 
  InconsistencyItem, 
  LineDiff, 
  LocalizedAnalysis, 
  MissingInfoItem 
} from './types';

const BHARATCODE_BASE_URL = process.env.BHARATCODE_BASE_URL || 'https://bharatcode.ai/api/model/v1';
const BHARATCODE_MODEL = process.env.BHARATCODE_MODEL || 'qwen-3.8-27b';

/**
 * Heuristic fallback analyzer when BharatCode API key is absent or unreachable.
 * Extracts high-confidence insights with Critical/Important/Minor severity,
 * whyItMatters explanations, and localized Hindi/Hinglish translations.
 */
export function analyzeWithLocalHeuristics(
  originalText: string,
  updatedText: string,
  lineDiffs: LineDiff[]
): AIAnalysisResult {
  const importantChanges: ImportantChangeItem[] = [];
  const missingInformation: MissingInfoItem[] = [];
  const inconsistencies: InconsistencyItem[] = [];
  const recommendations: string[] = [];

  const modifiedItems = lineDiffs.filter(d => d.type === 'modified');
  const removedItems = lineDiffs.filter(d => d.type === 'removed');
  const addedItems = lineDiffs.filter(d => d.type === 'added');

  let changeId = 1;

  // 1. Process modified items
  for (const item of modifiedItems) {
    const orig = item.originalText || '';
    const upd = item.updatedText || '';

    // Inherit classification from diffEngine if present
    const severity = item.severity || 'Important';
    const entityType = item.entityType || 'clause';
    const whyItMatters = item.whyItMatters || 'Modifications to wording directly alter the scope of the agreement.';
    const beforeValue = item.beforeValue || orig.trim();
    const afterValue = item.afterValue || upd.trim();

    // Determine category title
    let title = 'Clause Modification';
    let category = 'Contract Terms';

    if (entityType === 'amount') {
      title = 'Compensation & Monetary Revision';
      category = 'Financial';
    } else if (entityType === 'percentage') {
      title = 'Percentage / Rate Adjustment';
      category = 'Variable Compensation';
    } else if (entityType === 'date') {
      title = 'Timeline / Effective Date Update';
      category = 'Schedule';
    } else if (entityType === 'location') {
      title = 'Jurisdiction / Office Relocation';
      category = 'Location';
    } else if (entityType === 'role') {
      title = 'Title & Role Scope Revision';
      category = 'Role';
    } else if (entityType === 'numerical') {
      title = 'Duration & Term Condition Update';
      category = 'Term Duration';
    }

    importantChanges.push({
      id: `change_${changeId++}`,
      title,
      category,
      type: 'modified',
      severity,
      description: `Updated from "${orig.trim()}" to "${upd.trim()}".`,
      whyItMatters,
      entityType,
      beforeValue,
      afterValue,
      originalSnippet: orig.trim(),
      updatedSnippet: upd.trim(),
    });
  }

  // 2. Process removed items (Missing Information)
  for (const item of removedItems) {
    const text = (item.originalText || '').trim();
    if (text.length > 5) {
      const fieldMatch = text.match(/^([A-Za-z\s]+)[:=-]/);
      const fieldName = fieldMatch ? fieldMatch[1].trim() : 'Contractual Clause';

      missingInformation.push({
        field: fieldName,
        description: `Omitted in updated revision: "${text.slice(0, 90)}${text.length > 90 ? '...' : ''}".`,
        impact: 'Verify whether this clause was intentionally retired or accidentally dropped.',
      });

      importantChanges.push({
        id: `change_${changeId++}`,
        title: `Omitted: ${fieldName}`,
        category: 'Omission',
        type: 'removed',
        severity: item.severity || 'Important',
        description: `Deleted provision: "${text}".`,
        whyItMatters: item.whyItMatters || 'Removing a protection or clause changes party rights and liabilities.',
        entityType: item.entityType || 'clause',
        beforeValue: text,
        originalSnippet: text,
      });
    }
  }

  // 3. Process added items
  for (const item of addedItems) {
    const text = (item.updatedText || '').trim();
    if (text.length > 5) {
      const fieldMatch = text.match(/^([A-Za-z\s]+)[:=-]/);
      const fieldName = fieldMatch ? fieldMatch[1].trim() : 'New Provision';

      importantChanges.push({
        id: `change_${changeId++}`,
        title: `Added: ${fieldName}`,
        category: 'Addition',
        type: 'added',
        severity: item.severity || 'Important',
        description: `Newly inserted line: "${text}".`,
        whyItMatters: item.whyItMatters || 'Introduces new compliance obligations or operational scope.',
        entityType: item.entityType || 'clause',
        afterValue: text,
        updatedSnippet: text,
      });
    }
  }

  // 4. Inconsistency Detection
  const origHasSalary = /salary|ctc|annual/i.test(originalText);
  const updHasSalary = /salary|ctc|annual/i.test(updatedText);
  if (origHasSalary && !updHasSalary) {
    inconsistencies.push({
      issue: 'Compensation clause dropped entirely in updated document',
      detail: 'The original document contained explicit salary/compensation figures which are completely absent in the revised draft.',
      risk: 'Critical',
    });
  }

  const origNotice = originalText.match(/notice\s+period\s*[:=-]?\s*(\d+)/i);
  const updNotice = updatedText.match(/notice\s+period\s*[:=-]?\s*(\d+)/i);
  if (origNotice && updNotice && origNotice[1] !== updNotice[1]) {
    inconsistencies.push({
      issue: `Notice period shifted from ${origNotice[1]} days to ${updNotice[1]} days`,
      detail: 'The notice duration requirement was altered, directly impacting exit obligations and transition buffers.',
      risk: 'Important',
    });
  }

  // 5. Recommendations
  const hasCritical = importantChanges.some(c => c.severity === 'Critical') || inconsistencies.some(i => i.risk === 'Critical');
  const hasImportant = importantChanges.some(c => c.severity === 'Important');

  if (hasCritical) {
    recommendations.push('Cross-verify revised monetary amounts and liability caps directly with the issuing department head.');
  }
  if (missingInformation.length > 0) {
    recommendations.push('Confirm with legal/HR that all omitted sections were deliberately removed rather than accidentally cut.');
  }
  recommendations.push('Perform a final side-by-side spot check on all highlighted changes prior to execution.');

  const riskLevel: 'Low' | 'Medium' | 'High' = hasCritical ? 'High' : hasImportant ? 'Medium' : 'Low';

  const executiveSummary = `Comparison complete across documents. Found ${importantChanges.length} changes (${importantChanges.filter(c => c.severity === 'Critical').length} critical, ${importantChanges.filter(c => c.severity === 'Important').length} important). ${
    hasCritical
      ? 'Critical variances in financial terms, notice durations, or legal conditions were detected and require human verification.'
      : 'Modifications appear focused on routine operational updates.'
  }`;

  // 6. Multilingual local translations for Hindi and Hinglish
  const hindiSummary = `दस्तावेज़ तुलना पूर्ण हुई। कुल ${importantChanges.length} बदलाव पाए गए (${importantChanges.filter(c => c.severity === 'Critical').length} महत्वपूर्ण/क्रिटिकल)। ${
    hasCritical
      ? 'वित्तीय नियमों, नोटिस अवधि या कानूनी शर्तों में बड़े बदलाव मिले हैं जिन्हें सत्यापित करना अनिवार्य है।'
      : 'बदलाव मुख्य रूप से सामान्य कार्य संचालन से संबंधित हैं।'
  }`;

  const hinglishSummary = `Document comparison complete ho gaya hai. Total ${importantChanges.length} changes detect huye (${importantChanges.filter(c => c.severity === 'Critical').length} critical, ${importantChanges.filter(c => c.severity === 'Important').length} important). ${
    hasCritical
      ? 'Financial terms, notice period ya legal conditions mein critical changes mile hain jinhe verify karna zaroori hai.'
      : 'Changes routine operational updates se related hain.'
  }`;

  const multilingual: AIAnalysisResult['multilingual'] = {
    hi: {
      executiveSummary: hindiSummary,
      recommendations: [
        'संशोधित वित्तीय राशि और दायित्व सीमाओं को संबंधित विभाग प्रमुख से सत्यापित करें।',
        'हटाए गए अनुभागों की पुष्टि करें कि वे जानबूझकर हटाए गए हैं।',
        'हस्ताक्षर करने से पहले सभी हाइलाइट किए गए बदलावों की अंतिम समीक्षा करें।'
      ],
      importantChanges: importantChanges.slice(0, 10).map(c => ({
        title: c.title,
        description: c.description,
        whyItMatters: c.whyItMatters,
      })),
    },
    'hi-en': {
      executiveSummary: hinglishSummary,
      recommendations: [
        'Revised salary, financial figures aur liability limits ko issuing team se verify karein.',
        'Check karein ki jo clauses hataye gaye hain, wo intentionally remove huye hain ya accidental omit hain.',
        'Final signature se pehle side-by-side diff review zaroor karein.'
      ],
      importantChanges: importantChanges.slice(0, 10).map(c => ({
        title: c.title,
        description: c.description,
        whyItMatters: c.whyItMatters,
      })),
    },
  };

  return {
    executiveSummary,
    importantChanges: importantChanges.slice(0, 15),
    missingInformation: missingInformation.slice(0, 8),
    inconsistencies: inconsistencies.slice(0, 8),
    recommendations,
    riskLevel,
    aiEngine: 'local-heuristic-engine',
    isFallback: true,
    modelUsed: 'Local Change Intelligence Engine',
    multilingual,
  };
}

/**
 * Full analysis using BharatCode AI (qwen-3.8-27b) with graceful fallback.
 */
export async function analyzeWithBharatCodeAI(
  originalText: string,
  updatedText: string,
  lineDiffs: LineDiff[]
): Promise<AIAnalysisResult> {
  const apiKey = process.env.BHARATCODE_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_bharatcode_api_key_here') {
    return analyzeWithLocalHeuristics(originalText, updatedText, lineDiffs);
  }

  const diffSummary = lineDiffs
    .filter(d => d.type !== 'unchanged')
    .slice(0, 80)
    .map(d => `${d.type.toUpperCase()}: ${d.originalText ? `[Old: "${d.originalText}"] ` : ''}${d.updatedText ? `[New: "${d.updatedText}"]` : ''}`)
    .join('\n');

  const systemPrompt = `You are DocuCheck AI, an expert document change intelligence assistant.
Your task is to analyze two document versions and the differences extracted by the application.
Classify each change severity strictly as "Critical", "Important", or "Minor".
Explain WHY each change matters in 1-2 clear sentences.
Identify numerical changes, dates, percentages, amounts, names, and locations.
Provide before and after values accurately.
Never fabricate a change or claim legal risk without concrete textual evidence.
Return valid JSON matching this schema:
{
  "executiveSummary": "Concise summary in English",
  "importantChanges": [
    {
      "title": "Short title",
      "category": "Financial | Legal | Timeline | Scope | Terms",
      "type": "added" | "removed" | "modified",
      "severity": "Critical" | "Important" | "Minor",
      "description": "Clear factual description",
      "whyItMatters": "Clear explanation of business or legal impact",
      "entityType": "numerical" | "date" | "percentage" | "amount" | "location" | "role" | "clause",
      "beforeValue": "Previous value",
      "afterValue": "New value",
      "originalSnippet": "Original excerpt",
      "updatedSnippet": "Updated excerpt"
    }
  ],
  "missingInformation": [
    { "field": "Field name", "description": "What was omitted", "impact": "Why it matters" }
  ],
  "inconsistencies": [
    { "issue": "Short summary", "detail": "Detailed explanation", "risk": "Critical" | "Important" | "Minor" }
  ],
  "recommendations": ["Action item 1", "Action item 2"],
  "riskLevel": "Low" | "Medium" | "High",
  "multilingual": {
    "hi": {
      "executiveSummary": "Hindi summary in Devanagari",
      "recommendations": ["Hindi recommendation 1", "Hindi recommendation 2"]
    },
    "hi-en": {
      "executiveSummary": "Hinglish summary in Romanized Hindi",
      "recommendations": ["Hinglish recommendation 1", "Hinglish recommendation 2"]
    }
  }
}`;

  const userPrompt = `ORIGINAL DOCUMENT:
"""
${originalText.slice(0, 3500)}
"""

UPDATED DOCUMENT:
"""
${updatedText.slice(0, 3500)}
"""

EXTRACTED SYNTACTIC DIFFERENCES:
"""
${diffSummary}
"""`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 22000);

    const response = await fetch(`${BHARATCODE_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: BHARATCODE_MODEL,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.15,
        store: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`BharatCode API returned status ${response.status}, loading local heuristics.`);
      return analyzeWithLocalHeuristics(originalText, updatedText, lineDiffs);
    }

    const data = await response.json();
    const rawContent = data.choices?.[0]?.message?.content || '';

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return analyzeWithLocalHeuristics(originalText, updatedText, lineDiffs);
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return {
      executiveSummary: parsed.executiveSummary || 'Document comparison completed.',
      importantChanges: Array.isArray(parsed.importantChanges) ? parsed.importantChanges : [],
      missingInformation: Array.isArray(parsed.missingInformation) ? parsed.missingInformation : [],
      inconsistencies: Array.isArray(parsed.inconsistencies) ? parsed.inconsistencies : [],
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      riskLevel: ['Low', 'Medium', 'High'].includes(parsed.riskLevel) ? parsed.riskLevel : 'Low',
      aiEngine: 'bharatcode-qwen-3.8-27b',
      isFallback: false,
      modelUsed: `BharatCode ${BHARATCODE_MODEL}`,
      multilingual: parsed.multilingual || analyzeWithLocalHeuristics(originalText, updatedText, lineDiffs).multilingual,
    };
  } catch (err) {
    console.error('BharatCode AI request failed:', err);
    return analyzeWithLocalHeuristics(originalText, updatedText, lineDiffs);
  }
}

/**
 * Chat with Your Documents: Answers questions grounded strictly in the extracted document text
 * with evidence quotes.
 */
export async function chatWithDocuments(
  originalText: string,
  updatedText: string,
  originalDocumentName: string,
  updatedDocumentName: string,
  messages: ChatMessage[]
): Promise<{ answer: string; evidenceSnippets: string[] }> {
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const apiKey = process.env.BHARATCODE_API_KEY;

  if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_bharatcode_api_key_here') {
    try {
      const systemPrompt = `You are DocuCheck AI Assistant. You have full access to two compared documents:
Original Document: "${originalDocumentName}"
Updated Document: "${updatedDocumentName}"

Rules:
1. Answer the user's question directly, factually, and concisely.
2. Rely ONLY on the provided text of both documents.
3. If information is not found in the documents, state that clearly without guessing.
4. Extract 1 to 3 exact textual sentences from the documents as evidence snippets.
5. Return JSON format:
{
  "answer": "Your direct, factual answer",
  "evidenceSnippets": ["Exact quote from document 1", "Exact quote from document 2"]
}`;

      const chatHistory = messages.slice(-5).map(m => ({
        role: m.role === 'user' ? 'user' : 'assistant',
        content: m.content,
      }));

      const userContextMessage = `DOCUMENT 1 (ORIGINAL: ${originalDocumentName}):
"""
${originalText.slice(0, 3000)}
"""

DOCUMENT 2 (UPDATED: ${updatedDocumentName}):
"""
${updatedText.slice(0, 3000)}
"""

USER QUESTION:
${lastUserMessage}`;

      const response = await fetch(`${BHARATCODE_BASE_URL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: BHARATCODE_MODEL,
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatHistory.slice(0, -1),
            { role: 'user', content: userContextMessage },
          ],
          temperature: 0.2,
          store: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content || '';
        const match = content.match(/\{[\s\S]*\}/);
        if (match) {
          const parsed = JSON.parse(match[0]);
          return {
            answer: parsed.answer || content,
            evidenceSnippets: Array.isArray(parsed.evidenceSnippets) ? parsed.evidenceSnippets : [],
          };
        }
        return { answer: content, evidenceSnippets: [] };
      }
    } catch (apiErr) {
      console.warn('BharatCode Chat API error, using local grounding retriever:', apiErr);
    }
  }

  // Local Grounded Keyword Retrieval Fallback
  const q = lastUserMessage.toLowerCase();
  const evidenceSnippets: string[] = [];
  let answer = '';

  const origLines = originalText.split('\n').filter(l => l.trim().length > 0);
  const updLines = updatedText.split('\n').filter(l => l.trim().length > 0);

  if (q.includes('biggest change') || q.includes('important') || q.includes('summary') || q.includes('summarize')) {
    const changedLines: string[] = [];
    updLines.forEach(ul => {
      if (!origLines.includes(ul)) {
        changedLines.push(ul);
        if (evidenceSnippets.length < 3) evidenceSnippets.push(ul);
      }
    });

    answer = `Based on both documents, the most noticeable updates in **${updatedDocumentName}** include: ${
      changedLines.slice(0, 3).map(c => `**${c}**`).join(', ') || 'revisions across the text structure'
    }.`;
  } else if (q.includes('salary') || q.includes('compensation') || q.includes('ctc') || q.includes('amount') || q.includes('pay')) {
    const origSalary = origLines.find(l => /salary|compensation|ctc|₹|\$|€|rs\./i.test(l));
    const updSalary = updLines.find(l => /salary|compensation|ctc|₹|\$|€|rs\./i.test(l));

    if (origSalary && updSalary) {
      evidenceSnippets.push(`Original: "${origSalary}"`);
      evidenceSnippets.push(`Updated: "${updSalary}"`);
      answer = `The compensation terms changed from **${origSalary}** in the original document to **${updSalary}** in the updated version.`;
    } else if (updSalary) {
      evidenceSnippets.push(`Updated: "${updSalary}"`);
      answer = `The updated document specifies compensation as: **${updSalary}**.`;
    } else {
      answer = 'No explicit salary or monetary compensation clause was found in the analyzed documents.';
    }
  } else if (q.includes('location') || q.includes('office') || q.includes('city') || q.includes('jurisdiction') || q.includes('where')) {
    const origLoc = origLines.find(l => /location|office|city|jurisdiction|courts of/i.test(l));
    const updLoc = updLines.find(l => /location|office|city|jurisdiction|courts of/i.test(l));

    if (origLoc && updLoc) {
      evidenceSnippets.push(`Original: "${origLoc}"`);
      evidenceSnippets.push(`Updated: "${updLoc}"`);
      answer = `The location/jurisdiction changed from **${origLoc}** in the original document to **${updLoc}** in the updated version.`;
    } else {
      answer = 'Location details appear consistent or are not explicitly stated in dedicated clauses.';
    }
  } else if (q.includes('notice') || q.includes('probation') || q.includes('period') || q.includes('term')) {
    const origTerm = origLines.find(l => /notice|probation|term of/i.test(l));
    const updTerm = updLines.find(l => /notice|probation|term of/i.test(l));

    if (origTerm && updTerm) {
      evidenceSnippets.push(`Original: "${origTerm}"`);
      evidenceSnippets.push(`Updated: "${updTerm}"`);
      answer = `The duration terms modified from **${origTerm}** in the original to **${updTerm}** in the updated document.`;
    } else {
      answer = 'Term and duration clauses were inspected and remain unchanged.';
    }
  } else if (q.includes('removed') || q.includes('deleted') || q.includes('missing') || q.includes('omitted')) {
    const removedLines = origLines.filter(ol => !updLines.includes(ol));
    if (removedLines.length > 0) {
      removedLines.slice(0, 3).forEach(rl => evidenceSnippets.push(`Original clause removed: "${rl}"`));
      answer = `The following clauses were present in the original document but are absent in the updated version:\n\n${removedLines.slice(0, 3).map(r => `- **${r}**`).join('\n')}`;
    } else {
      answer = 'No entire sections or clauses appear to have been dropped between the two versions.';
    }
  } else {
    // General keyword match search across both documents
    const words = q.split(/\s+/).filter(w => w.length > 3);
    const matchedUpd = updLines.find(l => words.some(w => l.toLowerCase().includes(w)));
    const matchedOrig = origLines.find(l => words.some(w => l.toLowerCase().includes(w)));

    if (matchedUpd || matchedOrig) {
      if (matchedOrig) evidenceSnippets.push(`Original: "${matchedOrig}"`);
      if (matchedUpd) evidenceSnippets.push(`Updated: "${matchedUpd}"`);
      answer = `Regarding your inquiry, the updated document states: **${matchedUpd || matchedOrig}**.`;
    } else {
      answer = `I examined both **${originalDocumentName}** and **${updatedDocumentName}**. Could you clarify your question? You can ask about salary changes, location shifts, notice periods, or omitted clauses.`;
    }
  }

  return { answer, evidenceSnippets };
}
