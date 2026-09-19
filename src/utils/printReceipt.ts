/**
 * Thermal Receipt Printing Utility
 * Isolates the receipt in a hidden iframe to print ONLY the receipt paper
 * without any parent page elements (navbar, sidebar, POS catalog, modals, etc.).
 */

export interface PrintReceiptOptions {
  thermalWidth: '80mm' | '58mm';
  title?: string;
}

export function printReceiptElement(
  element: HTMLElement,
  options: PrintReceiptOptions
): Promise<void> {
  return new Promise((resolve) => {
    // Clean up any lingering print iframes
    const existingIframe = document.getElementById('thermal-receipt-print-iframe');
    if (existingIframe) {
      existingIframe.remove();
    }

    const { thermalWidth, title = 'Struk Transaksi' } = options;
    const is80mm = thermalWidth === '80mm';
    const paperWidth = is80mm ? '78mm' : '56mm';
    const baseFontSize = is80mm ? '12px' : '10px';

    // Create a hidden iframe for print isolation
    const iframe = document.createElement('iframe');
    iframe.id = 'thermal-receipt-print-iframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.setAttribute('aria-hidden', 'true');
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      resolve();
      return;
    }

    // Get the inner content of the receipt
    const receiptHtml = element.innerHTML;

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            @page {
              size: ${is80mm ? '80mm auto' : '58mm auto'};
              margin: 0;
            }
            *, *::before, *::after {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            html, body {
              width: ${paperWidth} !important;
              max-width: ${paperWidth} !important;
              margin: 0 auto !important;
              padding: 2mm 1mm !important;
              background: #ffffff !important;
              color: #000000 !important;
              font-family: 'Courier New', Courier, monospace, monospace !important;
              font-size: ${baseFontSize} !important;
              line-height: 1.25 !important;
              -webkit-print-color-adjust: exact;
              print-color-adjust: exact;
            }

            /* Layout Utilities */
            .flex { display: flex !important; }
            .justify-between { justify-content: space-between !important; }
            .items-center { align-items: center !important; }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .text-left { text-align: left !important; }

            /* Typography */
            .font-bold { font-weight: bold !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            .uppercase { text-transform: uppercase !important; }
            .tracking-wide { letter-spacing: 0.025em !important; }
            .italic { font-style: italic !important; }
            .font-mono { font-family: 'Courier New', Courier, monospace !important; }

            /* Font Sizes */
            .text-sm { font-size: ${is80mm ? '13px' : '11px'} !important; }
            .text-xs { font-size: ${is80mm ? '11px' : '9.5px'} !important; }
            .text-\\[11px\\] { font-size: ${is80mm ? '11px' : '9.5px'} !important; }
            .text-\\[10px\\] { font-size: ${is80mm ? '10px' : '8.5px'} !important; }
            .text-\\[9px\\] { font-size: ${is80mm ? '9px' : '7.5px'} !important; }

            /* Spacing */
            .space-y-0\\.5 > * + * { margin-top: 2px !important; }
            .space-y-1 > * + * { margin-top: 4px !important; }
            .space-y-1\\.5 > * + * { margin-top: 6px !important; }
            .space-y-2 > * + * { margin-top: 8px !important; }
            .pl-2 { padding-left: 6px !important; }
            .py-1 { padding-top: 3px !important; padding-bottom: 3px !important; }
            .py-2 { padding-top: 5px !important; padding-bottom: 5px !important; }
            .pb-2 { padding-bottom: 5px !important; }
            .pt-1 { padding-top: 3px !important; }
            .pt-2 { padding-top: 5px !important; }
            .mt-1 { margin-top: 3px !important; }

            /* Thermal Printer Dashed Dividers */
            .border-b { border-bottom: 1px dashed #000000 !important; }
            .border-t { border-top: 1px dashed #000000 !important; }
            .border-dashed { border-style: dashed !important; border-color: #000000 !important; }

            /* Strip Screen Preview Styles */
            .border-stone-200, .border-stone-300, .border-stone-400 {
              border-color: #000000 !important;
            }
            .text-stone-900, .text-stone-800, .text-stone-700,
            .text-stone-600, .text-stone-500, .text-stone-400 {
              color: #000000 !important;
            }
            .bg-white { background: transparent !important; }
            .shadow-xs { box-shadow: none !important; }
            .rounded-xl { border-radius: 0 !important; }
          </style>
        </head>
        <body>
          ${receiptHtml}
        </body>
      </html>
    `);
    doc.close();

    const doPrint = () => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.error('Print error:', err);
      } finally {
        // Remove iframe after print dialog is closed or after a grace period
        if (iframe.contentWindow) {
          iframe.contentWindow.onafterprint = () => {
            iframe.remove();
            resolve();
          };
        }
        setTimeout(() => {
          if (document.body.contains(iframe)) {
            iframe.remove();
          }
          resolve();
        }, 1500);
      }
    };

    // Ensure DOM is parsed before printing
    if (iframe.contentWindow?.document.readyState === 'complete') {
      setTimeout(doPrint, 150);
    } else {
      iframe.onload = () => setTimeout(doPrint, 150);
    }
  });
}
