
import { SheetPayload, AppConfig } from '../types';

export const extractEmail = (text: string): string | null => {
  const patterns = [
    /[\w.-]+@[\w.-]+\.\w+/g,
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g
  ];
  
  for (const pattern of patterns) {
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      return matches[0].toLowerCase();
    }
  }
  return null;
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.warn('Navigator clipboard failed, falling back to textarea method', err);
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (e) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const downloadAsText = (content: string, filename = 'cover-letter.txt') => {
  const blob = new Blob([content], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const downloadAsPDF = async (content: string, config: AppConfig, filename = 'cover-letter.pdf') => {
  if (typeof window.html2pdf === 'undefined') {
    alert('PDF library not loaded yet. Please wait a moment.');
    return;
  }

  // Detect if content is HTML (Resume) or Plain Text (Cover Letter)
  // We check for HTML tags like <h3> or <ul> which are specific to our resume generation
  const isHtml = /<(h3|ul|div|p)/i.test(content);

  const element = document.createElement('div');
  
  // Format Content
  let bodyContent = '';
  if (isHtml) {
    // For Resume: Use raw HTML. Do NOT replace \n with <br> as it breaks the HTML source layout.
    bodyContent = content;
  } else {
    // For Cover Letter: Plain text needs <br> for newlines to render correctly in HTML container
    bodyContent = content.replace(/\n/g, '<br>');
  }

  const name = config.userName || 'YOUR NAME';
  const email = config.userEmail || '';
  const phone = config.userPhone || '';
  const linkedIn = config.userLinkedIn || '';

  // Icons
  const emailIcon = `<svg style="vertical-align:middle;margin-right:4px;" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`;
  const phoneIcon = `<svg style="vertical-align:middle;margin-right:4px;" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>`;
  const linkIcon = `<svg style="vertical-align:middle;margin-right:4px;" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>`;

  // Resume-specific CSS to ensure the PDF looks like the App UI
  // Tightened margins to prevent 2-page spill
  const resumeStyles = `
    .resume-content h3 {
      text-transform: uppercase;
      font-weight: 700;
      font-size: 10pt;
      letter-spacing: 0.5px;
      border-bottom: 1px solid #000;
      margin-top: 12px;
      margin-bottom: 6px;
      padding-bottom: 2px;
      color: #000;
      line-height: 1.1;
    }
    .resume-content ul {
      margin-left: 14px;
      margin-bottom: 6px;
      padding-left: 0;
      list-style-type: disc;
    }
    .resume-content li {
      margin-bottom: 2px;
      padding-left: 2px;
    }
    .resume-content p {
      margin-bottom: 4px;
    }
    .resume-content strong {
      font-weight: 600;
      color: #000;
    }
    .resume-content div {
      margin-bottom: 4px;
    }
  `;

  element.innerHTML = `
    <div style="font-family: 'Inter', 'Helvetica', 'Arial', sans-serif; padding: 30px; color: #000;">
      <style>
        ${isHtml ? resumeStyles : ''}
      </style>

      <!-- HEADER -->
      <div style="margin-bottom: 15px;">
        <h1 style="font-size: 24px; text-transform: uppercase; font-weight: 500; letter-spacing: 1px; margin: 0 0 8px 0; color: #000;">
          ${name}
        </h1>
        
        <div style="display: flex; gap: 12px; font-size: 8pt; color: #333; flex-wrap: wrap; align-items: center;">
          ${email ? `<div style="display: flex; align-items: center;">${emailIcon} ${email}</div>` : ''}
          ${phone ? `<div style="display: flex; align-items: center;">${phoneIcon} ${phone}</div>` : ''}
          ${linkedIn ? `<div style="display: flex; align-items: center;">${linkIcon} ${linkedIn}</div>` : ''}
        </div>
      </div>

      <!-- SEPARATOR -->
      <hr style="border: 0; border-top: 1px solid #000; margin-bottom: 15px;" />

      <!-- BODY -->
      <div class="${isHtml ? 'resume-content' : ''}" style="font-size: 9.5pt; line-height: 1.4; text-align: justify; color: #000;">
        ${bodyContent}
      </div>
    </div>
  `;

  // HTML2PDF Configuration
  const opt = {
    margin:       [0.3, 0.3], // Decreased margins to 0.3 inches
    filename:     filename,
    image:        { type: 'jpeg', quality: 1.0 },
    html2canvas:  { scale: 2, useCORS: true },
    jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
  };

  try {
    await window.html2pdf().set(opt).from(element).save();
  } catch (e) {
    console.error('PDF generation failed', e);
  }
};

export const sendToGoogleSheets = async (data: SheetPayload, scriptUrl: string, accessToken?: string) => {
  if (!scriptUrl) {
    throw new Error('Please configure Google Apps Script URL in settings');
  }

  // Debugging payload
  console.log("Sending to Sheets:", { 
    scriptUrl, 
    sheetName: data.sheetName, 
    auth: !!accessToken 
  });

  if (accessToken) {
    // Authenticated Request (OAuth)
    await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });
  } else {
    // Anonymous Request (text/plain hack)
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: {
        'Content-Type': 'text/plain',
      },
      body: JSON.stringify(data)
    });
  }

  return { success: true };
};
