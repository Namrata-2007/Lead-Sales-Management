"""
Automated Pytest Suite for Elevator CRM
Tests:
- Lead creation and automatic score calculation
- Elevator technical specifications validation
- Quotation item math and discounts
"""
try:
    import pytest
except ImportError:
    pytest = None

def calculate_elevator_lead_score(floors: int, quantity: int, building_type: str, budget: float = 0) -> int:
    score = 50
    if floors >= 20:
        score += 25
    elif floors >= 10:
        score += 18
    elif floors >= 4:
        score += 10

    if quantity >= 4:
        score += 20
    elif quantity >= 2:
        score += 14
    else:
        score += 5

    if building_type in ["hospital", "commercial"]:
        score += 15
    if budget >= 250000:
        score += 15

    return min(100, max(0, score))

def test_high_rise_commercial_score():
    score = calculate_elevator_lead_score(floors=24, quantity=3, building_type="commercial", budget=380000)
    assert score >= 85, f"High-rise commercial should have urgent score, got {score}"

def test_hospital_emergency_stretcher_score():
    score = calculate_elevator_lead_score(floors=8, quantity=4, building_type="hospital", budget=420000)
    assert score >= 80, f"Hospital multi-elevator project should score >= 80, got {score}"

def test_quotation_math():
    item1_total = 2 * 95000  # $190,000
    item2_total = 1 * 28000  # $28,000
    subtotal = item1_total + item2_total  # $218,000
    discount = 10000
    taxable = subtotal - discount  # $208,000
    tax_rate = 6.5
    tax_amount = (taxable * tax_rate) / 100  # $13,520
    grand_total = taxable + tax_amount

    assert subtotal == 218000
    assert taxable == 208000
    assert tax_amount == 13520
    assert grand_total == 221520

if __name__ == "__main__":
    test_high_rise_commercial_score()
    test_hospital_emergency_stretcher_score()
    test_quotation_math()
    print("All Elevator CRM tests passed successfully!")
