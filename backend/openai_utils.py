from openai import OpenAI
from backend.SECRETS import OPEN_AI_KEY


client = OpenAI(api_key=OPEN_AI_KEY)


def generate_event_description(prompt: str) -> str:
    """
    Generates a professional description using OpenAI GPT.

    Args:
        prompt (str): The user-provided prompt.

    Returns:
        str: The AI-generated professional description.
    """
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[{"role": "user", "content": prompt}],
            temperature=0
        )
        return response.choices[0].message.content
    except Exception as e:
        raise Exception(f"OpenAI API error: {e}")