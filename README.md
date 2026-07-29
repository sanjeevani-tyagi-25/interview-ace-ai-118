# Interview AI Pro

Build a modern, premium, responsive React + Tailwind CSS web application called InterviewAI – AI Powered Mock Interview Platform.

The design should feel like ChatGPT, Vercel, Linear, and Notion combined: clean, minimal, professional, with smooth animations and rounded cards.

Color Theme

 Primary: #2563EB

 Secondary: #14B8A6

 Background: #F8FAFC

 Cards: White

 Accent: Purple gradients for AI sections

Navigation

Create a responsive navbar with:

 Logo: InterviewAI

 Home

 Features

 How It Works

 Dashboard

 Login

 Register

Landing Page

Include:

 Hero section with headline:
"Crack Your Next Interview with AI"

 Subtitle explaining the platform

 CTA buttons:

 Start Free Interview

 Explore Features

 AI-themed illustration

 Statistics cards

 Feature cards

 Testimonials

 FAQ

 Footer

Authentication

Create:

 Login Page

 Register Page

Login should contain:

 Email

 Password

 Login button

Register should contain:

 Full Name

 Email

 Password

 Confirm Password

Dashboard

After login, display:

 Sidebar

 Welcome card

 Interview statistics

 Resume Score card

 Recent Interviews

 Quick Actions

Sidebar menu:

 Dashboard

 Start Interview

 Resume Analyzer

 History

 Profile

 Settings

 Logout

Start Interview

Allow the user to choose:

 HR Interview

 DSA Interview

 Machine Learning

 Data Science

 System Design

 Aptitude

Difficulty:

 Easy

 Medium

 Hard

Include a Start Interview button.

AI Interview Screen

Layout:

 Question panel

 Timer

 Webcam placeholder

 Microphone placeholder

 Large answer text box

 Previous button

 Next button

 Submit Interview button

Resume Analyzer

Include:

 Drag & Drop Resume Upload

 ATS Score

 Skills Found

 Missing Skills

 Suggestions

 Download Report button

Interview Report

Show:

 Overall Score

 Technical Score

 Communication Score

 Confidence Score

 Progress bars

 Radar chart placeholder

 AI Suggestions

Interview History

Show previous interviews in cards with:

 Date

 Domain

 Score

 View Report button

Profile

Show:

 Profile picture

 Name

 Email

 Skills

 Resume Upload

 Edit Profile

Settings

Include:

 Dark Mode

 Notifications

 Change Password

Technical Requirements

 React

 Tailwind CSS

 React Router

 Axios

 Framer Motion

 React Icons

 Fully responsive

 Component-based architecture

 Clean folder structure

 Use mock data only (no backend integration yet)

 Keep all API calls in a separate services folder so they can later be connected to a FastAPI backend.  also make the website in dark theme also Phase 2 (Premium UI)

We'll add these sections one by one:

✅ Hero Section (Done)

⬜ Trusted by Companies

⬜ Features Cards

⬜ AI Demo Section

⬜ How it Works

⬜ Pricing

⬜ Testimonials

⬜ FAQ

⬜ Footer

⬜ Login

⬜ Register

⬜ Dashboard

First let's make the Hero premium

Add these animations:

Floating glowing circles

Gradient blobs

Mouse hover animation

Button glow

Smooth fade-in

Floating AI illustration

Like:

          🤖

Crack Your Dream Interview

      [Start Free]

      [Watch Demo]

★★★★★

10,000+ Students

Then Features Section

Six premium cards.

┌──────────────┐

│ 🤖 Mock AI   │

└──────────────┘

┌──────────────┐

│ 📄 Resume AI │

└──────────────┘

┌──────────────┐

│ 🎤 Voice AI  │

└──────────────┘

┌──────────────┐

│ 💻 Coding    │

└──────────────┘

┌──────────────┐

│ 📊 Reports   │

└──────────────┘

┌──────────────┐

│ 💬 Feedback  │

└──────────────┘

Each card will:

hover up

glow

scale slightly

animate smoothly

Then Dashboard

This will be the real app.

Sidebar

🏠 Dashboard

🎤 Mock Interview

📄 Resume

💻 Coding

📊 Reports

⚙ Settings

Main page:

Welcome Back Sanjeevani 👋

Interview Score

██████████

Resume Score

█████████

Recent Interviews

This is where your FastAPI backend will connect.

My suggestion

Don't jump to login yet.

Let's first finish the entire landing page so that when someone opens your project, they immediately think:

"Wow, this looks like a real startup."

Then we'll connect:

Login

Register

JWT Authentication

Dashboard

Resume Upload

AI Interview

Voice Interview

Reports

We're building this like a production application, one polished piece at a time. 🚀

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://interview-ace-ai-118.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/12b66559-e6e0-48ed-8f8c-14e65cfa6bc5).

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
