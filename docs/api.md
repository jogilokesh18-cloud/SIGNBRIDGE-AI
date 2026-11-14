# SIGNBRIDGE AI — Core REST API Documentation

Base URL: `/api/v1`

## 1. Authentication (`/auth`)

### `GET /auth/me`
Retrieves current authenticated profile.
- **Headers:** `Authorization: Bearer <token>`
- **Response:**
```json
{
  "success": true,
  "data": {
    "id": "usr-default-001",
    "full_name": "SignBridge User",
    "preferred_language": "en-US",
    "role": "user"
  }
}
```

### `PATCH /auth/profile`
Updates user profile settings and accessibility preferences.
- **Body:**
```json
{
  "full_name": "Jane Signer",
  "accessibility_settings": {
    "highContrast": true,
    "reducedMotion": false
  }
}
```

## 2. Recognition (`/recognition`)

### `POST /recognition/session`
Starts a recognition or practice session.
- **Body:** `{ "session_type": "recognition" }`
- **Response:** Status `201 Created`

### `POST /recognition/events`
Records a confirmed prediction event into the session log.
- **Body:**
```json
{
  "session_id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "predicted_letter": "A",
  "confidence": 0.94,
  "confirmed": true,
  "model_version": "asl-static-v1"
}
```

### `GET /recognition/stats`
Returns aggregated dashboard metrics.

## 3. Learning & Alphabet (`/learning`)

### `GET /learning/alphabet`
Returns all 26 verified ASL alphabet entries (A-Z) with descriptions, gesture types, and SVG paths.

### `GET /learning/alphabet/:letter`
Returns comprehensive anatomical instructions and visually similar sign comparisons for a single letter.

### `POST /learning/ai-explain`
Calls Google Gemini AI to generate beginner-friendly learning instructions grounded in the verified reference.

## 4. Translation & Reverse Player (`/translation`)

### `POST /translation/text-to-sign`
Converts input text into an ordered sequence of verified fingerspelling signs.
- **Body:** `{ "text": "HELLO" }`
- **Response:**
```json
{
  "success": true,
  "data": {
    "original_text": "HELLO",
    "normalized_text": "HELLO",
    "mode": "fingerspelling",
    "sequence": [
      { "character": "H", "media_url": "/assets/signs/H.svg", "gesture_type": "static" },
      { "character": "E", "media_url": "/assets/signs/E.svg", "gesture_type": "static" }
    ],
    "unsupported_characters": [],
    "complete": true
  }
}
```

### `POST /translation/compose`
Google Gemini AI text polishing endpoint that improves punctuation and capitalization while preserving exact meaning.

## 5. Messages (`/messages`)
Full CRUD endpoints for saving, retrieving, updating, and deleting communication logs.
