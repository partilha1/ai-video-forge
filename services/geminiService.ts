

import { GoogleGenAI, Chat, Type } from "@google/genai";

// Add AssistantMessage interface to be used by the new service function
export interface AssistantMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
}

export interface StoryboardScene {
    prompt: string;
    imagePrompt: string;
}

export const generateStoryboard = async (
    mainPrompt: string,
    apiKey: string,
): Promise<{ title: string; scenes: StoryboardScene[] }> => {
    if (!apiKey) throw new Error("API Key is not configured.");

    const ai = new GoogleGenAI({ apiKey });
    const model = 'gemini-2.5-flash';
    const schema = {
        type: Type.OBJECT,
        properties: {
            title: { type: Type.STRING, description: "A catchy and relevant title for the video." },
            scenes: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        prompt: { type: Type.STRING, description: "The script for this specific scene, describing the action." },
                        imagePrompt: { type: Type.STRING, description: "A detailed visual prompt for an AI image generator to create a compelling image for this scene." },
                    },
                    required: ["prompt", "imagePrompt"]
                },
                description: "An array of 5 to 7 scenes that form a coherent story."
            }
        },
        required: ["title", "scenes"]
    };

    const instruction = `You are a creative director for short-form videos. Based on the user's idea, create a complete video storyboard. Break the idea down into 5-7 distinct, sequential scenes to tell a story. For each scene, provide a short, descriptive script (the 'prompt') and a detailed visual description (the 'imagePrompt') for an AI image generator. The final title should be catchy.

    User's Idea: "${mainPrompt}"`;
    
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: instruction,
            config: {
                responseMimeType: "application/json",
                responseSchema: schema,
            },
        });

        const jsonResponse = JSON.parse(response.text);
        
        if (!jsonResponse.title || !Array.isArray(jsonResponse.scenes) || jsonResponse.scenes.length === 0) {
            console.error("Invalid storyboard structure received from AI:", jsonResponse);
            throw new Error("Failed to generate a valid storyboard from the AI response.");
        }

        return jsonResponse;
    } catch(error) {
        console.error("Error generating storyboard:", error);
        const errorString = (error instanceof Error ? error.message : JSON.stringify(error)).toLowerCase();
        
        if (errorString.includes('quota') || errorString.includes('resource_exhausted')) {
            throw new Error('You have exceeded your API quota for storyboard generation. Please check your API dashboard for usage details and limits.');
        }

        throw new Error("The AI failed to create a storyboard. Please try a different prompt.");
    }
};

export const generateImage = async (
    prompt: string,
    apiKey: string,
): Promise<string> => {
    if (!apiKey) throw new Error("API Key is not configured.");
    
    const ai = new GoogleGenAI({ apiKey });
    
    try {
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: prompt,
            config: {
              numberOfImages: 1,
              outputMimeType: 'image/jpeg',
              aspectRatio: '9:16', // Default for short-form videos
            },
        });

        const base64ImageBytes = response.generatedImages?.[0]?.image?.imageBytes;

        if (!base64ImageBytes) {
            throw new Error("Image generation did not return an image.");
        }

        return base64ImageBytes;
    } catch(error) {
        console.error("Error generating image:", error);
        const errorString = (error instanceof Error ? error.message : JSON.stringify(error)).toLowerCase();
        
        if (errorString.includes('quota') || errorString.includes('resource_exhausted')) {
            throw new Error('You have exceeded your API quota for image generation. Please check your API dashboard for usage details and limits.');
        }

        throw new Error(`Failed to generate image for prompt: "${prompt}"`);
    }
};

const loadingMessages = [
    "Initializing AI director...",
    "Brewing the pixels...",
    "Choreographing the frames...",
    "Teaching the AI about cinematography...",
    "Rendering the digital masterpiece...",
    "This can take a few minutes, please wait...",
    "Assembling the visual symphony...",
    "The AI is deep in thought...",
    "Finalizing the color grade...",
    "Almost there, just adding the final touches..."
];

