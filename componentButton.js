const { callOpenAI } = require("./openai");

function buildSafeButton(ai, emailTheme) {
  const style = ai?.data?.style || {};
  const props = ai?.data?.props || {};
  const themepadding = emailTheme?.padding || {}
  return {
    type: "Button",
    data: {
      style: {
        fontWeight: style.fontWeight || "600",
        fontFamily: style.fontFamily || "Arial, sans-serif",
        fontSize: style.fontSize || 14,
        textAlign: style.textAlign || "center",
        buttonColor: style.buttonColor || "#4A90E2",
        color: style.color || "#FFFFFF",
        borderRadius: style.borderRadius ?? 5,
         buttonPadding: style.buttonPadding || {
          top: 10,
          right: 20,
          bottom: 10,
          left: 20,
        },
         padding: style.padding || {
          top:themepadding.component.top || 10,
          right: themepadding.component.right ||20,
          bottom: themepadding.component.bottom || 10,
          left: themepadding.component.left || 20,
        },
        ...(style.whiteSpace && { whiteSpace: style.whiteSpace }),
        ...(style.customCss && { customCss: style.customCss }),
      },
      props: {
        text: props.text || "Click Here",
        navigateToUrl: props.navigateToUrl || "#",
        textAlign: props.textAlign || "center",
      },
    },
  };
}

async function generateButtonComponent(
  emailTheme,
  section,
  parentSection,
  childIndex
) {
  const insideGrid = parentSection != null && parentSection.type === "Columns";
console.log("emailthemeinbutton", emailTheme)
  const systemMessage = `
  1. Role
  You are an AI assistant tasked with generating a valid JSON object for a Button component in a modular email layout system. Your responsibility is to construct the component using the user’s input and a predefined design theme, ensuring consistency, structure, and reusability across all buttons.
  
  2. Capabilities
  You generate Button components in the following strict format:
  
  Each component must have a unique ID in this format: timestamp-randomString-performanceHash (e.g., lzd45f-ab123-7x9fp).
  
  Each component must follow this structure:
  {
    "unique-id": {
      "type": "Button",
      "data": {
        "style": { ... },
        "props": { ... }
      }
    }
  }
  Props must include:
  
  text - Text should be short and action-oriented (ideally under 20 characters).
  Avoid wrapping; use imperative verbs (e.g., “Get Started”, “View Deals”).
Use imperative verbs (e.g., “Get Started”, “View Deals”).
Text must not be too large in content or character count.

  navigateToUrl
  
  textAlign
  
  Style must include:
  
  fontWeight
  
  fontFamily
  
  fontSize — must not exceed 14

  textAlign
  
  buttonColor - Use primary color value from the theme 
  
  color
  
  borderRadius
  
  buttonPadding (Mandatory style) :
  Use this format for buttonPadding:
    {
    "top": <number>,
    "right": <number>,
    "bottom": <number>,
    "left": <number>
  }
  buttonPadding is strongly recommended and normally mandatory.
  Width, height, and wrapping rules based on whether the button is inside a Columns grid:
  If the button is inside a Columns grid (i.e., parentSection is not null and parentSection.type is 'Columns', or ${insideGrid} is true), then:

  - Maximum width = 120px,
  - Text should wrap to multiple lines if needed,
  - Button height should increase accordingly,
  - Use "whiteSpace": "normal" to enable wrapping.
  - Button width must not exceed the corresponding cellWidths% of the parent container width (e.g., 600px).
  - Add "customCss": "text-wrap:auto" to data.style
  - Height should increase based on content

If the button is not inside a grid (insideGrid === false):

Otherwise (no parentSection or different type):
  - Single-line text only,
  - Use "whiteSpace": "nowrap".

Width must be calculated dynamically based on the length of data.props.text and theme.fontSize.button, including horizontal padding. Do not use the static theme.buttonStyle.width.

  Use the following theme JSON for consistent styles:
  ${JSON.stringify(emailTheme, null, 2)}
  
  All values must conform to the default theme if the user does not specify them. The theme JSON includes predefined typography, spacing, color palette, and button styling defaults.
  
  3. Response Guidelines
  
  Return only the final JSON object.
  
  No markdown, no explanation, no extra commentary.
  
  Output must match this structure:
  
  {
    "unique-id": {
      "type": "Button",
      "data": {
        "style": { ... },
        "props": { ... }
      }
    }
  }
  Include only properties from the allowed theme and structure.
  
  Ensure the button design strictly adheres to professional email UI standards and the specified padding.`;

  const userMessage = `Here’s the component details for the section based on the provided theme:

${JSON.stringify(
  {
    id: section.id,
    title: section.title,
    purpose: section.purpose,
    summary: section.summary,
    type: "Button",
  },
  null,
  2
)}
Use default styling from the theme unless otherwise noted. 
no extra explanations needed
`;

  const response = await callOpenAI(systemMessage, userMessage);

  try {
    const parsed = JSON.parse(response);
    const uniqueId = Object.keys(parsed)[0];
    const aiComponent = parsed[uniqueId];
    const buttonComponent = buildSafeButton(aiComponent , emailTheme);
    const result = { [uniqueId]: buttonComponent };
    return result;
  } catch (e) {
    console.warn("Failed to parse AI response. Using fallback.");
    return { fallback: buildSafeButton(null) };
  }
}
module.exports = { generateButtonComponent };
