import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const baseDir = path.join(__dirname, '../public/content/Computer-Science/Academics/Bachelor-CS');

const mappings = {
    'Semester-03': {
        'CSE 2111': 'CSE-2111-Algorithms',
        'PHY 1201': 'PHY-1201-Physics-II',
        'CSE 1205': 'CSE-1205-Electrical-Circuits',
        'ENG 1203': 'ENG-1203-English',
        'CSE 1259': 'CSE-1259-Circuits-Lab',
        'CSE 2162': 'CSE-2162-Data-Structures-Lab'
    },
    'Semester-04': {
        'CSE 2263': 'CSE-2263-Algorithms-II'
    }
};

function renameFolders() {
    for (const [semester, courses] of Object.entries(mappings)) {
        const semesterPath = path.join(baseDir, semester);
        if (!fs.existsSync(semesterPath)) {
            console.log(`Skipping ${semester}, not found.`);
            continue;
        }

        for (const [oldName, newName] of Object.entries(courses)) {
            const oldPath = path.join(semesterPath, oldName);
            const newPath = path.join(semesterPath, newName);

            if (fs.existsSync(oldPath)) {
                try {
                    fs.renameSync(oldPath, newPath);
                    console.log(`Renamed: ${oldName} -> ${newName}`);
                } catch (err) {
                    console.error(`Failed to rename ${oldName}:`, err.message);
                }
            } else {
                // Check if already renamed
                if (fs.existsSync(newPath)) {
                    console.log(`Already renamed: ${newName}`);
                } else {
                    console.log(`Not found: ${oldName}`);
                }
            }
        }
    }
}

renameFolders();
