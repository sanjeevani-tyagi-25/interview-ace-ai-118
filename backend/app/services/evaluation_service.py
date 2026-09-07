import os
import json

from dotenv import load_dotenv
from google import genai

# ============================================================
# LOAD ENVIRONMENT
# ============================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

client = None

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
    print("✅ Gemini client initialized for answer evaluation.")
else:
    print("⚠️ GEMINI_API_KEY not found.")
    print("➡️ Local answer evaluator will be used.")


# ============================================================
# LOCAL FALLBACK EVALUATOR
# ============================================================

def local_evaluate_answer(question: str, answer: str):
    """
    Local fallback evaluator.

    Used when Gemini is unavailable, quota is exceeded,
    or Gemini returns an invalid response.

    Returns:
    {
        "score": int,
        "feedback": str
    }
    """

    answer_clean = answer.strip()

    # --------------------------------------------------------
    # Empty answer
    # --------------------------------------------------------

    if not answer_clean:
        return {
            "score": 0,
            "feedback": "No answer was provided."
        }

    # --------------------------------------------------------
    # Very short answer
    # --------------------------------------------------------

    word_count = len(answer_clean.split())

    if word_count < 5:
        return {
            "score": 3,
            "feedback": (
                "The answer is too brief. Try to explain your "
                "thought process and provide more relevant details."
            )
        }

    # --------------------------------------------------------
    # Basic quality estimation
    # --------------------------------------------------------

    score = 5

    # Longer answers generally provide more information
    if word_count >= 30:
        score += 1

    if word_count >= 60:
        score += 1

    if word_count >= 100:
        score += 1

    # --------------------------------------------------------
    # Look for useful explanatory patterns
    # --------------------------------------------------------

    useful_words = [
        "because",
        "example",
        "experience",
        "project",
        "worked",
        "learned",
        "implemented",
        "developed",
        "problem",
        "solution",
        "result",
        "technology",
        "python",
        "machine learning",
        "software",
    ]

    answer_lower = answer_clean.lower()

    matched_words = sum(
        1 for word in useful_words
        if word in answer_lower
    )

    if matched_words >= 2:
        score += 1

    if matched_words >= 4:
        score += 1

    # Maximum 10
    score = min(score, 10)

    # --------------------------------------------------------
    # Feedback
    # --------------------------------------------------------

    if score >= 8:
        feedback = (
            "Good answer. It is reasonably detailed and "
            "demonstrates relevant knowledge and experience."
        )

    elif score >= 6:
        feedback = (
            "Good start. The answer is relevant, but you could "
            "add more specific examples and explain your "
            "experience in greater detail."
        )

    else:
        feedback = (
            "The answer needs more detail. Try to explain your "
            "reasoning, provide an example, and connect your "
            "answer directly to the question."
        )

    return {
        "score": score,
        "feedback": feedback
    }


# ============================================================
# GEMINI ANSWER EVALUATION
# ============================================================

def evaluate_answer(question: str, answer: str):
    """
    Evaluate candidate answer.

    First attempts Gemini AI evaluation.

    If Gemini is unavailable, quota is exceeded,
    or the response is invalid, automatically uses
    the local fallback evaluator.
    """

    # ========================================================
    # CHECK GEMINI
    # ========================================================

    if not client:
        print(
            "⚠️ Gemini unavailable. "
            "Using local evaluator."
        )

        return local_evaluate_answer(
            question,
            answer
        )

    # ========================================================
    # PROMPT
    # ========================================================

    prompt = f"""
You are an expert technical interviewer.

Evaluate the candidate's answer to the interview question.

Question:
{question}

Candidate Answer:
{answer}

Give a score from 0 to 10.

Consider:

- Correctness
- Technical understanding
- Relevance
- Clarity
- Completeness

Important:

- Evaluate the actual candidate answer.
- Do not give 0 unless the answer is completely empty,
  irrelevant, or fundamentally incorrect.
- Be fair and realistic.
- Return ONLY valid JSON.
- Do not use Markdown.
- Do not include ```json.
- Do not include any explanation outside the JSON.

Required format:

{{
    "score": 8,
    "feedback": "Good answer, but the explanation could be more detailed."
}}
"""

    # ========================================================
    # TRY GEMINI
    # ========================================================

    try:

        print("\n========================================")
        print("🤖 GEMINI ANSWER EVALUATION")
        print("========================================")

        response = client.models.generate_content(
            model="gemini-flash-latest",
            contents=prompt,
        )

        if not response or not response.text:
            raise ValueError(
                "Gemini returned an empty response."
            )

        text = response.text.strip()

        print("\n========== GEMINI RESPONSE ==========")
        print(text)
        print("======================================\n")

        # ----------------------------------------------------
        # Remove Markdown fences
        # ----------------------------------------------------

        if text.startswith("```json"):
            text = text[7:]

        elif text.startswith("```"):
            text = text[3:]

        if text.endswith("```"):
            text = text[:-3]

        text = text.strip()

        # ----------------------------------------------------
        # Parse JSON
        # ----------------------------------------------------

        result = json.loads(text)

        # ----------------------------------------------------
        # Validate
        # ----------------------------------------------------

        if "score" not in result:
            raise ValueError(
                "Gemini response missing score."
            )

        if "feedback" not in result:
            raise ValueError(
                "Gemini response missing feedback."
            )

        score = int(result["score"])

        score = max(
            0,
            min(10, score)
        )

        feedback = str(
            result["feedback"]
        ).strip()

        print("✅ Gemini evaluation successful.")
        print(f"📊 Score: {score}/10")

        return {
            "score": score,
            "feedback": feedback
        }

    # ========================================================
    # GEMINI FAILURE → LOCAL FALLBACK
    # ========================================================

    except Exception as e:

        error_message = str(e)

        # Don't dump the huge Gemini error into the terminal
        # for normal quota failures.

        if "429" in error_message or "RESOURCE_EXHAUSTED" in error_message:

            print(
                "⚠️ Gemini quota exceeded."
            )

        else:

            print(
                "⚠️ Gemini evaluation unavailable."
            )

        print(
            "➡️ Switching to local answer evaluator."
        )

        # ----------------------------------------------------
        # LOCAL EVALUATION
        # ----------------------------------------------------

        result = local_evaluate_answer(
            question,
            answer
        )

        print(
            f"✅ Local evaluation complete: "
            f"{result['score']}/10"
        )

        return result