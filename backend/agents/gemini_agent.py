import json
import datetime
import google.generativeai as genai
from utils.config import settings
from typing import Dict

# Configure the API key if provided
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiAgent:
    def __init__(self):
        # List of models to try in order of preference
        self.supported_models = [
            "gemini-2.5-flash",
            "gemini-2.0-flash",
            "gemini-flash-latest",
            "gemini-1.5-flash",
            "gemini-pro"
        ]
        
    def _generate_with_fallback(self, prompt: str):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY is not set.")
            
        last_exception = None
        for model_name in self.supported_models:
            try:
                # Try with JSON response type first (supported in 1.5+)
                try:
                    model = genai.GenerativeModel(model_name, generation_config={"response_mime_type": "application/json"})
                    response = model.generate_content(prompt)
                    return response
                except Exception as e:
                    # If JSON generation config fails (e.g., older model like gemini-pro), try without it
                    if "response_mime_type" in str(e) or "400" in str(e):
                        model = genai.GenerativeModel(model_name)
                        response = model.generate_content(prompt)
                        return response
                    else:
                        raise e
            except Exception as e:
                last_exception = e
                print(f"Model {model_name} failed: {e}. Trying next...")
                continue
                
        raise RuntimeError(f"All fallback models failed. Last error: {last_exception}")

    def classify_document(self, extracted_text: str) -> str:
        """
        Classifies the document into one of the known DocumentCategory values.
        """
        if not settings.GEMINI_API_KEY:
            return "UNKNOWN"
            
        prompt = f"""
        You are an expert document classifier. Classify the following text into ONE of these exact categories:
        JOB_OFFER, CERTIFICATE, PAYMENT_PROOF, LEGAL_DOCUMENT, NEWS_MEDIA, UNKNOWN.
        
        Text to classify:
        {extracted_text[:3000]}
        
        Return ONLY a JSON object with a single key 'category'.
        """
        try:
            response = self._generate_with_fallback(prompt)
            
            # Clean potential markdown from response
            text = response.text.strip()
            if text.startswith("```json"): text = text[7:]
            elif text.startswith("```"): text = text[3:]
            if text.endswith("```"): text = text[:-3]
            
            data = json.loads(text.strip())
            return data.get('category', 'UNKNOWN').upper()
        except Exception as e:
            print(f"Classification failed: {e}")
            return "UNKNOWN"

    def analyze_trust(self, extracted_text: str, document_category: str) -> Dict:
        """
        Performs semantic analysis to find hidden red flags, positive indicators, and generate an AI score.
        """
        if not settings.GEMINI_API_KEY:
            return {
                "ai_score": 100,
                "ai_flags": [],
                "ai_positive": [],
                "summary": "AI Analysis bypassed (No API Key).",
                "recommendation": "Manual review required."
            }

        current_date = datetime.date.today().strftime("%d %b %Y")
        prompt = f"""
        You are a highly advanced fraud detection AI named VerifyAI. 
        CRITICAL CONTEXT: Today's current date is {current_date}. When evaluating any dates found in the document, use this as the present day. Do not assume dates in 2026 are in the future if they are before today.
        
        Your task is to analyze the following extracted text from a {document_category}.
        Identify any subtle red flags, grammatical inconsistencies, unrealistic claims, or positive credibility indicators.
        
        Text to analyze:
        {extracted_text[:5000]}
        
        Return a strict JSON object with the following schema:
        {{
            "ai_score": (int from 0 to 100, where 100 is perfectly safe and 0 is absolute fraud),
            "ai_flags": [list of strings describing subtle red flags found],
            "ai_positive": [list of strings describing credibility indicators],
            "summary": "A 2-sentence summary of your findings",
            "recommendation": "A 1-sentence strict recommendation on how to proceed"
        }}
        """
        try:
            response = self._generate_with_fallback(prompt)
            
            # Clean potential markdown from response
            text = response.text.strip()
            if text.startswith("```json"): text = text[7:]
            elif text.startswith("```"): text = text[3:]
            if text.endswith("```"): text = text[:-3]
            
            return json.loads(text.strip())
        except Exception as e:
            print(f"AI Analysis failed: {e}")
            return {
                "ai_score": 50,
                "ai_flags": [f"AI Analysis failed to process the document: {str(e)}"],
                "ai_positive": [],
                "summary": "AI Analysis encountered an error.",
                "recommendation": "Please review manually."
            }
