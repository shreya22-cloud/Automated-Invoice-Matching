from sqlalchemy.orm import Session
from rapidfuzz import fuzz
from typing import Dict, Any, Optional
import json

from app.models.invoice import Invoice
from app.models.purchase_order import PurchaseOrder
from app.models.goods_receipt import GoodsReceipt
from app.models.matching import MatchingResult
from app.models.settings import SystemSetting

class MatchingService:
    @staticmethod
    def perform_3way_matching(invoice: Invoice, db: Session) -> MatchingResult:
        """
        Executes 3-way matching algorithm comparing Invoice ↔ Purchase Order ↔ Goods Receipt Note.
        Applies configurable tolerances and fuzzy text matching.
        """
        # Load configurable thresholds from SystemSettings or defaults
        amount_tol_pct = MatchingService._get_setting_float(db, "amount_tolerance_pct", 0.5)
        qty_tol_units = MatchingService._get_setting_float(db, "quantity_tolerance_units", 1.0)
        similarity_thresh = MatchingService._get_setting_float(db, "fuzzy_similarity_threshold_pct", 80.0)

        details = {
            "vendor": {},
            "po": {},
            "grn": {},
            "quantities": [],
            "prices": [],
            "total_amount": {}
        }

        # 1. Fetch matching PO
        po = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == invoice.po_number).first() if invoice.po_number else None
        
        # 2. Fetch matching GRN
        grn = None
        if invoice.po_number:
            grn = db.query(GoodsReceipt).filter(GoodsReceipt.po_number == invoice.po_number).first()

        # A. Vendor Match
        vendor_matched = False
        vendor_sim_score = 0.0
        if po:
            vendor_sim_score = float(fuzz.token_sort_ratio(invoice.vendor_name, po.vendor_name))
            vendor_matched = vendor_sim_score >= similarity_thresh
            details["vendor"] = {
                "invoice_vendor": invoice.vendor_name,
                "po_vendor": po.vendor_name,
                "similarity_score": round(vendor_sim_score, 1),
                "matched": vendor_matched
            }
        else:
            details["vendor"] = {
                "invoice_vendor": invoice.vendor_name,
                "po_vendor": None,
                "similarity_score": 0.0,
                "matched": False
            }

        # B. PO Match
        po_matched = (po is not None)
        po_sim_score = 100.0 if po_matched else 0.0
        details["po"] = {
            "invoice_po": invoice.po_number,
            "matched": po_matched
        }

        # C. GRN Match
        grn_matched = (grn is not None)
        details["grn"] = {
            "matched": grn_matched,
            "grn_number": grn.grn_number if grn else None
        }

        # D. Price & Total Amount Match
        price_matched = True
        total_matched = False
        item_sim_score = 100.0

        if po:
            # Check total amount difference
            po_total = po.total_amount
            inv_total = invoice.total_amount
            allowed_diff = (amount_tol_pct / 100.0) * po_total
            total_diff = abs(inv_total - po_total)
            
            total_matched = total_diff <= max(allowed_diff, 0.5)
            
            details["total_amount"] = {
                "invoice_total": inv_total,
                "po_total": po_total,
                "difference": round(total_diff, 2),
                "allowed_tolerance_pct": amount_tol_pct,
                "matched": total_matched
            }

            # Check individual item prices against PO items
            for inv_item in invoice.items:
                best_item_match = None
                best_sim = 0.0
                for po_item in po.items:
                    sim = fuzz.token_sort_ratio(inv_item.item_description, po_item.item_description)
                    if sim > best_sim:
                        best_sim = sim
                        best_item_match = po_item
                
                if best_item_match:
                    unit_diff = abs(inv_item.unit_price - best_item_match.unit_price)
                    price_ok = unit_diff <= (amount_tol_pct / 100.0 * best_item_match.unit_price + 0.1)
                    if not price_ok:
                        price_matched = False
                    details["prices"].append({
                        "invoice_item": inv_item.item_description,
                        "invoice_price": inv_item.unit_price,
                        "po_item": best_item_match.item_description,
                        "po_price": best_item_match.unit_price,
                        "matched": price_ok
                    })
        else:
            price_matched = False
            total_matched = False

        # E. Quantity Match (Invoice vs GRN / PO)
        quantity_matched = True
        if grn and grn.items:
            for inv_item in invoice.items:
                best_grn_item = None
                best_sim = 0.0
                for grn_item in grn.items:
                    sim = fuzz.token_sort_ratio(inv_item.item_description, grn_item.item_description)
                    if sim > best_sim:
                        best_sim = sim
                        best_grn_item = grn_item
                
                if best_grn_item:
                    qty_diff = abs(inv_item.quantity - best_grn_item.quantity_accepted)
                    qty_ok = qty_diff <= qty_tol_units
                    if not qty_ok:
                        quantity_matched = False
                    details["quantities"].append({
                        "item": inv_item.item_description,
                        "invoice_qty": inv_item.quantity,
                        "grn_qty": best_grn_item.quantity_accepted,
                        "matched": qty_ok
                    })
                else:
                    quantity_matched = False
        elif po:
            for inv_item in invoice.items:
                best_po_item = None
                best_sim = 0.0
                for po_item in po.items:
                    sim = fuzz.token_sort_ratio(inv_item.item_description, po_item.item_description)
                    if sim > best_sim:
                        best_sim = sim
                        best_po_item = po_item
                if best_po_item:
                    qty_diff = abs(inv_item.quantity - best_po_item.quantity)
                    qty_ok = qty_diff <= qty_tol_units
                    if not qty_ok:
                        quantity_matched = False
                    details["quantities"].append({
                        "item": inv_item.item_description,
                        "invoice_qty": inv_item.quantity,
                        "po_qty": best_po_item.quantity,
                        "matched": qty_ok
                    })
        else:
            quantity_matched = False

        # F. Overall Match Status Determination
        if vendor_matched and po_matched and grn_matched and quantity_matched and price_matched and total_matched:
            overall_status = "EXACT_MATCH"
        elif vendor_matched and po_matched and total_matched and (quantity_matched or grn_matched):
            overall_status = "ACCEPTABLE_VARIANCE"
        elif po_matched:
            overall_status = "EXCEPTION"
        else:
            overall_status = "NO_MATCH"

        # Create or update MatchingResult record
        existing_result = db.query(MatchingResult).filter(MatchingResult.invoice_id == invoice.id).first()
        if not existing_result:
            result = MatchingResult(
                invoice_id=invoice.id,
                vendor_matched=vendor_matched,
                po_matched=po_matched,
                grn_matched=grn_matched,
                quantity_matched=quantity_matched,
                price_matched=price_matched,
                total_matched=total_matched,
                vendor_similarity_score=round(vendor_sim_score, 1),
                po_similarity_score=round(po_sim_score, 1),
                item_similarity_score=round(item_sim_score, 1),
                overall_match_status=overall_status,
                match_details=json.dumps(details)
            )
            db.add(result)
        else:
            existing_result.vendor_matched = vendor_matched
            existing_result.po_matched = po_matched
            existing_result.grn_matched = grn_matched
            existing_result.quantity_matched = quantity_matched
            existing_result.price_matched = price_matched
            existing_result.total_matched = total_matched
            existing_result.vendor_similarity_score = round(vendor_sim_score, 1)
            existing_result.po_similarity_score = round(po_sim_score, 1)
            existing_result.overall_match_status = overall_status
            existing_result.match_details = json.dumps(details)
            result = existing_result

        db.commit()
        db.refresh(result)

        # Update invoice overall status based on 3-way match
        if overall_status in ["EXACT_MATCH", "ACCEPTABLE_VARIANCE"]:
            invoice.status = "MATCHED"
        else:
            invoice.status = "EXCEPTION"
        db.commit()

        return result

    @staticmethod
    def _get_setting_float(db: Session, key: str, default_val: float) -> float:
        setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
        if setting and setting.value:
            try:
                return float(setting.value)
            except ValueError:
                pass
        return default_val
