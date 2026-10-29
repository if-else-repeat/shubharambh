/**
 * Input sanitization and financial formatting utilities for shubharambh.
 */

/**
 * Strips dangerous HTML tags, raw angle brackets, and javascript: protocols
 * from user input before rendering or processing in prompt context.
 *
 * @param input Raw text string from input controls
 * @returns Clean, trimmed string safe for rendering and storage
 *
 * @example
 * sanitizeInput('<script>alert("xss")</script>Hello') // returns 'Hello'
 */
export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/<[^>]*>/g, '') // Strip complete HTML tags
    .replace(/[<>]/g, '') // Strip any remaining angle brackets
    .replace(/javascript:/gi, '')
    .trim();
}

/**
 * Formats a numeric currency amount into standard Indian Rupee notation (en-IN),
 * prefixing negative signs and INR symbol.
 *
 * @param amount Numeric currency value in INR
 * @returns Formatted currency string (e.g. ₹15,00,000 or -₹25,000)
 *
 * @example
 * formatRupees(1500000) // returns '₹15,00,000'
 * formatRupees(-500)    // returns '-₹500'
 */
export function formatRupees(amount: number): string {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '₹0';
  }
  const isNegative = amount < 0;
  const absAmount = Math.abs(Math.round(amount));
  const formatted = absAmount.toLocaleString('en-IN');
  return `${isNegative ? '-' : ''}₹${formatted}`;
}
