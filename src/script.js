document.addEventListener('DOMContentLoaded', () => {
    const editor = document.getElementById('markdown-input');
    const preview = document.getElementById('preview-output');
    const wordCount = document.getElementById('word-count');
    const exportBtn = document.getElementById('export-btn');

    // Configure marked to use PrismJS for syntax highlighting
    marked.setOptions({
        highlight: function(code, lang) {
            if (Prism.languages[lang]) {
                return Prism.highlight(code, Prism.languages[lang], lang);
            } else {
                return code;
            }
        },
        gfm: true,
        breaks: true,
    });

    const defaultMarkdown = `# Welcome to Pro Markdown! ✨

A premium, glassmorphic Markdown editor built for the modern web.

## Features
* **Real-time Preview**: See your changes instantly.
* **Syntax Highlighting**: Beautiful code blocks.
* **XSS Sanitization**: Secure parsing via DOMPurify.
* **Synchronized Scrolling**: Effortless navigation.

### Code Example
\`\`\`javascript
const buildInPublic = true;
if (buildInPublic) {
    console.log("Generating 100+ repos!");
}
\`\`\`

> "Good design is good business." - Thomas Watson Jr.

---
*Start editing the text on the left to see the live preview.*
`;

    // Render markdown to HTML safely
    const renderMarkdown = () => {
        const rawMarkdown = editor.value;
        const rawHtml = marked.parse(rawMarkdown);
        const cleanHtml = DOMPurify.sanitize(rawHtml);
        preview.innerHTML = cleanHtml;
        
        // Update word count
        const textOnly = rawMarkdown.replace(/[#*`_>]/g, '').trim();
        const words = textOnly ? textOnly.split(/\s+/).length : 0;
        wordCount.textContent = `${words} word${words !== 1 ? 's' : ''}`;
    };

    // Initialize with default content
    editor.value = defaultMarkdown;
    renderMarkdown();

    // Event listener for editor changes
    editor.addEventListener('input', renderMarkdown);

    // Sync scrolling
    let isSyncingLeft = false;
    let isSyncingRight = false;

    editor.addEventListener('scroll', () => {
        if (!isSyncingLeft) {
            isSyncingRight = true;
            const percentage = editor.scrollTop / (editor.scrollHeight - editor.clientHeight);
            preview.scrollTop = percentage * (preview.scrollHeight - preview.clientHeight);
        }
        isSyncingLeft = false;
    });

    preview.addEventListener('scroll', () => {
        if (!isSyncingRight) {
            isSyncingLeft = true;
            const percentage = preview.scrollTop / (preview.scrollHeight - preview.clientHeight);
            editor.scrollTop = percentage * (editor.scrollHeight - editor.clientHeight);
        }
        isSyncingRight = false;
    });

    // Export HTML
    exportBtn.addEventListener('click', () => {
        const htmlContent = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Exported Document</title>
    <style>
        body { font-family: sans-serif; max-width: 800px; margin: 40px auto; line-height: 1.6; color: #333; }
        pre { background: #f4f4f4; padding: 16px; border-radius: 8px; overflow-x: auto; }
        code { font-family: monospace; }
        blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #666; }
    </style>
</head>
<body>
${preview.innerHTML}
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'document.html';
        a.click();
        URL.revokeObjectURL(url);
    });
});
