from sqlalchemy.orm import Session
from rapidfuzz import fuzz
from typing import Dict, Any, List
import math

from app.models.invoice import Invoice

class DuplicateDetectionService:
    @staticmethod
    def check_duplicate_risk(invoice: Invoice, db: Session) -> Dict[str, Any]:
        """
        Analyzes historical invoices in DB for duplicate submissions.
        Returns duplicate risk score (0-100), risk level, and list of matching reasons.
        """
        # Retrieve all historical invoices except current invoice
        historical_invoices = db.query(Invoice).filter(
            Invoice.id != invoice.id,
            Invoice.vendor_name == invoice.vendor_name
        ).all()

        if not historical_invoices:
            # Also check across ALL vendors for identical invoice number
            historical_invoices = db.query(Invoice).filter(Invoice.id != invoice.id).all()

        max_risk_score = 0.0
        reasons = []
        similar_invoices = []

        for hist_inv in historical_invoices:
            current_risk = 0.0
            flag_reasons = []

            # 1. Exact Invoice Number match
            num_similarity = fuzz.ratio(invoice.invoice_number.upper(), hist_inv.invoice_number.upper())
            if invoice.invoice_number.upper() == hist_inv.invoice_number.upper():
                current_risk += 95.0
                flag_reasons.append(f"Identical Invoice Number '{hist_inv.invoice_number}' previously submitted on {hist_inv.created_at.strftime('%Y-%m-%d')}.")
            elif num_similarity >= 85:
                current_risk += 45.0
                flag_reasons.append(f"Highly similar Invoice Number '{hist_inv.invoice_number}' ({round(num_similarity, 1)}% string match).")

            # 2. Vendor Match & Exact Amount match
            vendor_match = (invoice.vendor_name.lower() == hist_inv.vendor_name.lower())
            amount_diff = abs(invoice.total_amount - hist_inv.total_amount)
            
            if vendor_match and amount_diff < 0.01:
                current_risk += 40.0
                flag_reasons.append(f"Same vendor '{hist_inv.vendor_name}' with identical total amount (${hist_inv.total_amount:,.2f}).")
            elif vendor_match and invoice.total_amount > 0 and (amount_diff / invoice.total_amount) < 0.02:
                current_risk += 20.0
                flag_reasons.append(f"Same vendor '{hist_inv.vendor_name}' with near-identical total amount (${hist_inv.total_amount:,.2f}).")

            # 3. Date Proximity Check
            if invoice.invoice_date and hist_inv.invoice_date:
                days_diff = abs((invoice.invoice_date - hist_inv.invoice_date).days)
                if days_diff <= 14 and vendor_match and current_risk > 30:
                    current_risk += 15.0
                    flag_reasons.append(f"Submitted within {days_diff} days of previous invoice #{hist_inv.invoice_number}.")

            current_risk = min(100.0, current_risk)
            if current_risk > max_risk_score:
                max_risk_score = current_risk
                reasons = flag_reasons
                similar_invoices.append({
                    "id": hist_inv.id,
                    "invoice_number": hist_inv.invoice_number,
                    "amount": hist_inv.total_amount,
                    "date": hist_inv.created_at.strftime('%Y-%m-%d'),
                    "similarity_risk": round(current_risk, 1)
                })

        return {
            "duplicate_risk_score": round(max_risk_score, 1),
            "reasons": reasons,
            "similar_invoices": similar_invoices[:3]
        }
