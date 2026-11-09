import * as jsdiff from 'diff';
import { ChangeSeverity, ComparisonStatistics, EntityType, LineDiff } from './types';

interface EntityAnnotation {
  severity: ChangeSeverity;
  entityType: EntityType;
  whyItMatters: string;
  beforeValue?: string;
  afterValue?: string;
}

/**
 * Analyzes a text difference to classify severity, detected entity type, and why it matters.
 */
function classifyDifference(
  origText: string = '',
  updText: string = '',
  type: 'added' | 'removed' | 'modified'
): EntityAnnotation {
  const combined = `${origText} ${updText}`.toLowerCase();

  // 1. Financial / Compensation / Currency Amount
  const currencyRegex = /(?:₹|\$|€|rs\.?)\s*[\d,]+(?:\.\d+)?(?:\s*(?:lakh|lac|cr|crore|k|m|million))?|\b(?:salary|ctc|compensation|indemnif|remuneration|fee|cost|price|liability)\b/i;
  if (currencyRegex.test(combined)) {
    const origMatch = origText.match(/(?:[₹$€]|rs\.?)\s*[\d,]+(?:\.\d+)?(?:\s*(?:lakh|lac|cr|crore|k|m|million))?/i)?.[0];
    const updMatch = updText.match(/(?:[₹$€]|rs\.?)\s*[\d,]+(?:\.\d+)?(?:\s*(?:lakh|lac|cr|crore|k|m|million))?/i)?.[0];

    return {
      severity: 'Critical',
      entityType: 'amount',
      whyItMatters: 'Financial commitments and monetary liabilities directly impact operational budget and contractual exposure.',
      beforeValue: origMatch || origText.trim() || undefined,
      afterValue: updMatch || updText.trim() || undefined,
    };
  }

  // 2. Percentages & Rate Modifications
  const percentRegex = /\b\d+(?:\.\d+)?\s*%/;
  if (percentRegex.test(combined) || combined.includes('percent') || combined.includes('bonus')) {
    const origMatch = origText.match(percentRegex)?.[0];
    const updMatch = updText.match(percentRegex)?.[0];

    return {
      severity: 'Important',
      entityType: 'percentage',
      whyItMatters: 'Percentage and bonus revisions affect recurring compensation margins and variable performance benchmarks.',
      beforeValue: origMatch || origText.trim() || undefined,
      afterValue: updMatch || updText.trim() || undefined,
    };
  }

  // 3. Calendar Dates & Milestones
  const dateRegex = /\b(?:\d{1,2}[\s/-]+(?:jan(?:uary)?|feb(?:ruary)?|mar(?:ch)?|apr(?:il)?|may|jun(?:e)?|jul(?:y)?|aug(?:ust)?|sep(?:tember)?|oct(?:ober)?|nov(?:ember)?|dec(?:ember)?)[\s/,-]+\d{2,4}|\d{1,2}[/-]\d{1,2}[/-]\d{2,4}|\d{4}-\d{2}-\d{2})\b/i;
  if (dateRegex.test(combined) || combined.includes('effective date') || combined.includes('joining date') || combined.includes('expiry')) {
    const origMatch = origText.match(dateRegex)?.[0];
    const updMatch = updText.match(dateRegex)?.[0];

    return {
      severity: 'Important',
      entityType: 'date',
      whyItMatters: 'Effective dates and scheduling milestones govern legal validity, start dates, and statutory limitation windows.',
      beforeValue: origMatch || origText.trim() || undefined,
      afterValue: updMatch || updText.trim() || undefined,
    };
  }

  // 4. Numerical Durations & Time Spans (Notice period, Confidentiality Term, Probation)
  const durationRegex = /\b\d+\s*(?:day|days|month|months|year|years|week|weeks|hour|hours)\b/i;
  if (durationRegex.test(combined) || combined.includes('notice period') || combined.includes('term of confidentiality') || combined.includes('probation')) {
    const origMatch = origText.match(durationRegex)?.[0];
    const updMatch = updText.match(durationRegex)?.[0];

    const isHighImpact = combined.includes('notice') || combined.includes('term') || combined.includes('confidentiality');
    return {
      severity: isHighImpact ? 'Critical' : 'Important',
      entityType: 'numerical',
      whyItMatters: isHighImpact
        ? 'Term and notice adjustments alter post-termination obligations, confidentiality windows, and transition periods.'
        : 'Numerical revisions adjust duration periods and delivery timelines.',
      beforeValue: origMatch || origText.trim() || undefined,
      afterValue: updMatch || updText.trim() || undefined,
    };
  }

  // 5. Locations & Legal Jurisdictions
  const locationRegex = /\b(?:location|work location|office|city|jurisdiction|courts? of|venue|headquarters)\b/i;
  if (locationRegex.test(combined)) {
    return {
      severity: 'Important',
      entityType: 'location',
      whyItMatters: 'Location and governing law determine tax liability, physical reporting obligations, and judicial dispute venue.',
      beforeValue: origText.trim() || undefined,
      afterValue: updText.trim() || undefined,
    };
  }

  // 6. Role, Scope & Organization
  const roleRegex = /\b(?:department|designation|title|role|position|scope|division)\b/i;
  if (roleRegex.test(combined)) {
    return {
      severity: 'Important',
      entityType: 'role',
      whyItMatters: 'Designation and organizational changes reassign employee responsibilities and reporting hierarchies.',
      beforeValue: origText.trim() || undefined,
      afterValue: updText.trim() || undefined,
    };
  }

  // 7. General Clause Changes
  const hasCriticalKeyword = /\b(?:confidential|indemn|breach|terminat|non-compete|governing law|warrant)\b/i.test(combined);
  return {
    severity: hasCriticalKeyword ? 'Critical' : type === 'removed' ? 'Important' : 'Minor',
    entityType: 'clause',
    whyItMatters: type === 'removed'
      ? 'An entire provision present in the original document was deleted in the updated revision.'
      : type === 'added'
      ? 'A new contractual requirement or clause was introduced in the updated version.'
      : 'Wording or phrasing was updated between document versions.',
    beforeValue: origText.trim() || undefined,
    afterValue: updText.trim() || undefined,
  };
}

