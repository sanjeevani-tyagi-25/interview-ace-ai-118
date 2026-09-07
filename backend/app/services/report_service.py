import os
import json
import re

from dotenv import load_dotenv
from google import genai


load_dotenv()


# ============================================================
# GEMINI CLIENT
# ============================================================

api_key = os.getenv("GEMINI_API_KEY")

client = None

if api_key:
    client = genai.Client(api_key=api_key)


# ============================================================
# SAFE SCORE HELPER
# ============================================================

def safe_score(value, default=0):
    """
    Convert a value into an integer between 0 and 100.
    """

    try:
        score = int(float(value))
    except (ValueError, TypeError):
        score = default

    return max(0, min(100, score))


# ============================================================
# EXTRACT QUESTIONS FROM Q&A TEXT
# ============================================================

def extract_questions(questions_and_answers: str):
    """
    Extract interview questions from the Q&A text.

    Returns:
        [
            {
                "question_number": 1,
                "question": "..."
            },
            ...
        ]
    """

    questions = []

    pattern = r"Question:\s*(.*?)\s*Answer:"

    matches = re.findall(
        pattern,
        questions_and_answers,
        re.DOTALL,
    )

    for index, question in enumerate(matches, start=1):

        question = question.strip()

        if question:

            questions.append(
                {
                    "question_number": index,
                    "question": question,
                }
            )

    return questions


# ============================================================
# FALLBACK REPORT
# ============================================================

