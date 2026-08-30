from typing import Dict, Any, List
from sqlalchemy.orm import Session
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder

class ValidationService:
    @staticmethod
    def validate_extracted_data(data: Dict[str, Any], db: Session) -> Dict[str, Any]:
        """
        Validates invoice field completeness, mathematical integrity, and DB existence.
        Returns validation_status ("VALID", "WARNING", "ERROR") and structured validation checks list.
        """
        checks: List[Dict[str, Any]] = []
        has_error = False
        has_warning = False

        # 1. Required Fields Check
        required_fields = ["invoice_number", "vendor_name", "total_amount"]
        for field in required_fields:
            val = data.get(field)
            if not val or (isinstance(val, (int, float)) and val <= 0):
                has_error = True
                checks.append({
                    "field": field,
                    "expected": "Non-empty / Positive value",
                    "actual": str(val),
                    "status": "ERROR",
                    "explanation": f"Mandatory field '{field}' is missing or non-positive."
                })
            else:
                checks.append({
                    "field": field,
                    "expected": "Present",
                    "actual": str(val),
                    "status": "VALID",
                    "explanation": f"Field '{field}' validated successfully."
                })

        # 2. Mathematical Integrity Check (Total == Subtotal + Tax)
        subtotal = float(data.get("subtotal", 0.0))
        tax = float(data.get("tax_amount", 0.0))
        total = float(data.get("total_amount", 0.0))

        calculated_total = round(subtotal + tax, 2)
        if abs(calculated_total - total) > 0.05: # > 5 cents difference
            has_error = True
            checks.append({
                "field": "total_amount",
                "expected": f"{calculated_total} (Subtotal {subtotal} + Tax {tax})",
                "actual": str(total),
                "status": "ERROR",
                "explanation": f"Mathematical mismatch: Invoice total ({total}) does not match subtotal + tax ({calculated_total})."
            })
        else:
            checks.append({
                "field": "math_integrity",
                "expected": f"{total}",
                "actual": f"{calculated_total}",
                "status": "VALID",
                "explanation": "Invoice mathematical totals are balanced."
            })

        # 3. Line Items Calculation Check
        line_items = data.get("line_items", [])
        for idx, item in enumerate(line_items):
            qty = float(item.get("quantity", 0.0))
            price = float(item.get("unit_price", 0.0))
            expected_line = round(qty * price, 2)
            actual_line = float(item.get("line_total", 0.0))
            if abs(expected_line - actual_line) > 0.05:
                has_warning = True
                checks.append({
                    "field": f"line_item_{idx+1}_total",
                    "expected": str(expected_line),
                    "actual": str(actual_line),
                    "status": "WARNING",
                    "explanation": f"Line item '{item.get('description')}' total ({actual_line}) differs from Qty * Unit Price ({expected_line})."
                })

        # 4. Vendor Existence Check
        vendor_name = data.get("vendor_name", "")
        existing_vendor = db.query(Vendor).filter(Vendor.name.ilike(f"%{vendor_name}%")).first()
        if not existing_vendor:
            has_warning = True
            checks.append({
                "field": "vendor_name",
                "expected": "Registered Master Vendor",
                "actual": vendor_name,
                "status": "WARNING",
                "explanation": f"Vendor '{vendor_name}' is not found in master vendor registry."
            })
        else:
            checks.append({
                "field": "vendor_name",
                "expected": existing_vendor.name,
                "actual": vendor_name,
                "status": "VALID",
                "explanation": f"Vendor recognized: ID #{existing_vendor.id} ({existing_vendor.name})."
            })

        # 5. PO Existence Check
        po_number = data.get("po_number")
        if po_number:
            existing_po = db.query(PurchaseOrder).filter(PurchaseOrder.po_number == po_number).first()
            if not existing_po:
                has_warning = True
                checks.append({
                    "field": "po_number",
                    "expected": "Valid Open PO",
                    "actual": po_number,
                    "status": "WARNING",
                    "explanation": f"Purchase Order '{po_number}' is not registered in PO database."
                })
            else:
                checks.append({
                    "field": "po_number",
                    "expected": existing_po.po_number,
                    "actual": po_number,
                    "status": "VALID",
                    "explanation": f"Purchase Order '{po_number}' found in PO system."
                })
        else:
            has_warning = True
            checks.append({
                "field": "po_number",
                "expected": "Purchase Order Number",
                "actual": "None",
                "status": "WARNING",
                "explanation": "Invoice has no associated Purchase Order (Non-PO Invoice)."
            })

        overall_status = "ERROR" if has_error else ("WARNING" if has_warning else "VALID")

        return {
            "validation_status": overall_status,
            "checks": checks
        }
