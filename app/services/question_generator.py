class QuestionGenerator:

    @staticmethod
    def generate_questions(
        role: str,
        domain: str,
        difficulty: str,
        interview_type: str,
        total_questions: int,
    ):

        questions = []

        for i in range(1, total_questions + 1):
            questions.append({
                "question_text": (
                    f"{domain} Question {i}: "
                    f"Explain an important {domain} concept for a "
                    f"{difficulty} {role} interview."
                ),
                "question_type": interview_type,
                "question_order": i,
                "expected_answer": None,
            })

        return questions