/**
 * Compares two normalized text versions and returns line-by-line diffs
 * along with quantitative change statistics.
 */
export function computeDocumentDiff(
  originalText: string,
  updatedText: string
): {
  lineDiffs: LineDiff[];
  statistics: ComparisonStatistics;
} {
  const originalLines = originalText ? originalText.split('\n') : [];
  const updatedLines = updatedText ? updatedText.split('\n') : [];

  const rawLineDiffs = jsdiff.diffLines(originalText, updatedText, {
    newlineIsToken: false,
    ignoreWhitespace: false,
  });

  const lineDiffs: LineDiff[] = [];
  let origLineNum = 1;
  let updLineNum = 1;
  let diffIdCounter = 1;

  let addedCount = 0;
  let removedCount = 0;
  let modifiedCount = 0;
  let unchangedCount = 0;

  let criticalCount = 0;
  let importantCount = 0;
  let minorCount = 0;

  let i = 0;
  while (i < rawLineDiffs.length) {
    const current = rawLineDiffs[i];
    const next = rawLineDiffs[i + 1];

    // Check if a removed chunk is immediately followed by an added chunk
    // representing a modified section
    if (current.removed && next && next.added) {
      const removedTextLines = current.value.replace(/\n$/, '').split('\n');
      const addedTextLines = next.value.replace(/\n$/, '').split('\n');

      const maxLen = Math.max(removedTextLines.length, addedTextLines.length);
      for (let k = 0; k < maxLen; k++) {
        const origT = removedTextLines[k];
        const updT = addedTextLines[k];

        if (origT !== undefined && updT !== undefined) {
          const annotation = classifyDifference(origT, updT, 'modified');
          if (annotation.severity === 'Critical') criticalCount++;
          else if (annotation.severity === 'Important') importantCount++;
          else minorCount++;

          lineDiffs.push({
            id: `diff_${diffIdCounter++}`,
            type: 'modified',
            originalNumber: origLineNum++,
            updatedNumber: updLineNum++,
            originalText: origT,
            updatedText: updT,
            severity: annotation.severity,
            entityType: annotation.entityType,
            whyItMatters: annotation.whyItMatters,
            beforeValue: annotation.beforeValue,
            afterValue: annotation.afterValue,
          });
          modifiedCount++;
        } else if (origT !== undefined) {
          const annotation = classifyDifference(origT, '', 'removed');
          if (annotation.severity === 'Critical') criticalCount++;
          else if (annotation.severity === 'Important') importantCount++;
          else minorCount++;

          lineDiffs.push({
            id: `diff_${diffIdCounter++}`,
            type: 'removed',
            originalNumber: origLineNum++,
            originalText: origT,
            severity: annotation.severity,
            entityType: annotation.entityType,
            whyItMatters: annotation.whyItMatters,
            beforeValue: annotation.beforeValue,
          });
          removedCount++;
        } else if (updT !== undefined) {
          const annotation = classifyDifference('', updT, 'added');
          if (annotation.severity === 'Critical') criticalCount++;
          else if (annotation.severity === 'Important') importantCount++;
          else minorCount++;

          lineDiffs.push({
            id: `diff_${diffIdCounter++}`,
            type: 'added',
            updatedNumber: updLineNum++,
            updatedText: updT,
            severity: annotation.severity,
            entityType: annotation.entityType,
            whyItMatters: annotation.whyItMatters,
            afterValue: annotation.afterValue,
          });
          addedCount++;
        }
      }
      i += 2;
      continue;
    }

    const lines = current.value.replace(/\n$/, '').split('\n');
    if (current.added) {
      for (const line of lines) {
        const annotation = classifyDifference('', line, 'added');
        if (annotation.severity === 'Critical') criticalCount++;
        else if (annotation.severity === 'Important') importantCount++;
        else minorCount++;

        lineDiffs.push({
          id: `diff_${diffIdCounter++}`,
          type: 'added',
          updatedNumber: updLineNum++,
          updatedText: line,
          severity: annotation.severity,
          entityType: annotation.entityType,
          whyItMatters: annotation.whyItMatters,
          afterValue: annotation.afterValue,
        });
        addedCount++;
      }
    } else if (current.removed) {
      for (const line of lines) {
        const annotation = classifyDifference(line, '', 'removed');
        if (annotation.severity === 'Critical') criticalCount++;
        else if (annotation.severity === 'Important') importantCount++;
        else minorCount++;

        lineDiffs.push({
          id: `diff_${diffIdCounter++}`,
          type: 'removed',
          originalNumber: origLineNum++,
          originalText: line,
          severity: annotation.severity,
          entityType: annotation.entityType,
          whyItMatters: annotation.whyItMatters,
          beforeValue: annotation.beforeValue,
        });
        removedCount++;
      }
    } else {
      for (const line of lines) {
        lineDiffs.push({
          type: 'unchanged',
          originalNumber: origLineNum++,
          updatedNumber: updLineNum++,
          originalText: line,
          updatedText: line,
        });
        unchangedCount++;
      }
    }
    i++;
  }

  // Calculate word counts
  const origWords = originalText.trim().length > 0 ? originalText.trim().split(/\s+/).length : 0;
  const updWords = updatedText.trim().length > 0 ? updatedText.trim().split(/\s+/).length : 0;
  const totalChanges = addedCount + removedCount + modifiedCount;

  // Similarity score using character or word Jaccard / Levenshtein approximation
  const totalLines = Math.max(originalLines.length + updatedLines.length, 1);
  const similarityScore = Math.max(
    0,
    Math.min(100, Math.round(((unchangedCount * 2) / totalLines) * 100))
  );

  const statistics: ComparisonStatistics = {
    totalChanges,
    criticalChanges: criticalCount,
    importantChanges: importantCount,
    minorChanges: minorCount,
    addedLines: addedCount,
    removedLines: removedCount,
    modifiedLines: modifiedCount,
    unchangedLines: unchangedCount,
    originalWordCount: origWords,
    updatedWordCount: updWords,
    wordCountDifference: updWords - origWords,
    similarityScore: isNaN(similarityScore) ? 100 : similarityScore,
  };

  return { lineDiffs, statistics };
}