def generate_fallback_report(
    questions_and_answers: str,
    answer_scores: list[int] | None = None,
):
    """
    Generate a local fallback report when Gemini is unavailable.

    Answer scores received from the interview are expected
    to be between 0 and 10.
    """

    scores = []

    # ========================================================
    # GET REAL ANSWER SCORES
    # ========================================================

    if answer_scores:

        for score in answer_scores:

            try:

                score = int(float(score))

                score = max(
                    0,
                    min(10, score),
                )

                scores.append(score)

            except (
                ValueError,
                TypeError,
            ):

                pass

    # ========================================================
    # BACKUP: EXTRACT SCORES FROM Q&A TEXT
    # ========================================================

    if not scores:

        for line in questions_and_answers.splitlines():

            line = line.strip()

            if line.startswith("Score:"):

                try:

                    value = (
                        line
                        .split("Score:", 1)[1]
                        .strip()
                    )

                    score = int(float(value))

                    score = max(
                        0,
                        min(10, score),
                    )

                    scores.append(score)

                except (
                    ValueError,
                    TypeError,
                ):

                    pass

    # ========================================================
    # CALCULATE OVERALL SCORE
    # ========================================================

    if scores:

        average_score = (
            sum(scores) / len(scores)
        )

        overall_score = round(
            average_score * 10
        )

    else:

        overall_score = 0

    overall_score = safe_score(
        overall_score
    )

    # ========================================================
    # CATEGORY SCORES
    #
    # These are fallback estimates only.
    # Gemini will provide the real category scores
    # when available.
    # ========================================================

    technical_score = safe_score(
        overall_score - 2
    )

    answer_quality_score = safe_score(
        overall_score + 1
    )

    problem_solving_score = safe_score(
        overall_score
    )

    communication_score = safe_score(
        overall_score + 2
    )

    # ========================================================
    # EXTRACT QUESTIONS
    # ========================================================

    extracted_questions = extract_questions(
        questions_and_answers
    )

    # ========================================================
    # COUNT ANSWERED QUESTIONS
    # ========================================================

    answered_count = 0

    for line in questions_and_answers.splitlines():

        line = line.strip()

        if line.startswith("Answer:"):

            answer_text = (
                line
                .split("Answer:", 1)[1]
                .strip()
            )

            if (
                answer_text
                and answer_text.lower()
                != "no answer"
            ):

                answered_count += 1

    # ========================================================
    # TOTAL QUESTIONS
    # ========================================================

    total_questions = len(
        extracted_questions
    )

    if total_questions == 0:

        total_questions = len(scores)

    unanswered_count = max(
        0,
        total_questions - answered_count,
    )

    # ========================================================
    # GENERAL FEEDBACK
    # ========================================================

    if overall_score >= 90:

        strengths = (
            "The candidate demonstrated excellent "
            "overall interview performance with "
            "strong communication, relevant answers, "
            "and good problem-solving ability."
        )

        weaknesses = (
            "Minor improvements can be made by "
            "adding greater technical depth and "
            "more specific examples."
        )

        suggestions = (
            "Continue practicing advanced technical "
            "concepts and support answers with "
            "specific real-world examples."
        )

        final_feedback = (
            "Excellent overall performance. The "
            "candidate demonstrates strong interview "
            "readiness and communicates ideas clearly."
        )

    elif overall_score >= 80:

        strengths = (
            "The candidate demonstrated strong "
            "understanding of the interview topics "
            "and provided generally effective answers."
        )

        weaknesses = (
            "Some answers could benefit from greater "
            "technical depth and more concrete examples."
        )

        suggestions = (
            "Continue practicing technical communication, "
            "problem solving, and explaining solutions "
            "with real-world examples."
        )

        final_feedback = (
            "Strong overall performance. The candidate "
            "shows good interview readiness with some "
            "opportunities for further improvement."
        )

    elif overall_score >= 60:

        strengths = (
            "The candidate demonstrated a reasonable "
            "understanding of several interview concepts."
        )

        weaknesses = (
            "Some answers lacked technical depth, "
            "clarity, or complete explanations."
        )

        suggestions = (
            "Practice explaining concepts step by step "
            "and provide specific examples when answering."
        )

        final_feedback = (
            "Moderate performance. The candidate has "
            "a good foundation but should improve depth, "
            "clarity, and completeness."
        )

    else:

        strengths = (
            "The candidate showed some understanding "
            "of the interview topics."
        )

        weaknesses = (
            "The candidate needs improvement in technical "
            "depth and completeness of answers."
        )

        if unanswered_count > 0:

            weaknesses += (
                f" {unanswered_count} question(s) "
                "were not answered."
            )

        suggestions = (
            "Practice core technical concepts, problem "
            "solving, and structured interview answering. "
            "Make sure to attempt every question."
        )

        final_feedback = (
            "The candidate should strengthen their "
            "fundamentals and practice providing "
            "complete, structured answers."
        )

    # ========================================================
    # CREATE QUESTION-WISE FALLBACK REPORT
    # ========================================================

    question_reports = []

    for index, item in enumerate(
        extracted_questions
    ):

        if index < len(scores):

            question_score = (
                scores[index] * 10
            )

        else:

            question_score = 0

        question_score = safe_score(
            question_score
        )

        # ----------------------------------------------
        # Generate simple remark
        # ----------------------------------------------

        if question_score >= 90:

            remark = (
                "Excellent response. The answer "
                "was strong, relevant, and clearly "
                "communicated."
            )

        elif question_score >= 80:

            remark = (
                "Good response with relevant points. "
                "Adding more depth and specific "
                "examples could make it stronger."
            )

        elif question_score >= 70:

            remark = (
                "Fair response. The answer could "
                "be improved with clearer explanations "
                "and more relevant examples."
            )

        elif question_score > 0:

            remark = (
                "The response needs improvement. "
                "Focus on clarity, relevance, and "
                "providing a more complete explanation."
            )

        else:

            remark = (
                "No answer was provided for this "
                "question."
            )

        question_reports.append(
            {
                "question_number": item[
                    "question_number"
                ],
                "question": item[
                    "question"
                ],
                "score": question_score,
                "remark": remark,
            }
        )

    # ========================================================
    # DEBUG
    # ========================================================

    print(
        f"📊 FALLBACK SCORES: {scores}"
    )

    print(
        f"📊 FALLBACK OVERALL SCORE: "
        f"{overall_score}"
    )

    print(
        f"📊 FALLBACK QUESTION REPORTS: "
        f"{len(question_reports)}"
    )

    # ========================================================
    # RETURN FALLBACK REPORT
    # ========================================================

    return {
        "overall_score": overall_score,

        "technical_score": technical_score,

        "answer_quality_score": (
            answer_quality_score
        ),

        "problem_solving_score": (
            problem_solving_score
        ),

        "communication_score": (
            communication_score
        ),

        "strengths": strengths,

        "weaknesses": weaknesses,

        "suggestions": suggestions,

        "final_feedback": final_feedback,

        "question_reports": question_reports,
    }


