import re
from typing import List, Dict

class RuleEngineAgent:
    def __init__(self):
        # Deterministic checks for common fraud patterns
        self.rules = {
            "upfront_payment": [
                r"(?i)\b(processing fee|upfront payment|refundable deposit|equipment fee|onboarding fee)\b",
                r"(?i)\bpay\s+\$?(\d+)\s+before\s+starting\b"
            ],
            "suspicious_contact": [
                r"(?i)\b(telegram|whatsapp)\s*(?:app)?\s*:\s*\+?\d+\b",
                r"(?i)[a-zA-Z0-9._%+-]+@(yahoo|hotmail|gmail|protonmail)\.com" # Free emails for 'corporate' offers
            ],
            "urgency": [
                r"(?i)\b(act fast|immediate action required|limited time offer|urgent response)\b"
            ]
        }

    def evaluate(self, text: str, document_type: str) -> List[Dict]:
        flags = []
        
        for rule_category, patterns in self.rules.items():
            for pattern in patterns:
                matches = re.finditer(pattern, text)
                for match in matches:
                    flags.append({
                        "category": rule_category,
                        "matched_text": match.group(0),
                        "description": f"Found suspicious pattern matching '{rule_category}'"
                    })
                    
        return flags
