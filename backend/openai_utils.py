import openai

# Set the OpenAI API key
openai.api_key = "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"

def generate_event_description(prompt: str) -> str:
    """
    Generates a professional description using OpenAI GPT.

    Args:
        prompt (str): The user-provided prompt.

    Returns:
        str: The AI-generated professional description.
    """
    try:
        messages = [{"role": "user", "content": prompt}]
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages,
            temperature=0
        )
        return response.choices[0].message["content"]
    except Exception as e:
        raise Exception(f"OpenAI API error: {e}")
