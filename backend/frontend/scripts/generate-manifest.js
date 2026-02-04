import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const contentDir = path.join(__dirname, '../public/content');
const manifestPath = path.join(__dirname, '../public/manifest.json');

function getDirectoryStructure(dir) {
    const items = fs.readdirSync(dir, { withFileTypes: true });
    const structure = [];

    for (const item of items) {
        if (item.name.startsWith('.')) continue; // Skip hidden files

        const fullPath = path.join(dir, item.name);
        const relativePath = path.relative(path.join(__dirname, '../public'), fullPath);

        if (item.isDirectory()) {
            structure.push({
                type: 'directory',
                name: item.name,
                path: relativePath.replace(/\\/g, '/'),
                children: getDirectoryStructure(fullPath)
            });
        } else if (item.isFile() && item.name.endsWith('.md')) {
            structure.push({
                type: 'file',
                name: item.name,
                path: relativePath.replace(/\\/g, '/')
            });
        }
    }

    // Sort directories first, then files
    return structure.sort((a, b) => {
        if (a.type === b.type) return a.name.localeCompare(b.name);
        return a.type === 'directory' ? -1 : 1;
    });
}

try {
    if (!fs.existsSync(contentDir)) {
        console.error('Content directory not found:', contentDir);
        process.exit(1);
    }

    const tree = getDirectoryStructure(contentDir);
    fs.writeFileSync(manifestPath, JSON.stringify(tree, null, 2));
    console.log('Manifest generated at:', manifestPath);
} catch (error) {
    console.error('Error generating manifest:', error);
    process.exit(1);
}
