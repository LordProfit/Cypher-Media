/**
 * Canon Platform - JSON Schema for AI Ingestion
 * Use this to validate AI-generated content before DB insertion
 */

export const canonPostSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "CanonPost",
  "type": "object",
  "required": ["id", "slug", "quote", "talk", "usage", "type", "category", "difficulty", "engagement", "createdAt", "updatedAt", "publishedAt", "isActive"],
  "properties": {
    "id": {
      "type": "string",
      "format": "uuid",
      "description": "UUID v4 unique identifier"
    },
    "slug": {
      "type": "string",
      "pattern": "^[a-z0-9-]+$",
      "description": "URL-friendly identifier"
    },
    "quote": {
      "type": "object",
      "required": ["text", "attribution", "source"],
      "properties": {
        "text": {
          "type": "string",
          "minLength": 10,
          "maxLength": 280,
          "description": "The actual quote (1-2 sentences max)"
        },
        "attribution": {
          "type": "string",
          "description": "Who said it"
        },
        "source": {
          "type": "object",
          "required": ["title", "author", "type"],
          "properties": {
            "title": { "type": "string" },
            "author": { "type": "string" },
            "chapter": { "type": "string" },
            "page": { "type": "integer" },
            "type": {
              "type": "string",
              "enum": ["classic", "modern", "profit-original"]
            }
          }
        }
      }
    },
    "talk": {
      "type": "object",
      "required": ["text", "tone"],
      "properties": {
        "text": {
          "type": "string",
          "minLength": 20,
          "maxLength": 500,
          "description": "Profit's voice — why this matters"
        },
        "tone": {
          "type": "string",
          "enum": ["direct", "provoking", "empathetic", "brutal"]
        }
      }
    },
    "usage": {
      "type": "object",
      "required": ["action", "context", "timeMinutes"],
      "properties": {
        "action": {
          "type": "string",
          "description": "Specific micro-action"
        },
        "context": {
          "type": "string",
          "description": "When/how to apply it"
        },
        "timeMinutes": {
          "type": "integer",
          "minimum": 1,
          "maximum": 120,
          "description": "Recommended daily time"
        }
      }
    },
    "type": {
      "type": "string",
      "enum": ["quote-talk-usage", "deep-dive", "micro-reflection", "streak-milestone", "community-spotlight"]
    },
    "category": {
      "type": "array",
      "minItems": 1,
      "maxItems": 3,
      "items": {
        "type": "string",
        "enum": ["power", "discipline", "systems", "resilience", "execution", "mindset", "habits", "leadership", "friction", "compliance"]
      }
    },
    "difficulty": {
      "type": "string",
      "enum": ["easy", "medium", "hard", "brutal"]
    },
    "engagement": {
      "type": "object",
      "required": ["likes", "saves", "shares", "reflections", "completions"],
      "properties": {
        "likes": { "type": "integer", "minimum": 0 },
        "saves": { "type": "integer", "minimum": 0 },
        "shares": { "type": "integer", "minimum": 0 },
        "reflections": { "type": "integer", "minimum": 0 },
        "completions": { "type": "integer", "minimum": 0 }
      }
    },
    "reflectionPrompt": {
      "type": "string",
      "maxLength": 200,
      "description": "Question to prompt user reflection"
    },
    "createdAt": {
      "type": "string",
      "format": "date-time"
    },
    "updatedAt": {
      "type": "string",
      "format": "date-time"
    },
    "publishedAt": {
      "type": "string",
      "format": "date-time"
    },
    "isActive": {
      "type": "boolean"
    }
  }
};

// AI Prompt Template for generating valid posts
export const aiPromptTemplate = `
Generate a CanonPost following this exact JSON schema:

REQUIRED STRUCTURE:
{
  "id": "uuid-v4",
  "slug": "url-friendly-slug",
  "quote": {
    "text": "The actual quote (1-2 sentences, max 280 chars)",
    "attribution": "Who said it",
    "source": {
      "title": "Book title",
      "author": "Author name", 
      "type": "classic|modern|profit-original"
    }
  },
  "talk": {
    "text": "Profit's voice — direct, no fluff, why this matters (max 500 chars)",
    "tone": "direct|provoking|empathetic|brutal"
  },
  "usage": {
    "action": "Specific micro-action to take",
    "context": "When/how to apply",
    "timeMinutes": number (1-120)
  },
  "type": "quote-talk-usage",
  "category": ["systems", "habits"], // 1-3 from: power, discipline, systems, resilience, execution, mindset, habits, leadership, friction, compliance
  "difficulty": "easy|medium|hard|brutal",
  "engagement": {
    "likes": 0,
    "saves": 0,
    "shares": 0,
    "reflections": 0,
    "completions": 0
  },
  "reflectionPrompt": "Question to make them think",
  "createdAt": "2026-03-05T00:00:00Z",
  "updatedAt": "2026-03-05T00:00:00Z",
  "publishedAt": "2026-03-05T00:00:00Z",
  "isActive": true
}

VOICE GUIDELINES (Profit's tone):
- No "hey guys" or "here's the thing"
- Direct. Brutal when needed. No sugar.
- Short sentences. Punchy.
- Systems > Willpower. Always.
- Prison stories when relevant.
- "I got you" energy without saying it.

EXAMPLE:
Quote: "The strongest systems don't need consent. They make compliance the only logical path."
Talk: "You don't need more discipline. You need a system that makes the wrong choice harder than the right one. Motivation is a feeling. Systems are architecture."
Usage: "Identify one habit you struggle with. Add 20 seconds of friction to the wrong choice."
`;

export default canonPostSchema;