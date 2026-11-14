# SIGNBRIDGE AI — Privacy, Security & Ethical Grounding

## 1. Zero Camera Video Retention
Camera privacy is an absolute pillar of SIGNBRIDGE AI:
- Webcam video frames are processed in volatile browser memory.
- No video feeds, image frames, or photos are ever transmitted across the network or stored on server disks.
- When navigating away from the recognition page, all camera tracks (`MediaStreamTrack`) are immediately terminated and hardware camera activity indicators turn off.

## 2. Row Level Security & Data Isolation
- PostgreSQL Row Level Security (RLS) is strictly enforced on all user-facing tables.
- Users can view and mutate only their own sessions, events, and saved messages.
- Role-based access control enforces administrative permissions server-side.

## 3. Gemini AI Safety & Privacy
- User Gemini API keys are never exposed to the frontend.
- AI requests are strictly limited to educational explanations and optional text polishing.
- Raw webcam video is never sent to Gemini.
- Suggested wording must be explicitly accepted or rejected by the user.

## 4. Ethical Sign Language Considerations
- Fingerspelling is explicitly distinguished from natural conversational ASL grammar.
- Medical and emergency triage disclaimers prevent unsafe reliance.
