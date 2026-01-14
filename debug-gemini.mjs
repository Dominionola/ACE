import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

async function listModels() {
    try {
        const envFile = await readFile(join(process.cwd(), '.env'), 'utf-8');
        const keyMatch = envFile.match(/GOOGLE_GENERATIVE_AI_API_KEY=(.+)/);

        if (!keyMatch) {
            console.error("❌ Could not find key");
            return;
        }

        const apiKey = keyMatch[1].trim();
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
        const data = await response.json();

        if (data.error) {
            await writeFile('models_error.txt', JSON.stringify(data.error, null, 2));
        } else {
            const models = data.models || [];
            const chatModels = models
                .filter(m => m.supportedGenerationMethods.includes("generateContent"))
                .map(m => m.name);

            await writeFile('models.json', JSON.stringify(chatModels, null, 2));
            console.log("Written models.json");
        }

    } catch (error) {
        await writeFile('models_error.txt', String(error));
    }
}

listModels();
