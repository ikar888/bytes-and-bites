import { API_KEY } from "./config.js";

document.getElementById("add-ingredient-btn").addEventListener("click", (event) => {
  event.preventDefault();
  const ingredient = document.getElementById("ingredient-txt").value;
  if(ingredient === "" || ingredient === " ") {
    alert("Ingredient cannot be empty");
    return;
  }
  const ulElement = document.getElementById("ingredient-list");
  const liElement = document.createElement("li");
  liElement.textContent = ingredient;
  ulElement.appendChild(liElement);
  document.getElementById("ingredient-txt").value = "";
});

document.getElementById("ingredient-list").addEventListener('click', (event) => {
  const ulElement = document.getElementById("ingredient-list");
  ulElement.removeChild(event.target);
});

document.getElementById("ingredient-list").addEventListener('touchstart', (event) => {
  const ulElement = document.getElementById("ingredient-list");
  ulElement.removeChild(event.target);
  event.preventDefault();
});

document.getElementById("generate-recipe-btn").addEventListener("click", (event) => {
  event.preventDefault();
  let ingredientList = "";
  const guardrailsRecipe = `
When generating a recipe, use only the ingredients provided by the user—do not add, substitute, or assume any other ingredients. Your response must include a complete list of those ingredients and clear, step-by-step instructions for preparation and cooking. Make sure each ingredient is a valid food item; if any ingredient is not recognizable as food, do not proceed with the recipe. Always provide a name for the recipe based on the ingredients used. You may use water, alliums (such as onions, garlic, leeks, shallots, or scallions), and garnish. Stay strictly focused on food and the recipe itself; do not include unrelated topics, commentary, or additional information. If the user does not provide any ingredients, respond with: “Please provide at least one ingredient for me to create a simple recipe. I need ingredients to give you a recipe, a list of ingredients, and step-by-step instructions.”`;
  const ulElement = document.getElementById("ingredient-list");
  const liElement = ulElement.getElementsByTagName("li");
  document.getElementById("gemini-story").innerText = "";
  for(let i = 0; i < liElement.length ; i++) {
    ingredientList += `${i+1} +: ${liElement[i].textContent} `;
  }
  generateText(ingredientList, "gemini-recipe", guardrailsRecipe);
});

document.getElementById("generate-story-btn").addEventListener("click", () => {
  const recipe = document.getElementById("gemini-recipe")
  const guardrailStory = `
  If the input says “Please provide at least one ingredient for me to create a simple recipe. I need ingredients to give you a recipe, a list of ingredients, and step-by-step instructions,” or if the recipe is empty or the ingredients provided are invalid, respond only with “a recipe is required” and do not generate any stories or additional content. When valid recipe information is provided, create a short story about the history of the recipe, include nutrition facts in a table, and share fun facts. Do not include any other topics, commentary, or unrelated information. Do not explain how to make the recipe or provide cooking instructions.`;
  generateText(recipe.innerText , "gemini-story", guardrailStory);
});

const generateText = async (userPrompt, elementId, guardrails) => {
  const prompt = guardrails + userPrompt;
  const output = document.getElementById(elementId);
  const imgElement = document.createElement("img");
  let finalResponse = "";
  imgElement.src = "image/loading.gif";
  imgElement.width = 100;
  imgElement.height = 100;
  output.innerText = "";
  output.appendChild(imgElement);
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();
    finalResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    finalResponse = finalResponse ? finalResponse : "No response from Gemini."
  } catch (error) {
    finalResponse = "Error contacting Gemini API.";
  }
  printLetterByLetter(elementId, finalResponse);
};

const printLetterByLetter = (destination, message) => {
  for (let i = 0; i <= message.length; i++) {
    setTimeout(() => {
      document.getElementById(destination).innerText += message.charAt(i);
    }, i * 30);
  }
};