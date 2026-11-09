import { ComparisonRecord } from '../types/comparison';

const STORAGE_KEY = 'docucheck_comparisons_history';

export function getStoredComparisons(): ComparisonRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse comparison history:', e);
    return [];
  }
}

export function saveComparison(record: ComparisonRecord): void {
  try {
    const existing = getStoredComparisons();
    const updated = [record, ...existing.filter(item => item.id !== record.id)].slice(0, 30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save comparison record:', e);
  }
}

export function deleteComparison(id: string): ComparisonRecord[] {
  try {
    const existing = getStoredComparisons();
    const filtered = existing.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return filtered;
  } catch (e) {
    console.error('Failed to delete comparison record:', e);
    return [];
  }
}

export function clearComparisonHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.error('Failed to clear history:', e);
  }
}