export const generateVideo = async (
    prompt: string,
    updateLoadingMessage: (message: string) => void,
    apiKey: string,
    aspectRatio: string,
    imageBase64: string | null
): Promise<string> => {
    if (!apiKey) {
      throw new Error("API Key is not configured.");
    }
    
    const ai = new GoogleGenAI({ apiKey });

    updateLoadingMessage(loadingMessages[0]);
    let messageIndex = 1;
    const messageInterval = setInterval(() => {
        updateLoadingMessage(loadingMessages[messageIndex % loadingMessages.length]);
        messageIndex++;
    }, 5000);

    try {
        const generateRequest: {
            model: string;
            prompt: string;
            image?: { imageBytes: string; mimeType: string; };
            config: { numberOfVideos: number; aspectRatio: string; };
        } = {
            model: 'veo-2.0-generate-001',
            prompt: prompt,
            config: {
                numberOfVideos: 1,
                aspectRatio: aspectRatio,
            },
        };

        if (imageBase64) {
            updateLoadingMessage("Processing reference image...");
            generateRequest.image = {
                imageBytes: imageBase64,
                mimeType: 'image/jpeg', // Assuming jpeg from our generateImage function
            };
        }

        let operation = await ai.models.generateVideos(generateRequest);

        while (!operation.done) {
            await new Promise(resolve => setTimeout(resolve, 10000)); // Poll every 10 seconds
            operation = await ai.operations.getVideosOperation({ operation: operation });
        }
        
        const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;

        if (!downloadLink) {
            console.error("Video generation operation completed but did not return a download link.", operation);
            throw new Error("Video generation failed or returned no result.");
        }

        updateLoadingMessage("Finalizing and downloading your video...");

        const videoApiUrl = `${downloadLink}&key=${apiKey}`;
        const fetchResponse = await fetch(videoApiUrl);
        if (!fetchResponse.ok) {
            console.error("Failed to download video file:", fetchResponse.status, fetchResponse.statusText);
            throw new Error(`Could not download the generated video. Server responded with status ${fetchResponse.status}.`);
        }

        const videoBlob = await fetchResponse.blob();
        const videoObjectURL = URL.createObjectURL(videoBlob);

        return videoObjectURL;

    } catch (error) {
        console.error("Error generating video:", error);
        const errorString = (error instanceof Error ? error.message : JSON.stringify(error)).toLowerCase();
        
        if (errorString.includes('api key not valid')) {
            throw new Error('The provided API key is not valid. Please check your configuration.');
        }
        if (errorString.includes('quota') || errorString.includes('resource_exhausted')) {
            throw new Error('You have exceeded your API quota. Please check your API dashboard for usage details and limits.');
        }

        throw new Error("Failed to generate video. Please try again.");
    } finally {
        clearInterval(messageInterval);
    }
};

export const generateAssistantResponse = async (
    messages: AssistantMessage[],
    apiKey: string,
): Promise<string> => {
    if (!apiKey) {
        throw new Error("API Key is not configured.");
    }
    
    try {
        const ai = new GoogleGenAI({ apiKey });

        const chat: Chat = ai.chats.create({
            model: 'gemini-2.5-flash',
            config: {
                systemInstruction: "You are an expert scriptwriter for short-form videos. Your goal is to help users brainstorm, refine, or generate complete video scripts. Keep your responses concise and focused on creating engaging video content. When providing a script, format it clearly so it can be used directly.",
            },
            // All messages except the last one are history
            history: messages.slice(0, -1).map(msg => ({
                role: msg.role,
                parts: [{ text: msg.text }]
            }))
        });

        const lastMessage = messages[messages.length - 1];
        if (lastMessage.role !== 'user') {
            throw new Error("Cannot send a message from the model to the chat API.");
        }
        
        const result = await chat.sendMessage({ message: lastMessage.text });
        
        return result.text;
    } catch (error) {
        console.error("Error generating assistant response:", error);
        const errorString = (error instanceof Error ? error.message : JSON.stringify(error)).toLowerCase();

        if (errorString.includes('api key not valid')) {
            throw new Error('The provided API key is not valid. Please check your configuration.');
        }
        if (errorString.includes('quota') || errorString.includes('resource_exhausted')) {
            throw new Error('You have exceeded your API quota for the assistant. Please check your API dashboard for usage details and limits.');
        }
        
        throw new Error("Failed to get a response from the assistant. Please try again.");
    }
};