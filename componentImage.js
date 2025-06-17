const { json } = require('express');
const { callOpenAI } = require('./openai');
const fetch = require('node-fetch');

// Fetches a public image URL from a prompt
async function fetchImageUrlFromPrompt(prompt) {
  const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ2YWx1ZSI6eyJfaWQiOiI2NTg0MTYzZDVmOGNkNTQ3N2IzNTQ1OWIiLCJlbWFpbCI6ImRlZXBha0BiaXp0ZWNuby5uZXQiLCJyb2xlIjoiU3VwZXJBZG1pbiIsIl9fdiI6MH0sImlhdCI6MTc1MDEzNjczNCwiZXhwIjoxNzUwMTY1NTM0fQ.ktyFcPl10Zi4Bic_JKb0B8kLXDbRYW20XCosQGT8hJ8"

 try {
    const searchResponse = await fetch("https://dev.keynoteslides.com/ppt/v1/searchImage", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ searchText: prompt, count: 20 }),
    });

    if (!searchResponse.ok) {
      console.error("Search image API failed:", searchResponse.statusText);
      return "";
    }

    const searchData = await searchResponse.json();
    const results = searchData?.data?.results;

    if (!Array.isArray(results) || results.length === 0) {
      console.error("No images found.");
      return "";
    }

    const randomIndex = Math.floor(Math.random() * results.length);
    const imageId = results[randomIndex]?.imageid;

    if (!imageId) {
      console.error("No valid image ID found in results.");
      return "";
    }

    // Step 3: Get signed URL
    const detailResponse = await fetch(`https://dev.keynoteslides.com/image-upload/v1/${imageId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      }
    });

    if (!detailResponse.ok) {
      console.error("Get signed URL API failed:", detailResponse.statusText);
      return "";
    }

    const detailData = await detailResponse.json();
    const signedUrl = detailData?.data?.signedUrl;

    return signedUrl || "";

  } catch (error) {
    console.error("Image fetch error:", error);
    return "";
  }
}
// Safely formats and defaults image component data
function buildSafeImage(ai) {
  const style = ai?.data?.style || {};
  const props = ai?.data?.props || {};

  return {
    type: "Image",
    data: {
      style: {
        padding: style.padding || {
          top: 10,
          right: 10,
          bottom: 10,
          left: 10,
        },
        backgroundColor: style.backgroundColor || "",
        width: style.width ?? 100,
        height: style.height ?? "",
        objectFit: style.objectFit || "contain",
        borderRadius: style.borderRadius ?? 0,
      },
      props: {
        imageUrl: props.imageUrl || "https://via.placeholder.com/150",
        altText: props.altText || "Placeholder Image",
        navigateToUrl: props.navigateToUrl || "",
      },
    },
  };
}

// Main function to generate the image component
async function generateImageComponent(emailTheme, section) {
  const imageUrl = await fetchImageUrlFromPrompt(section.title);

  const systemMessage = `
1. Role
You are tasked with generating a structured JSON object for a given UI component (e.g., Image, Text) based on the details provided in the user message. Each component must be assigned a unique and realistic ID.

2. Capabilities
You must adhere to the following rules when generating the component:

Component ID Format:
Each component must have a unique ID in this format:
timestamp-randomString-performanceHash
Example: "lzd45f-ab123-7x9fp"

Component Structure:
The object must be returned as:

{
  "uniqueId": {
    "type": "ComponentType",
    "data": {
      "props": { ... },
      "style": { ... }
    }
  }
}
Component: Image
Props Fields:
imageUrl: Required — Must be a valid, public image URL that does not return a 404.
Examples of acceptable sources:
Freepik: https://img.freepik.com/...
Cloudfront: https://d123456abcdef.cloudfront.net/images/...

Free stock image providers (e.g., Freepik, Pexels) with valid direct links.

Do NOT use:
Dummy or placeholder URLs (e.g., /images/placeholder.jpg, example.com)

altText: required
navigateToUrl: optional

Style Fields:
padding
textAlign
width (must be less than 100)
objectFit (must be "cover")
borderRadius (optional)

Use the following theme JSON for consistent styles:
${JSON.stringify(emailTheme, null, 2)}

3. Response Guidelines
Generate a valid JSON object using the provided structure and constraints.

All required props and style fields must be included with values sourced from the theme where applicable.

Ensure width < 100 and objectFit: "cover" for Image.

Use the component’s content and metadata from the user message.

Return only the final JSON object — no explanations or extra commentary.
`;

  const userMessage = `
Here’s the component details for the section based on the provided theme:

${JSON.stringify({
    id: section.id,
    title: section.title,
    purpose: section.purpose,
    summary: section.summary,
    type: "Image",
    imageUrl: imageUrl
  }, null, 2)}

Please generate a JSON object for this component. Ensure that:
- The component has a unique ID in the format: timestamp-randomString-performanceHash.
- The \`props\` include \`imageUrl\`, \`altText\`, and an optional \`navigateToUrl\`.
- The \`style\` includes \`padding\`, \`textAlign\`, \`width\`, \`objectFit\`, and \`borderRadius\`.
- The \`width\` of the image must be less than 100 (set to an appropriate value).
- The \`objectFit\` should be set to "cover".
- The \`borderRadius\` should be optional and applied where needed.

Return the object in the following format with the relevant fields.
`;

  const response = await callOpenAI(systemMessage, userMessage);

  try {
    const parsed = JSON.parse(response);
    const uniqueId = Object.keys(parsed)[0];
    const aiComponent = parsed[uniqueId];
    const imageComponent = buildSafeImage(aiComponent);

    // Enforce our fetched URL if not properly used by AI
    imageComponent.data.props.imageUrl = imageUrl || imageComponent.data.props.imageUrl;

    const result = { [uniqueId]: imageComponent };
    console.log("result",JSON.stringify(result, null, 2))
    return result
  } catch (e) {
    throw new Error(`Failed to parse JSON from AI response: ${response}`);
  }
}

module.exports = { generateImageComponent };
