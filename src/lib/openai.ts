import OpenAi from 'openai';

const openAiKey = process.env.OPENAI_API_KEY

if (!openAiKey) {
    throw new Error('OPENAI_API_KEY is not defined')
}

export const openai = new OpenAi({
    apiKey: process.env.OPENAI_API_KEY,
}
);