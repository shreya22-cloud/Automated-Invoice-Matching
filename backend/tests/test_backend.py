import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.user import User
from app.models.vendor import Vendor
from app.models.purchase_order import PurchaseOrder, PurchaseOrderItem
from app.models.goods_receipt import GoodsReceipt, GoodsReceiptItem
from app.models.invoice import Invoice, InvoiceItem
from app.services.matching_service import MatchingService
from app.services.fraud_detection import FraudDetectionService
from app.services.validation_service import ValidationService
from app.services.duplicate_detection import DuplicateDetectionService
from app.schemas.invoice import InvoiceResponse
from datetime import datetime

# Setup test in-memory SQLite DB
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture
def db():
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(bind=engine)

def test_validation_service(db):
    data = {
        "invoice_number": "INV-TEST-01",
        "vendor_name": "Acme Test Corp",
        "subtotal": 100.0,
        "tax_amount": 10.0,
        "total_amount": 110.0,
        "line_items": [{"description": "Item 1", "quantity": 2, "unit_price": 50, "line_total": 100}]
    }
    result = ValidationService.validate_extracted_data(data, db)
    assert result["validation_status"] in ["VALID", "WARNING"]
    assert any(check["field"] == "math_integrity" and check["status"] == "VALID" for check in result["checks"])

def test_3way_matching(db):
    vendor = Vendor(name="Test Tech Inc")
    db.add(vendor)
    db.commit()

    po = PurchaseOrder(po_number="PO-999", vendor_id=vendor.id, vendor_name="Test Tech Inc", order_date=datetime.now(), total_amount=1000.0)
    po.items.append(PurchaseOrderItem(item_description="Widget A", quantity=10.0, unit_price=100.0, total_price=1000.0))
    db.add(po)

    grn = GoodsReceipt(grn_number="GRN-999", po_number="PO-999", vendor_name="Test Tech Inc", receipt_date=datetime.now())
    grn.items.append(GoodsReceiptItem(item_description="Widget A", quantity_received=10.0, quantity_accepted=10.0))
    db.add(grn)
    db.commit()

    inv = Invoice(invoice_number="INV-999", vendor_name="Test Tech Inc", po_number="PO-999", total_amount=1000.0)
    inv.items.append(InvoiceItem(item_description="Widget A", quantity=10.0, unit_price=100.0, line_total=1000.0))
    db.add(inv)
    db.commit()

    match_res = MatchingService.perform_3way_matching(inv, db)
    assert match_res.overall_match_status == "EXACT_MATCH"
    assert match_res.po_matched is True
    assert match_res.grn_matched is True

    # The detail endpoint serializes this relationship for the UI matrix.
    response = InvoiceResponse.model_validate(inv)
    assert response.matching_result is not None
    assert response.matching_result.overall_match_status == "EXACT_MATCH"
    assert response.matching_result.vendor_matched is True

def test_fraud_risk_scoring(db):
    inv = Invoice(invoice_number="INV-SUSPICIOUS-01", vendor_name="Unknown Vendor Corp", total_amount=50000.0)
    db.add(inv)
    db.commit()

    alert = FraudDetectionService.analyze_invoice_fraud(inv, db)
    assert alert.risk_score > 0
    assert alert.risk_level in ["MEDIUM", "HIGH", "CRITICAL"]
    assert "Unknown Vendor" in alert.explainable_summary or "UNKNOWN_VENDOR_ALERT" in alert.rules_triggered
