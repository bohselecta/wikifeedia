/**
 * Content utilities for Wikifeedia
 */

export const categories = [
  { name: 'All', value: null, color: '#3b82f6' },
  { name: 'History', value: 'History', color: '#8b4513' },
  { name: 'Nature', value: 'Nature', color: '#228b22' },
  { name: 'Science', value: 'Science', color: '#4169e1' },
  { name: 'Technology', value: 'Technology', color: '#32cd32' },
  { name: 'Culture', value: 'Culture', color: '#ff69b4' },
  { name: 'Biography', value: 'Biography', color: '#ff8c00' },
  { name: 'Mystery', value: 'Mystery', color: '#9370db' },
]

export function getCategoryColor(category: string | null): string {
  const cat = categories.find(c => c.value === category)
  return cat?.color || '#666'
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

export function formatNumber(num: number): string {
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'k'
  }
  return num.toString()
}

