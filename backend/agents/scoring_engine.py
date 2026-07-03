from typing import List, Dict

class RiskScoringEngine:
    """
    Deterministically calculates the Trust Score based on the formula:
    30% - Rule Engine (Hard flags)
    20% - Metadata Analysis
    20% - OCR Consistency
    20% - AI Semantic Analysis (Gemini)
    10% - Image/File Integrity
    """
    
    def calculate_score(
        self, 
        rule_flags: List[Dict], 
        ai_analysis: Dict, 
        metadata_score: float = 100, 
        ocr_consistency: float = 100, 
        integrity_score: float = 100
    ) -> float:
        
        # 1. Rule Engine Score (30%)
        # Deduct 15 points per hard flag, max deduction 100% of the 30 points
        rule_penalty = len(rule_flags) * 15
        rule_score_component = max(0, 100 - rule_penalty)
        weighted_rule = (rule_score_component * 0.30)
        
        # 2. Metadata Score (20%)
        weighted_metadata = (metadata_score * 0.20)
        
        # 3. OCR Consistency Score (20%)
        weighted_ocr = (ocr_consistency * 0.20)
        
        # 4. AI Semantic Analysis Score (20%)
        ai_score = ai_analysis.get('ai_score', 50)
        weighted_ai = (ai_score * 0.20)
        
        # 5. Integrity Score (10%)
        weighted_integrity = (integrity_score * 0.10)
        
        final_score = weighted_rule + weighted_metadata + weighted_ocr + weighted_ai + weighted_integrity
        
        return round(final_score, 1)
