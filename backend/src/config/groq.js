const { OpenAI } = require('openai');

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: 'https://api.groq.com/openai/v1',
});

async function getInitialRecommendations(age, genres) {
    const prompt = `You are a book recommender. Based on the following data:
    Age: ${age}
    Favorite genres: ${genres.join(", ")}
    -Note: The favorite genres are independent. Recommendations can include books from any of these genres individually or in combination.
    Recommend a list of 5 books. Only respond with the titles, one per line. Do not include numbers or quotes. No descriptions. Just titles.`;
  try {
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.6,
    });

    const text = response.choices[0].message.content;
    const titles = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    return titles;
  } catch (error) {
    console.error('Error en getInitialRecommendations:', error.message);
    throw error;
  }
}

async function getPersonalizedRecommendations(age, genres, likedBooks, dislikedBooks, wantToRead, notInterested) {
  const prompt = `You are a book recommender AI.

    User profile:
    - Age: ${age}
    - Favorite genres: ${genres.join(", ")}
    -Note: Favorite genres are independent;

    Books they liked:
    ${likedBooks.join("\n")}

    Books they disliked:
    ${dislikedBooks.join("\n")}

    Books they want to read:
    ${wantToRead.join("\n")}

    Books they are not interested in:
    ${notInterested.join("\n")}

    Based on this information, recommend exactly 5 new book titles the user might like:
    - Do NOT include any books already mentioned above.
    - Include 4 books aligned with their favorite genres.
    - Include 1 book that is somewhat different from their usual tastes.
    - Return ONLY the titles, one per line.
    - Do NOT recomendation reason.`

  try {
    console.log(prompt)
    const response = await openai.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
    });
    const text = response.choices[0].message.content;
    const titles = text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);
    return titles;
  } catch (error) {
    console.error('Error en getPersonalizedRecommendations:', error.message);
    throw error;
  }
}

module.exports = {
  getInitialRecommendations,
  getPersonalizedRecommendations
};


