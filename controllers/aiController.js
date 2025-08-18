const openai = require('../config/openai');
const pool = require('../config/db');

exports.generateNote = async (req, res) => {
  const { prompt } = req.body;

  try {
    const fullPrompt = `Create a note with the following structure: 
        {"title": "Note Title", "content": "Note content here...", "priority": "low/medium/high"}
        About: ${prompt}`;

    const completion = await openai.completions.create({
      model: "gpt-3.5-turbo-instruct",
      prompt: fullPrompt,
      max_tokens: 500,
      temperature: 0.7
    });

    const generatedText = completion.choices[0].text.trim();

    let noteData;
    try {
      noteData = JSON.parse(generatedText);
    } catch (e) {
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        noteData = JSON.parse(jsonMatch[0]);
      } else {
        return res.status(400).json({
          error: 'Invalid AI response format',
          response: generatedText
        });
      }
    }

    if (!noteData.title || !noteData.content || !noteData.priority) {
      return res.status(400).json({
        error: 'AI response missing required fields',
        response: noteData
      });
    }


    const [result] = await pool.execute(
      'INSERT INTO notes (user_id, title, content, priority) VALUES (?, ?, ?, ?)',
      [req.user.id, noteData.title, noteData.content, noteData.priority]
    );

    res.json({
      ...noteData,
      id: result.insertId
    });

  } catch (err) {
    console.error('AI generation error:', err);
    res.status(500).json({ error: 'AI generation failed', details: err.message });
  }
};

