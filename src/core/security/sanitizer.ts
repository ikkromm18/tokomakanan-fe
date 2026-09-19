import DOMPurify from 'dompurify';

/**
 * Sanitizes input string to prevent XSS (Cross-Site Scripting).
 * Safe for rendering order notes, customer remarks, or store receipt footers.
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'br', 'p', 'span'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class'],
  });
}

/**
 * Strips all HTML tags and returns plain text.
 */
export function sanitizePlainText(dirty: string): string {
  if (!dirty) return '';
  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
  }).trim();
}
