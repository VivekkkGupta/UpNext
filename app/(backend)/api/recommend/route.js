// Import `GoogleGenerative` from the package we installed earlier.
import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// prompt "prompt": "The user is listening to a song titled 'Finding Her (Jana Mere Sawalon Ka Manzar Tu)' by Kushagra. It's a romantic Hindi song. Can you suggest 5 other similar Hindi romantic songs? Provide the output as a numbered list with the song name and, if possible, a relevant Youtube query or link. Format:1. Song Name \nYouTube Link"

// prompt for recommendation
//prompt: Provide 5 song suggestions similar to the following song, "[Input Song Title] by [Input Artist/Band]" which is a [Input Genre/Mood, e.g., Hindi romantic, upbeat pop, soulful]. For each suggestion, provide only one Youtube link that directly searches for the song.

// Sample Body
// {
//     "prompt": " Provide 5 song suggestions similar to the following song, Apna Bana le Piya by Arjit Singh which is a Hindi romantic. For each suggestion, provide only one Youtube link which leads to that songs's video. Do not give any Introduction or any other text just provide the data as this example - srno. - song name - youtube-link"
// }

// {
//      "prompt": " Provide 5 song suggestions similar to the following song, ${Song Name} by {Artist Name} which is a ${Genre}. For each suggestion, provide only one Youtube link which leads to that songs's video. Do not give any Introduction or any other text just provide the data as this example - srno. - song name - youtube-link"
// }

// Create an asynchronous function POST to handle POST 
// request with parameters request and response.
export async function POST(req, res) {

    try {
        // Access your API key by creating an instance of GoogleGenerativeAI we'll call it GenAI
        const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

        // Ininitalise a generative model
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })

        // Retrieve the data we recieve as part of the request body
        const data = await req.json();
        const { prompt } = data;

        // Pass the prompt to the model and retrieve the output
        const result = await model.generateContent(prompt);
        console.log("result", result);
        const output = result.response.text();
        console.log("output", output);
        // Send the llm output as a server reponse object
        return NextResponse.json({ output: output })
    } catch (error) {
        console.error(error)
    }
}