# ============================================================
# AI REPORT
# ============================================================

def generate_report(
    questions_and_answers: str,
    answer_scores: list[int] | None = None,
):
    """
    Generate an AI-powered interview report using Gemini.

    If Gemini is unavailable or quota is exceeded,
    automatically use the local fallback report.
    """

    # ========================================================
    # GEMINI PROMPT
    # ========================================================

    prompt = f"""
You are a Senior FAANG interviewer and professional
interview evaluator.

Below are the complete interview questions, candidate
answers, answer scores, and answer feedback.

{questions_and_answers}

Evaluate the COMPLETE interview carefully.

============================================================
SCORING
============================================================

Generate these five scores from 0 to 100:

1. overall_score
2. technical_score
3. answer_quality_score
4. problem_solving_score
5. communication_score

Use the following criteria:

OVERALL SCORE:
Overall interview performance.

TECHNICAL UNDERSTANDING:
Technical correctness, conceptual understanding,
accuracy, and depth.

ANSWER QUALITY:
Relevance, completeness, structure, examples,
and how directly the candidate answered the question.

PROBLEM SOLVING:
Logical thinking, reasoning, approach to problems,
and ability to explain solutions.

COMMUNICATION:
Clarity, confidence, organization, conciseness,
and ability to communicate ideas effectively.

Do NOT simply copy the overall score into every category.
Evaluate each category independently.

============================================================
QUESTION-WISE EVALUATION
============================================================

For EVERY question in the interview, generate:

- question_number
- question
- score from 0 to 100
- remark

The question score should evaluate the candidate's
answer to that specific question.

The remark should be concise but useful.

Do NOT include the candidate's answer in the
question_reports section.

The number of question_reports MUST exactly match
the number of interview questions.

Keep the original question text unchanged.

============================================================
GENERAL FEEDBACK
============================================================

Generate:

strengths:
The candidate's strongest areas.

weaknesses:
The candidate's main weaknesses.

suggestions:
Specific and actionable improvement suggestions.

final_feedback:
A concise final assessment of the candidate's
overall interview performance and readiness.

============================================================
IMPORTANT
============================================================

Return ONLY valid JSON.

Do NOT use markdown.

Do NOT use ```json.

Do NOT add any explanation outside the JSON.

Use EXACTLY this structure:

{{
    "overall_score": 94,
    "technical_score": 90,
    "answer_quality_score": 95,
    "problem_solving_score": 92,
    "communication_score": 96,

    "strengths": "Describe the candidate's strongest areas.",

    "weaknesses": "Describe the candidate's weakest areas.",

    "suggestions": "Give specific and actionable suggestions.",

    "final_feedback": "Give the final interview assessment.",

    "question_reports": [
        {{
            "question_number": 1,
            "question": "Original interview question",
            "score": 95,
            "remark": "Specific remark about the candidate's response."
        }},
        {{
            "question_number": 2,
            "question": "Original interview question",
            "score": 92,
            "remark": "Specific remark about the candidate's response."
        }}
    ]
}}
"""

    # ========================================================
    # TRY GEMINI
    # ========================================================

    if client:

        try:

            print(
                "\n========================================"
            )

            print(
                "🤖 GEMINI INTERVIEW REPORT"
            )

            print(
                "========================================"
            )

            response = client.models.generate_content(
                model="gemini-flash-latest",
                contents=prompt,
            )

            if not response.text:

                raise ValueError(
                    "Gemini returned an empty response."
                )

            text = response.text.strip()

            # =================================================
            # REMOVE MARKDOWN CODE FENCES
            # =================================================

            if text.startswith("```json"):

                text = text[7:]

            elif text.startswith("```"):

                text = text[3:]

            if text.endswith("```"):

                text = text[:-3]

            text = text.strip()

            # =================================================
            # PARSE JSON
            # =================================================

            report_data = json.loads(
                text
            )

            # =================================================
            # REQUIRED FIELDS
            # =================================================

            required_fields = [
                "overall_score",
                "technical_score",
                "answer_quality_score",
                "problem_solving_score",
                "communication_score",
                "strengths",
                "weaknesses",
                "suggestions",
                "final_feedback",
                "question_reports",
            ]

            for field in required_fields:

                if field not in report_data:

                    raise ValueError(
                        "Gemini report is missing "
                        f"field: {field}"
                    )

            # =================================================
            # VALIDATE CATEGORY SCORES
            # =================================================

            report_data[
                "overall_score"
            ] = safe_score(
                report_data[
                    "overall_score"
                ]
            )

            report_data[
                "technical_score"
            ] = safe_score(
                report_data[
                    "technical_score"
                ]
            )

            report_data[
                "answer_quality_score"
            ] = safe_score(
                report_data[
                    "answer_quality_score"
                ]
            )

            report_data[
                "problem_solving_score"
            ] = safe_score(
                report_data[
                    "problem_solving_score"
                ]
            )

            report_data[
                "communication_score"
            ] = safe_score(
                report_data[
                    "communication_score"
                ]
            )

            # =================================================
            # VALIDATE QUESTION REPORTS
            # =================================================

            if not isinstance(
                report_data[
                    "question_reports"
                ],
                list,
            ):

                raise ValueError(
                    "question_reports must be a list."
                )

            original_questions = (
                extract_questions(
                    questions_and_answers
                )
            )

            ai_question_reports = (
                report_data[
                    "question_reports"
                ]
            )

            # =================================================
            # MAKE SURE QUESTION COUNT MATCHES
            # =================================================

            if len(ai_question_reports) != len(
                original_questions
            ):

                raise ValueError(
                    "Gemini returned "
                    f"{len(ai_question_reports)} "
                    "question reports, but the interview "
                    f"contains {len(original_questions)} "
                    "questions."
                )

            # =================================================
            # VALIDATE EACH QUESTION REPORT
            # =================================================

            cleaned_question_reports = []

            for index, original in enumerate(
                original_questions
            ):

                item = (
                    ai_question_reports[index]
                )

                if not isinstance(
                    item,
                    dict,
                ):

                    raise ValueError(
                        f"Invalid question report "
                        f"at index {index}."
                    )

                score = safe_score(
                    item.get(
                        "score",
                        0,
                    )
                )

                remark = item.get(
                    "remark"
                )

                if not remark:

                    remark = (
                        "The response was evaluated "
                        "based on relevance, clarity, "
                        "and completeness."
                    )

                # IMPORTANT:
                # Always use the original question
                # from our database instead of trusting
                # Gemini to reproduce it perfectly.

                cleaned_question_reports.append(
                    {
                        "question_number": (
                            original[
                                "question_number"
                            ]
                        ),
                        "question": (
                            original[
                                "question"
                            ]
                        ),
                        "score": score,
                        "remark": str(
                            remark
                        ),
                    }
                )

            report_data[
                "question_reports"
            ] = cleaned_question_reports

            # =================================================
            # DEBUG OUTPUT
            # =================================================

            print(
                "✅ Gemini report generated successfully."
            )

            print(
                f"📊 Overall: "
                f"{report_data['overall_score']}/100"
            )

            print(
                f"📊 Technical: "
                f"{report_data['technical_score']}/100"
            )

            print(
                f"📊 Answer Quality: "
                f"{report_data['answer_quality_score']}/100"
            )

            print(
                f"📊 Problem Solving: "
                f"{report_data['problem_solving_score']}/100"
            )

            print(
                f"📊 Communication: "
                f"{report_data['communication_score']}/100"
            )

            print(
                f"📊 Question Reports: "
                f"{len(report_data['question_reports'])}"
            )

            print(
                "========================================\n"
            )

            return report_data

        # ====================================================
        # GEMINI ERROR
        # ====================================================

        except Exception as error:

            print(
                "\n⚠️ Gemini report generation failed."
            )

            print(
                f"⚠️ Reason: {error}"
            )

            print(
                "🔄 Switching to fallback report..."
            )

    else:

        print(
            "⚠️ GEMINI_API_KEY not configured."
        )

        print(
            "🔄 Using fallback report..."
        )

    # ========================================================
    # FALLBACK
    # ========================================================

    fallback_report = generate_fallback_report(
        questions_and_answers,
        answer_scores,
    )

    print(
        "✅ Fallback report generated successfully."
    )

    return fallback_report