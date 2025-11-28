import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, AlertTriangle, Shield, Code } from 'lucide-react';
import { copyToClipboard } from '../services/utils';

interface InstructionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'oauth'>('basic');

  if (!isOpen) return null;

  const scriptCode = `// 1. Enter your Sheet ID below
const SHEET_ID = 'YOUR_SHEET_ID_HERE'; 

function doGet(e) {
  return HtmlService.createHtmlOutput('<h2>Service is Running</h2><p>Post data to this URL.</p>');
}

function doOptions(e) {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    let data;

    // Parse data - handles both JSON content-type and text/plain (CORS workaround)
    if (e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents);
    } else {
      // Test payload for running inside Editor
      data = {
        sheetName: 'Sheet1',
        jobDescription: 'Test Job',
        coverLetter: 'Test Letter',
        senderName: 'Test User',
        senderEmail: 'test@example.com'
      };
    }
    
    // Select sheet
    let sheet;
    if (data.sheetName) {
      sheet = ss.getSheetByName(data.sheetName);
      if (!sheet) throw new Error("Sheet '" + data.sheetName + "' not found. Please create it first.");
    } else {
      sheet = ss.getSheets()[0];
    }
    
    // Append row
    sheet.appendRow([
      new Date().toLocaleString(),
      data.senderName || '',
      data.senderEmail || '',
      data.extractedEmail || '',
      (data.jobDescription || '').substring(0, 5000),
      data.coverLetter || ''
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({status: 'success'}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const handleCopyCode = async () => {
    await copyToClipboard(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div 
        className="w-full max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex gap-4">
             <button 
               onClick={() => setActiveTab('basic')}
               className={`text-sm font-bold pb-1 ${activeTab === 'basic' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
             >
               Basic Setup
             </button>
             <button 
               onClick={() => setActiveTab('oauth')}
               className={`text-sm font-bold pb-1 ${activeTab === 'oauth' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500'}`}
             >
               Fix 401 Error (OAuth)
             </button>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-8">
          
          {activeTab === 'basic' && (
            <>
              {/* Step 1: Gemini */}
              <section>
                <h3 className="text-blue-600 font-semibold text-lg mb-2 flex items-center gap-2">
                  1. Get Gemini API Key
                </h3>
                <ol className="list-decimal pl-5 space-y-2 text-slate-600 text-sm">
                  <li>Go to <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline flex items-center inline-flex gap-1">Google AI Studio <ExternalLink size={12}/></a></li>
                  <li>Click <strong>Create API Key</strong>.</li>
                  <li>Copy the key and paste it into this app's Configuration panel.</li>
                </ol>
              </section>

              {/* Step 2: Google Sheets */}
              <section>
                <h3 className="text-green-600 font-semibold text-lg mb-2 flex items-center gap-2">
                  2. Google Sheets Integration
                </h3>
                
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="text-amber-600 flex-shrink-0" size={20} />
                    <div className="text-sm text-amber-800">
                      <p className="font-bold">Crucial Deployment Settings:</p>
                      <ul className="list-disc pl-4 mt-1 space-y-1">
                        <li>Execute as: <strong>Me</strong> (your email)</li>
                        <li>Who has access: <strong>Anyone</strong> (NOT "Anyone with Google Account")</li>
                      </ul>
                      <p className="mt-2 text-xs">If "Anyone" is not available, check the <strong>Fix 401 Error</strong> tab.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 text-sm text-slate-600">
                  <p>1. Go to <a href="https://script.google.com" target="_blank" rel="noreferrer" className="text-blue-500 hover:underline">script.google.com</a> and create a new project.</p>
                  
                  <p>2. Paste this code (replace existing code):</p>
                  <div className="relative group">
                    <pre className="bg-slate-800 text-slate-200 p-4 rounded-lg text-xs overflow-x-auto h-48">
                      {scriptCode}
                    </pre>
                    <button 
                      onClick={handleCopyCode}
                      className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded text-white transition-colors"
                      title="Copy Code"
                    >
                      {copied ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>

                  <p>3. Replace <code>YOUR_SHEET_ID_HERE</code> with your Google Sheet ID.</p>
                  <p>4. <strong>Deploy correctly:</strong> Click <strong>Deploy</strong> {'>'} <strong>New Deployment</strong>, select <strong>Web App</strong>, set permissions to <strong>Anyone</strong>, and Deploy.</p>
                </div>
              </section>
            </>
          )}

          {activeTab === 'oauth' && (
             <section className="space-y-4">
               <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3">
                 <Shield className="text-blue-600 flex-shrink-0" />
                 <div>
                   <h3 className="font-bold text-blue-800">Why use OAuth?</h3>
                   <p className="text-sm text-blue-700 mt-1">
                     If your organization blocks "Anonymous" web apps, or you keep getting "401 Unauthorized", you need to sign in to allow the app to run the script.
                   </p>
                 </div>
               </div>

               <h3 className="font-semibold text-slate-800 mt-4">Steps to get Client ID:</h3>
               <ol className="list-decimal pl-5 space-y-3 text-sm text-slate-600">
                 <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" className="text-blue-600 hover:underline">Google Cloud Credentials</a>.</li>
                 <li>Click <strong>Create Credentials</strong> {'>'} <strong>OAuth client ID</strong>.</li>
                 <li>Application type: <strong>Web application</strong>.</li>
                 <li>
                   <strong>Authorized JavaScript origins:</strong> Add your app URL. 
                   <br/>
                   <span className="text-xs bg-slate-100 p-1 rounded mt-1 inline-block">
                     http://localhost:5173
                   </span> (or your deployed domain)
                 </li>
                 <li>Click <strong>Create</strong>.</li>
                 <li>Copy the <strong>Client ID</strong> (ends in <code>.apps.googleusercontent.com</code>) and paste it into this app's Configuration.</li>
               </ol>
             </section>
          )}

        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;