import math
import numpy as np
import pandas as pd
import json
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from sklearn.ensemble import IsolationForest

from app.models.invoice import Invoice
from app.models.purchase_order import PurchaseOrder
from app.models.goods_receipt import GoodsReceipt
from app.models.vendor import Vendor
from app.models.fraud import FraudAlert
from app.services.duplicate_detection import DuplicateDetectionService

class FraudDetectionService:
    @staticmethod
    def analyze_invoice_fraud(invoice: Invoice, db: Session) -> FraudAlert:
        """
        Multi-Layer Fraud Detection Engine:
        Layer A: Rule-Based Fraud Detection
        Layer B: Isolation Forest Anomaly Detection
        Layer C: Benford's Law Analysis
        Layer D: Composite Risk Score (0-100) & AI Explanation
        """
        rules_triggered = []
        rule_points = 0.0

        # --- LAYER A: RULE-BASED CHECKS ---
        # 1. Duplicate Check
        dup_result = DuplicateDetectionService.check_duplicate_risk(invoice, db)
        dup_score = dup_result["duplicate_risk_score"]
        if dup_score >= 80:
            rule_points += 30.0
            rules_triggered.append({
                "rule": "DUPLICATE_INVOICE_CRITICAL",
                "points": 30.0,
                "description": f"Critical duplicate risk: {', '.join(dup_result['reasons'])}"
            })
        elif dup_score >= 40:
            rule_points += 15.0
            rules_triggered.append({
                "rule": "DUPLICATE_INVOICE_SUSPICION",
                "points": 15.0,
                "description": f"Potential duplicate detected: {', '.join(dup_result['reasons'])}"
            })

        # 2. Missing PO or Unknown Vendor Check
        if not invoice.po_number:
            rule_points += 15.0
            rules_triggered.append({
                "rule": "MISSING_PURCHASE_ORDER",
                "points": 15.0,
                "description": "Invoice submitted without an associated Purchase Order (Unapproved Spending)."
            })
        else:
            po = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == invoice.po_number).first()
            if not po:
                rule_points += 20.0
                rules_triggered.append({
                    "rule": "INVALID_PO_NUMBER",
                    "points": 20.0,
                    "description": f"Purchase Order '{invoice.po_number}' does not exist in master system."
                })
            else:
                # 3. Price Inflation Check (Invoice > PO total)
                if invoice.total_amount > (po.total_amount * 1.05):
                    over_pct = round(((invoice.total_amount - po.total_amount) / po.total_amount) * 100, 1)
                    points = 25.0 if over_pct > 15 else 15.0
                    rule_points += points
                    rules_triggered.append({
                        "rule": "PRICE_INFLATION_DETECTED",
                        "points": points,
                        "description": f"Invoice total (${invoice.total_amount:,.2f}) exceeds PO limit (${po.total_amount:,.2f}) by {over_pct}%."
                    })

                # Check GRN existence
                grn = db.query(GoodsReceipt).filter(GoodsReceipt.po_number == invoice.po_number).first()
                if not grn:
                    rule_points += 10.0
                    rules_triggered.append({
                        "rule": "MISSING_GOODS_RECEIPT",
                        "points": 10.0,
                        "description": "Goods Receipt Note (GRN) has not been filed for this order."
                    })

        # 4. Unknown Vendor Check
        vendor = db.query(Vendor).filter(Vendor.name.ilike(f"%{invoice.vendor_name}%")).first()
        if not vendor:
            rule_points += 20.0
            rules_triggered.append({
                "rule": "UNKNOWN_VENDOR_ALERT",
                "points": 20.0,
                "description": f"Vendor '{invoice.vendor_name}' is not in master vendor list."
            })
        else:
            # Vendor Historical Deviation Check
            if vendor.total_invoices_count > 2 and vendor.avg_invoice_amount > 0:
                if invoice.total_amount > (vendor.avg_invoice_amount * 2.5):
                    rule_points += 15.0
                    rules_triggered.append({
                        "rule": "VENDOR_HISTORICAL_DEVIATION",
                        "points": 15.0,
                        "description": f"Invoice amount (${invoice.total_amount:,.2f}) is over 2.5x higher than vendor's average (${vendor.avg_invoice_amount:,.2f})."
                    })

        # --- LAYER B: ISOLATION FOREST ANOMALY MODEL ---
        isolation_anomaly, isolation_score_pt = FraudDetectionService._run_isolation_forest(invoice, db)
        if isolation_anomaly == "HIGHLY_SUSPICIOUS":
            rule_points += 20.0
            rules_triggered.append({
                "rule": "ISOLATION_FOREST_HIGH_ANOMALY",
                "points": 20.0,
                "description": "ML Isolation Forest flagged this invoice as an extreme statistical outlier across multi-variable billing patterns."
            })
        elif isolation_anomaly == "SUSPICIOUS":
            rule_points += 10.0
            rules_triggered.append({
                "rule": "ISOLATION_FOREST_MODERATE_ANOMALY",
                "points": 10.0,
                "description": "ML Isolation Forest flagged moderate statistical deviation in billing metrics."
            })

        # --- LAYER C: BENFORD'S LAW DIGIT DISTRIBUTION ---
        benford_dev = FraudDetectionService._calculate_benfords_law_deviation(db)
        if benford_dev > 0.15:
            rule_points += 5.0
            rules_triggered.append({
                "rule": "BENFORDS_LAW_DEVIATION",
                "points": 5.0,
                "description": f"Overall invoice dataset exhibits a high Benford's Law first-digit anomaly score ({round(benford_dev, 3)})."
            })

        # --- LAYER D: COMPOSITE RISK SCORE (0 to 100) ---
        final_risk_score = round(min(100.0, max(0.0, rule_points)), 1)
        if final_risk_score <= 20:
            risk_level = "LOW"
        elif final_risk_score <= 50:
            risk_level = "MEDIUM"
        elif final_risk_score <= 75:
            risk_level = "HIGH"
        else:
            risk_level = "CRITICAL"

        # Generate Explainable Narrative
        from app.services.explainable_ai_service import ExplainableAIService
        narrative = ExplainableAIService.generate_fraud_explanation(
            invoice=invoice,
            risk_score=final_risk_score,
            risk_level=risk_level,
            rules_triggered=rules_triggered,
            duplicate_info=dup_result
        )

        # Create or Update FraudAlert record
        existing_alert = db.query(FraudAlert).filter(FraudAlert.invoice_id == invoice.id).first()
        if not existing_alert:
            alert = FraudAlert(
                invoice_id=invoice.id,
                risk_score=final_risk_score,
                risk_level=risk_level,
                duplicate_suspicion_score=round(dup_score, 1),
                isolation_forest_anomaly=isolation_anomaly,
                benford_law_deviation=round(benford_dev, 4),
                rules_triggered=json.dumps(rules_triggered),
                explainable_summary=narrative
            )
            db.add(alert)
        else:
            existing_alert.risk_score = final_risk_score
            existing_alert.risk_level = risk_level
            existing_alert.duplicate_suspicion_score = round(dup_score, 1)
            existing_alert.isolation_forest_anomaly = isolation_anomaly
            existing_alert.benford_law_deviation = round(benford_dev, 4)
            existing_alert.rules_triggered = json.dumps(rules_triggered)
            existing_alert.explainable_summary = narrative
            alert = existing_alert

        db.commit()
        db.refresh(alert)
        return alert

    @staticmethod
    def _run_isolation_forest(current_inv: Invoice, db: Session):
        """
        Runs Isolation Forest anomaly detector on invoice features:
        Feature 1: total_amount
        Feature 2: item_count
        Feature 3: subtotal / (total_amount + 1) ratio
        """
        all_invoices = db.query(Invoice).all()
        if len(all_invoices) < 3:
            return "NORMAL", 0.0

        data = []
        for inv in all_invoices:
            data.append([
                float(inv.total_amount),
                float(len(inv.items) if inv.items else 1),
                float(inv.subtotal / (inv.total_amount + 0.01))
            ])

        X = np.array(data)
        clf = IsolationForest(contamination=0.15, random_state=42)
        clf.fit(X)

        current_vector = np.array([[
            float(current_inv.total_amount),
            float(len(current_inv.items) if current_inv.items else 1),
            float(current_inv.subtotal / (current_inv.total_amount + 0.01))
        ]])

        pred = clf.predict(current_vector)[0] # -1 for anomaly, 1 for normal
        score = clf.decision_function(current_vector)[0]

        if pred == -1:
            if score < -0.15:
                return "HIGHLY_SUSPICIOUS", 20.0
            return "SUSPICIOUS", 10.0
        return "NORMAL", 0.0

    @staticmethod
    def _calculate_benfords_law_deviation(db: Session) -> float:
        """
        Calculates Mean Absolute Deviation (MAD) of first digits of all invoice amounts vs Benford's Law.
        Benford Expected First Digit Frequencies:
        1: 30.1%, 2: 17.6%, 3: 12.5%, 4: 9.7%, 5: 7.9%, 6: 6.7%, 7: 5.8%, 8: 5.1%, 9: 4.6%
        """
        benford_expected = {1: 0.301, 2: 0.176, 3: 0.125, 4: 0.097, 5: 0.079, 6: 0.067, 7: 0.058, 8: 0.051, 9: 0.046}
        invoices = db.query(Invoice).all()
        if not invoices:
            return 0.0

        first_digits = []
        for inv in invoices:
            val_str = str(int(abs(inv.total_amount)))
            for char in val_str:
                if char in "123456789":
                    first_digits.append(int(char))
                    break

        if not first_digits:
            return 0.0

        total_count = len(first_digits)
        actual_counts = {d: first_digits.count(d) / total_count for d in range(1, 10)}

        mad = sum(abs(actual_counts[d] - benford_expected[d]) for d in range(1, 10)) / 9.0
        return mad
