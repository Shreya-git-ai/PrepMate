# PrepMate UI Prototype

Build a UI prototype for "PrepMate" — an AI-powered study assistant web app for students. This is a clickable prototype only (no real backend needed, use mock/dummy data).

Pages/screens needed:

1. Home / Upload page — clean dashboard where student can upload PDF notes (drag-drop area), see list of previously uploaded materials as cards

2. Chat / Ask Questions page — chat interface where student types a question and gets an answer, with small citation tags showing which notes the answer came from

3. Topic Summary page — shows auto-generated key topics from uploaded notes as expandable cards, each with a short bullet-point summary

4. Quiz page — MCQ quiz interface, one question at a time, with progress bar, timer optional, submit button

5. Results / Weak Topics page — after quiz, show score, and a visual breakdown (bar chart or tag cloud) of weak topics across ALL uploaded materials, not just current quiz

6. Revision page — short bullet-point revision notes for weak topics only, with a "Re-test this topic" button

Style: clean, minimal, student-friendly. Soft colors (blues/purples), rounded cards, good whitespace, mobile-responsive. Think Notion x Duolingo aesthetic — friendly but not childish. Use a sidebar nav: Home, Ask, Quiz, Progress.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/4048b952-2191-40e6-a422-7a53f6b70bae).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
