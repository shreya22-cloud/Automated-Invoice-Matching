from typing import List, Dict, Any

class ExplainableAIService:
    @staticmethod
    def generate_fraud_explanation(
        invoice: Any,
        risk_score: float,
        risk_level: str,
        rules_triggered: List[Dict[str, Any]],
        duplicate_info: Dict[str, Any]
    ) -> str:
        """
        AI Financial Investigation Assistant Narrative Generator.
        Generates structured, human-readable explanations summarizing key risk factors.
        """
        if risk_level == "LOW":
            return (
                f"This invoice (#{invoice.invoice_number}) is classified as LOW RISK (Score: {risk_score}/100). "
                f"The vendor '{invoice.vendor_name}' is verified, 3-way matching with Purchase Order '{invoice.po_number or 'N/A'}' "
                f"is within acceptable financial tolerances, and no duplicate or anomalous billing patterns were detected."
            )

        # Build bullet points from triggered rules
        reasons_text = ""
        for idx, item in enumerate(rules_triggered, 1):
            reasons_text += f"\n{idx}. {item['description']}"

        summary = (
            f"Financial Risk Analysis Report: Invoice #{invoice.invoice_number} submitted by '{invoice.vendor_name}' "
            f"has been classified as {risk_level} RISK (Overall Fraud Score: {risk_score}/100).\n\n"
            f"Key Audit Risk Findings:"
            f"{reasons_text}\n\n"
            f"Recommendation: "
        )

        if risk_level in ["HIGH", "CRITICAL"]:
            summary += (
                f"Do not process automated payment. Route to the Exception Management Center for manual review by an AP Analyst "
                f"or Financial Auditor to verify vendor billing legitimacy and check for duplicate disbursements."
            )
        else: # MEDIUM
            summary += (
                f"Flagged for secondary verification. Review Purchase Order unit pricing and confirm receipt of goods "
                f"before authorizing disbursement."
            )

        return summary
