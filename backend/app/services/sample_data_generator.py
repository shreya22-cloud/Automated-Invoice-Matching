from sqlalchemy.orm import Session
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext

from app.models.user import User
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.models.goods_receipt import GoodsReceipt, GoodsReceiptItem
from app.models.invoice import Invoice, InvoiceItem
from app.models.fraud import FraudAlert
from app.models.settings import SystemSetting
from app.services.matching_service import MatchingService
from app.services.fraud_detection import FraudDetectionService
from app.services.audit_service import AuditService

pwd_context = CryptContext(schemes=["pbkdf2_sha256"], deprecated="auto")

class SampleDataGenerator:
    @staticmethod
    def ensure_seeded_demo_data(db: Session):
        """Seed the operational menu data when any core datasets are missing."""
        has_vendor_data = db.query(Vendor).first() is not None
        has_po_data = db.query(PurchaseOrder).first() is not None
        has_grn_data = db.query(GoodsReceipt).first() is not None
        has_invoice_data = db.query(Invoice).first() is not None
        has_alert_data = db.query(FraudAlert).first() is not None
        has_setting_data = db.query(SystemSetting).first() is not None

        if has_vendor_data and has_po_data and has_grn_data and has_invoice_data and has_alert_data and has_setting_data:
            return {"status": "already_seeded", "message": "Operational data already exists in database."}

        return SampleDataGenerator.seed_all_demo_data(db)

    @staticmethod
    def seed_all_demo_data(db: Session):
        """
        Seeds complete production-like demo data with users, vendors, POs, GRNs, and synthetic invoices.
        """
        if db.query(Vendor).first() or db.query(PurchaseOrder).first() or db.query(Invoice).first():
            return {"status": "already_seeded", "message": "Demo data already exists in database."}

        # 1. Seed Users
        hashed_password = pwd_context.hash("password123")
        users = []
        for email, full_name, role in [
            ("admin@fraudlens.ai", "Sarah Jenkins (Admin)", "ADMIN"),
            ("analyst@fraudlens.ai", "Michael Chen (AP Analyst)", "AP_ANALYST"),
            ("auditor@fraudlens.ai", "David Ross (Auditor)", "AUDITOR")
        ]:
            if not db.query(User).filter(User.email == email).first():
                users.append(User(email=email, full_name=full_name, hashed_password=hashed_password, role=role))

        if users:
            db.add_all(users)
            db.commit()

        # 2. Seed System Settings
        settings = [
            SystemSetting(key="amount_tolerance_pct", value="0.5", description="Percentage variance allowed in total invoice amount"),
            SystemSetting(key="quantity_tolerance_units", value="1.0", description="Quantity discrepancy allowed between invoice and GRN"),
            SystemSetting(key="fuzzy_similarity_threshold_pct", value="80.0", description="Minimum fuzzy string match similarity percentage")
        ]
        db.add_all(settings)
        db.commit()

        # 3. Seed Master Vendors
        now = datetime.now(timezone.utc)
        v1 = Vendor(name="Apex Tech Solutions", tax_id="TAX-998811", email="billing@apextech.com", phone="+1-555-0192", address="100 Silicon Way, CA", risk_tier="LOW", total_invoices_count=12, avg_invoice_amount=15000.0)
        v2 = Vendor(name="Global Logistics Corp", tax_id="TAX-772233", email="ap@globallogistics.com", phone="+1-555-0283", address="450 Freight Blvd, TX", risk_tier="LOW", total_invoices_count=8, avg_invoice_amount=8500.0)
        v3 = Vendor(name="Nexus Hardware Ltd", tax_id="TAX-441155", email="invoices@nexushardware.com", phone="+1-555-0374", address="78 Industrial Pkwy, NY", risk_tier="MEDIUM", total_invoices_count=5, avg_invoice_amount=42000.0)
        v4 = Vendor(name="Acme Office Supplies", tax_id="TAX-112244", email="sales@acmeofficesupplies.com", phone="+1-555-0465", address="12 Commerce St, IL", risk_tier="LOW", total_invoices_count=20, avg_invoice_amount=2100.0)
        v5 = Vendor(name="Vertex Financial Consulting", tax_id="TAX-556677", email="billing@vertexconsulting.io", phone="+1-555-0556", address="500 Park Ave, NY", risk_tier="HIGH", total_invoices_count=2, avg_invoice_amount=12000.0)

        db.add_all([v1, v2, v3, v4, v5])
        db.commit()

        # 4. Seed Purchase Orders
        po1 = PurchaseOrder(
            po_number="PO-5001",
            vendor_id=v1.id,
            vendor_name=v1.name,
            order_date=now - timedelta(days=10),
            status="OPEN",
            subtotal=10000.0,
            tax_amount=1800.0,
            total_amount=11800.0
        )
        po1_item = PurchaseOrderItem(item_description="Enterprise Laptop Workstations", quantity=2.0, unit_price=5000.0, total_price=10000.0)
        po1.items.append(po1_item)

        po2 = PurchaseOrder(
            po_number="PO-5002",
            vendor_id=v2.id,
            vendor_name=v2.name,
            order_date=now - timedelta(days=15),
            status="OPEN",
            subtotal=8000.0,
            tax_amount=800.0,
            total_amount=8800.0
        )
        po2_item = PurchaseOrderItem(item_description="International Freight Shipment Containers", quantity=4.0, unit_price=2000.0, total_price=8000.0)
        po2.items.append(po2_item)

        po3 = PurchaseOrder(
            po_number="PO-5003",
            vendor_id=v3.id,
            vendor_name=v3.name,
            order_date=now - timedelta(days=5),
            status="OPEN",
            subtotal=35000.0,
            tax_amount=3500.0,
            total_amount=38500.0
        )
        po3_item = PurchaseOrderItem(item_description="Rack Server R750 64-Core", quantity=5.0, unit_price=7000.0, total_price=35000.0)
        po3.items.append(po3_item)

        po4 = PurchaseOrder(
            po_number="PO-5004",
            vendor_id=v4.id,
            vendor_name=v4.name,
            order_date=now - timedelta(days=20),
            status="OPEN",
            subtotal=2000.0,
            tax_amount=200.0,
            total_amount=2200.0
        )
        po4_item = PurchaseOrderItem(item_description="Ergonomic Executive Desk Chairs", quantity=10.0, unit_price=200.0, total_price=2000.0)
        po4.items.append(po4_item)

        db.add_all([po1, po2, po3, po4])
        db.commit()

        # 5. Seed Goods Receipt Notes (GRN)
        grn1 = GoodsReceipt(
            grn_number="GRN-8001",
            po_number="PO-5001",
            po_id=po1.id,
            vendor_name=v1.name,
            receipt_date=now - timedelta(days=8),
            warehouse_location="Dock A - Tech Warehouse",
            received_by="John Doe (Logistics)",
            notes="All 2 laptops inspected and verified intact."
        )
        grn1.items.append(GoodsReceiptItem(item_description="Enterprise Laptop Workstations", quantity_received=2.0, quantity_accepted=2.0, quantity_rejected=0.0))

        grn2 = GoodsReceipt(
            grn_number="GRN-8002",
            po_number="PO-5002",
            po_id=po2.id,
            vendor_name=v2.name,
            receipt_date=now - timedelta(days=12),
            warehouse_location="Dock C - Shipping Terminal",
            received_by="Sarah Connor",
            notes="Containers received in good condition."
        )
        grn2.items.append(GoodsReceiptItem(item_description="International Freight Shipment Containers", quantity_received=4.0, quantity_accepted=4.0, quantity_rejected=0.0))

        grn4 = GoodsReceipt(
            grn_number="GRN-8004",
            po_number="PO-5004",
            po_id=po4.id,
            vendor_name=v4.name,
            receipt_date=now - timedelta(days=18),
            warehouse_location="Main Office Storage",
            received_by="David Miller",
            notes="Only 5 desk chairs delivered out of 10 ordered."
        )
        grn4.items.append(GoodsReceiptItem(item_description="Ergonomic Executive Desk Chairs", quantity_received=5.0, quantity_accepted=5.0, quantity_rejected=0.0))

        db.add_all([grn1, grn2, grn4])
        db.commit()

        # 6. Seed Invoices Demonstrating Realistic Scenarios
        # Scenario 1: Clean Exact Match (Approved)
        inv1 = Invoice(
            invoice_number="INV-1001",
            invoice_date=now - timedelta(days=7),
            vendor_id=v1.id,
            vendor_name=v1.name,
            vendor_tax_id=v1.tax_id,
            po_number="PO-5001",
            currency="USD",
            subtotal=10000.0,
            tax_amount=1800.0,
            total_amount=11800.0,
            ocr_confidence=98.5,
            status="APPROVED",
            file_name="invoice_apex_1001.pdf",
            validation_status="VALID",
            validation_notes="Invoice validated cleanly against PO-5001 and GRN-8001."
        )
        inv1.items.append(InvoiceItem(item_description="Enterprise Laptop Workstations", quantity=2.0, unit_price=5000.0, tax=1800.0, line_total=10000.0, confidence=99.0))
        db.add(inv1)
        db.commit()
        MatchingService.perform_3way_matching(inv1, db)
        FraudDetectionService.analyze_invoice_fraud(inv1, db)

        # Scenario 2: Price Inflation Fraud Anomaly (High Risk)
        inv2 = Invoice(
            invoice_number="INV-1002",
            invoice_date=now - timedelta(days=4),
            vendor_id=v2.id,
            vendor_name=v2.name,
            vendor_tax_id=v2.tax_id,
            po_number="PO-5002",
            currency="USD",
            subtotal=10800.0,
            tax_amount=1080.0,
            total_amount=11880.0, # 35% higher than PO ($8,800)
            ocr_confidence=96.0,
            status="EXCEPTION",
            file_name="invoice_globallogistics_1002.pdf",
            validation_status="WARNING",
            validation_notes="Invoice total exceeds PO-5002 total by 35%."
        )
        inv2.items.append(InvoiceItem(item_description="International Freight Shipment Containers", quantity=4.0, unit_price=2700.0, tax=1080.0, line_total=10800.0, confidence=97.0))
        db.add(inv2)
        db.commit()
        MatchingService.perform_3way_matching(inv2, db)
        FraudDetectionService.analyze_invoice_fraud(inv2, db)

        # Scenario 3: Duplicate Invoice Anomaly (Critical Risk)
        inv3 = Invoice(
            invoice_number="INV-1001", # Duplicate invoice number!
            invoice_date=now - timedelta(days=2),
            vendor_id=v1.id,
            vendor_name=v1.name,
            vendor_tax_id=v1.tax_id,
            po_number="PO-5001",
            currency="USD",
            subtotal=10000.0,
            tax_amount=1800.0,
            total_amount=11800.0,
            ocr_confidence=99.0,
            status="PENDING_REVIEW",
            file_name="invoice_apex_1001_duplicate.pdf",
            validation_status="ERROR",
            validation_notes="Duplicate invoice submission detected."
        )
        inv3.items.append(InvoiceItem(item_description="Enterprise Laptop Workstations", quantity=2.0, unit_price=5000.0, tax=1800.0, line_total=10000.0, confidence=99.0))
        db.add(inv3)
        db.commit()
        MatchingService.perform_3way_matching(inv3, db)
        FraudDetectionService.analyze_invoice_fraud(inv3, db)

        # Scenario 4: Quantity Mismatch (Invoice Qty = 10, GRN Qty = 5)
        inv4 = Invoice(
            invoice_number="INV-1004",
            invoice_date=now - timedelta(days=3),
            vendor_id=v4.id,
            vendor_name=v4.name,
            vendor_tax_id=v4.tax_id,
            po_number="PO-5004",
            currency="USD",
            subtotal=2000.0,
            tax_amount=200.0,
            total_amount=2200.0,
            ocr_confidence=97.2,
            status="EXCEPTION",
            file_name="invoice_acme_1004.pdf",
            validation_status="WARNING",
            validation_notes="Invoiced for 10 units, but GRN-8004 shows only 5 units delivered."
        )
        inv4.items.append(InvoiceItem(item_description="Ergonomic Executive Desk Chairs", quantity=10.0, unit_price=200.0, tax=200.0, line_total=2000.0, confidence=96.0))
        db.add(inv4)
        db.commit()
        MatchingService.perform_3way_matching(inv4, db)
        FraudDetectionService.analyze_invoice_fraud(inv4, db)

        # Scenario 5: Unknown Vendor & Missing PO (High Risk)
        inv5 = Invoice(
            invoice_number="INV-9999",
            invoice_date=now - timedelta(days=1),
            vendor_id=None,
            vendor_name="Shadow Holdings & Trading LLC",
            vendor_tax_id="UNKNOWN-TAX",
            po_number=None,
            currency="USD",
            subtotal=18500.0,
            tax_amount=1850.0,
            total_amount=20350.0,
            ocr_confidence=91.0,
            status="PENDING_REVIEW",
            file_name="suspicious_shadow_vendor.pdf",
            validation_status="WARNING",
            validation_notes="Unregistered vendor without PO reference."
        )
        inv5.items.append(InvoiceItem(item_description="Unspecified Strategic IT Advisory Services", quantity=1.0, unit_price=18500.0, tax=1850.0, line_total=18500.0, confidence=90.0))
        db.add(inv5)
        db.commit()
        MatchingService.perform_3way_matching(inv5, db)
        FraudDetectionService.analyze_invoice_fraud(inv5, db)

        # Scenario 6: Isolation Forest Outlier (Extreme High Amount)
        inv6 = Invoice(
            invoice_number="INV-2026-X",
            invoice_date=now,
            vendor_id=v5.id,
            vendor_name=v5.name,
            vendor_tax_id=v5.tax_id,
            po_number=None,
            currency="USD",
            subtotal=220000.0,
            tax_amount=22000.0,
            total_amount=242000.0,
            ocr_confidence=94.0,
            status="PENDING_REVIEW",
            file_name="large_consulting_invoice.pdf",
            validation_status="WARNING",
            validation_notes="Extreme billing outlier detected by Isolation Forest."
        )
        inv6.items.append(InvoiceItem(item_description="Enterprise System Architecture Overhaul", quantity=1.0, unit_price=220000.0, tax=22000.0, line_total=220000.0, confidence=95.0))
        db.add(inv6)
        db.commit()
        MatchingService.perform_3way_matching(inv6, db)
        FraudDetectionService.analyze_invoice_fraud(inv6, db)

        # Audit Log Entry
        admin_user = db.query(User).filter(User.email == "admin@fraudlens.ai").first()
        AuditService.log_action(
            db=db,
            action="SYSTEM_INIT_SEED",
            target_entity="SystemDatabase",
            entity_id="SEED-001",
            user=admin_user,
            change_details="Successfully populated FraudLens AI master database with sample vendors, POs, GRNs, and synthetic test invoices."
        )

        return {"status": "success", "message": "Demo data populated successfully with 6 comprehensive fraud & matching scenarios!"}
