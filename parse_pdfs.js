const fs = require('fs');
const pdf = require('pdf-parse');

const files = [
    'Underrgrduate_program_student-hand-book.pdf',
    'Curriculum of Undergraduate Program in Software Engineering.pdf'
];

async function parsePdfs() {
    for (const file of files) {
        if (fs.existsSync(file)) {
            console.log(`\n--- START OF ${file} ---\n`);
            const dataBuffer = fs.readFileSync(file);
            try {
                const data = await pdf(dataBuffer);
                // Limit output to first 3000 characters to verify structure, 
                // but usually we'd want more. For now let's see check the beginning 
                // to see if it's readable text.
                console.log(data.text.slice(0, 5000)); 
                console.log(`\n--- END OF PREVIEW FOR ${file} ---\n`);
            } catch (e) {
                console.error(`Error parsing ${file}:`, e);
            }
        } else {
            console.log(`File not found: ${file}`);
        }
    }
}

parsePdfs();
