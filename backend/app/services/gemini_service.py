import os

from dotenv import load_dotenv
from google import genai

# Load environment variables
load_dotenv()

# Get Gemini API key
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# Create Gemini client only if API key exists
client = None

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    print("⚠️ GEMINI_API_KEY not found. Using fallback questions.")


# ============================================================
# FALLBACK QUESTIONS
# ============================================================

FALLBACK_QUESTIONS = {
    "HR": [
        "Tell me about yourself and your background.",
        "What are your greatest strengths and weaknesses?",
        "Why do you want to join our company?",
        "Describe a challenging situation you faced and how you handled it.",
        "Where do you see yourself in the next five years?",
        "How do you handle pressure and tight deadlines?",
        "Tell me about a time when you worked successfully in a team.",
        "How do you handle disagreement with a teammate?",
        "Why should we hire you for this role?",
        "Do you have any questions for the interviewer?",
    ],

    "DSA": [
        "What is the difference between an array and a linked list?",
        "Explain the time complexity of binary search.",
        "What is a stack and where is it commonly used?",
        "What is the difference between BFS and DFS?",
        "Explain the concept of recursion with an example.",
        "What is the difference between a binary tree and a binary search tree?",
        "How does a hash table work?",
        "What is the difference between merge sort and quick sort?",
        "Explain what Big O notation represents.",
        "How would you find duplicate elements in an array efficiently?",
    ],

    "Machine Learning": [
        "What is the difference between supervised and unsupervised learning?",
        "Explain the bias-variance trade-off.",
        "What is overfitting and how can it be prevented?",
        "Explain the difference between classification and regression.",
        "What is cross-validation and why is it useful?",
        "Explain precision, recall, and F1-score.",
        "What is feature engineering?",
        "How does a decision tree make predictions?",
        "What is gradient descent?",
        "How would you evaluate a machine learning model in a real-world application?",
    ],

    "Data Science": [
        "What is the difference between mean, median, and mode?",
        "How would you handle missing values in a dataset?",
        "What is the difference between correlation and causation?",
        "Explain the purpose of exploratory data analysis.",
        "What is the difference between SQL WHERE and HAVING?",
        "How would you detect outliers in a dataset?",
        "Explain the difference between supervised and unsupervised learning.",
        "What is normalization and why is it useful?",
        "How would you optimize a Python script processing a large dataset?",
        "How would you communicate insights from data to a non-technical stakeholder?",
    ],

    "System Design": [
        "What is scalability and why is it important?",
        "What is the difference between vertical and horizontal scaling?",
        "Explain the role of a load balancer.",
        "What is caching and when would you use it?",
        "What is the difference between SQL and NoSQL databases?",
        "Explain the concept of database sharding.",
        "What is a microservices architecture?",
        "How would you design a URL shortening service?",
        "What is eventual consistency?",
        "How would you design a highly available web application?",
    ],

    "Aptitude": [
        "If a train travels 120 kilometers in 2 hours, what is its average speed?",
        "What is the probability of getting a head when a fair coin is tossed?",
        "If the ratio of two numbers is 3:5 and their sum is 64, find the numbers.",
        "A product costs ₹800 and is sold at a 15% profit. What is its selling price?",
        "What is the average of 10, 20, 30, 40, and 50?",
        "If 5 workers complete a task in 12 days, how many days would 10 workers take at the same rate?",
        "Find the next number in the sequence: 2, 4, 8, 16, ...",
        "A number is increased by 20% and then decreased by 20%. What is the overall percentage change?",
        "If x + 5 = 15, what is the value of x?",
        "How would you approach solving a complex logical reasoning problem under time pressure?",
    ],
}


# ============================================================
# GET FALLBACK QUESTIONS
# ============================================================

def get_fallback_questions(
    domain: str,
    total_questions: int,
):
    """
    Returns built-in questions when Gemini is unavailable.
    """

    # Try exact domain first
    questions = FALLBACK_QUESTIONS.get(domain)

    # Case-insensitive matching
    if not questions:
        for key, value in FALLBACK_QUESTIONS.items():
            if key.lower() == domain.lower():
                questions = value
                break

    # Generic fallback
    if not questions:
        questions = [
            "Tell me about yourself and your technical background.",
            "What are your strongest technical skills?",
            "Describe a challenging project you have worked on.",
            "How do you approach solving a difficult problem?",
            "How do you debug an application when something goes wrong?",
            "Explain one project you are particularly proud of.",
            "How do you learn a new technology?",
            "Describe a situation where you worked as part of a team.",
            "What is one technical area you want to improve?",
            "Why do you think you are suitable for this role?",
        ]

    # Repeat if somehow more questions are requested
    while len(questions) < total_questions:
        questions.extend(questions)

    return questions[:total_questions]


# ============================================================
# GENERATE QUESTIONS
# ============================================================

def generate_questions(
    company: str,
    role: str,
    domain: str,
    difficulty: str,
    interview_type: str,
    total_questions: int,
):
    prompt = f"""
You are an expert technical interviewer.

Generate exactly {total_questions} interview questions.

Company: {company}
Role: {role}
Domain: {domain}
Difficulty: {difficulty}
Interview Type: {interview_type}

Rules:

- Return ONLY the interview questions.
- Do NOT return answers.
- One question per line.
- Number the questions from 1 to {total_questions}.
"""

    # --------------------------------------------------------
    # Try Gemini first
    # --------------------------------------------------------

    if client:
        try:
            print("🤖 Generating interview questions using Gemini...")

            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=prompt,
            )

            if response.text:
                text = response.text.strip()

                print("\n========== GEMINI RESPONSE ==========")
                print(text)
                print("=====================================\n")

                questions = []

                for line in text.split("\n"):
                    line = line.strip()

                    if not line:
                        continue

                    # Remove numbering like:
                    # 1. Question
                    # 2. Question
                    if "." in line:
                        first, rest = line.split(".", 1)

                        if first.strip().isdigit():
                            line = rest.strip()

                    if line:
                        questions.append(line)

                # Only accept Gemini response if we actually
                # received enough questions.
                if len(questions) >= total_questions:
                    print("✅ Gemini questions generated successfully.")

                    return questions[:total_questions]

                print(
                    f"⚠️ Gemini returned only {len(questions)} questions. "
                    f"Using fallback questions."
                )

            else:
                print("⚠️ Gemini returned an empty response.")

        except Exception as e:
            print("\n⚠️ Gemini unavailable.")
            print(f"Reason: {e}")
            print("➡️ Switching to built-in fallback questions.\n")

    # --------------------------------------------------------
    # FALLBACK
    # --------------------------------------------------------

    questions = get_fallback_questions(
        domain=domain,
        total_questions=total_questions,
    )

    print(
        f"✅ Using fallback {domain} questions "
        f"({len(questions)} questions)."
    )

    return questions