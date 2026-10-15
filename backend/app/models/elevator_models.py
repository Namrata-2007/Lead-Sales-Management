"""
SQLAlchemy Relational Schema for Elevator CRM SaaS
"""
from datetime import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Float, Boolean, DateTime, ForeignKey, Enum
)
from sqlalchemy.orm import relationship, declarative_base
import enum

Base = declarative_base()

class UserRoleEnum(str, enum.Enum):
    admin = "admin"
    sales_manager = "sales_manager"
    salesperson = "salesperson"
    support = "support"

class LeadStatusEnum(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    qualified = "qualified"
    proposal_sent = "proposal_sent"
    negotiation = "negotiation"
    won = "won"
    lost = "lost"

class LeadPriorityEnum(str, enum.Enum):
    low = "low"
    medium = "medium"
    high = "high"
    urgent = "urgent"

class User(Base):
    __tablename__ = "users"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(Enum(UserRoleEnum), default=UserRoleEnum.salesperson, nullable=False)
    phone = Column(String(30), nullable=True)
    avatar = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    leads = relationship("Lead", back_populates="assigned_user")
    tasks = relationship("Task", back_populates="assigned_user")

class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    company_name = Column(String(150), nullable=True)
    email = Column(String(150), nullable=False, index=True)
    phone = Column(String(30), nullable=False)
    location = Column(String(150), nullable=True)
    tax_id = Column(String(50), nullable=True)
    address = Column(Text, nullable=True)
    total_deals_won = Column(Integer, default=0)
    lifetime_value = Column(Float, default=0.0)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    leads = relationship("Lead", back_populates="customer")
    projects = relationship("Project", back_populates="customer")
    quotations = relationship("Quotation", back_populates="customer")

class Lead(Base):
    __tablename__ = "leads"

    id = Column(String(50), primary_key=True)
    name = Column(String(100), nullable=False)
    company_name = Column(String(150), nullable=True)
    email = Column(String(150), nullable=False, index=True)
    phone = Column(String(30), nullable=False)
    location = Column(String(150), nullable=False)
    building_type = Column(String(50), nullable=False)
    floors = Column(Integer, default=4, nullable=False)
    stops = Column(Integer, default=4, nullable=False)
    elevator_requirement = Column(Text, nullable=False)
    elevator_type = Column(String(50), default="passenger_mrl", nullable=False)
    capacity_kg = Column(Integer, nullable=True)
    quantity = Column(Integer, default=1, nullable=False)
    budget = Column(Float, nullable=True)
    expected_installation_date = Column(String(50), nullable=True)
    source = Column(String(50), default="website", nullable=False)
    status = Column(Enum(LeadStatusEnum), default=LeadStatusEnum.new, nullable=False, index=True)
    priority = Column(Enum(LeadPriorityEnum), default=LeadPriorityEnum.medium, nullable=False)
    ai_score = Column(Integer, nullable=True)
    assigned_user_id = Column(String(50), ForeignKey("users.id"), nullable=True)
    customer_id = Column(String(50), ForeignKey("customers.id"), nullable=True)
    notes = Column(Text, nullable=True)
    last_contacted_at = Column(DateTime, nullable=True)
    next_followup_date = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    assigned_user = relationship("User", back_populates="leads")
    customer = relationship("Customer", back_populates="leads")
    quotations = relationship("Quotation", back_populates="lead")

class Project(Base):
    __tablename__ = "projects"

    id = Column(String(50), primary_key=True)
    customer_id = Column(String(50), ForeignKey("customers.id"), nullable=False)
    title = Column(String(150), nullable=False)
    site_address = Column(Text, nullable=True)
    building_type = Column(String(50), default="commercial", nullable=False)
    number_of_floors = Column(Integer, default=5, nullable=False)
    elevator_quantity = Column(Integer, default=1, nullable=False)
    status = Column(String(50), default="planning", nullable=False)
    budget = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="projects")

class Quotation(Base):
    __tablename__ = "quotations"

    id = Column(String(50), primary_key=True)
    quotation_number = Column(String(50), unique=True, nullable=False)
    customer_id = Column(String(50), ForeignKey("customers.id"), nullable=False)
    lead_id = Column(String(50), ForeignKey("leads.id"), nullable=True)
    project_title = Column(String(150), nullable=False)
    subtotal = Column(Float, default=0.0)
    tax_rate = Column(Float, default=0.0)
    tax_amount = Column(Float, default=0.0)
    discount_amount = Column(Float, default=0.0)
    total_amount = Column(Float, default=0.0)
    status = Column(String(50), default="draft")
    valid_until = Column(String(50), nullable=True)
    terms = Column(Text, nullable=True)
    payment_terms = Column(Text, nullable=True)
    warranty_years = Column(Integer, default=3)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    customer = relationship("Customer", back_populates="quotations")
    lead = relationship("Lead", back_populates="quotations")
    items = relationship("QuotationItem", back_populates="quotation", cascade="all, delete-orphan")

class QuotationItem(Base):
    __tablename__ = "quotation_items"

    id = Column(String(50), primary_key=True)
    quotation_id = Column(String(50), ForeignKey("quotations.id"), nullable=False)
    description = Column(String(200), nullable=False)
    elevator_type = Column(String(50), nullable=False)
    specifications = Column(Text, nullable=True)
    quantity = Column(Integer, default=1, nullable=False)
    unit_price = Column(Float, default=0.0, nullable=False)
    total_price = Column(Float, default=0.0, nullable=False)

    quotation = relationship("Quotation", back_populates="items")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(String(50), primary_key=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    assigned_user_id = Column(String(50), ForeignKey("users.id"), nullable=False)
    lead_id = Column(String(50), ForeignKey("leads.id"), nullable=True)
    customer_id = Column(String(50), ForeignKey("customers.id"), nullable=True)
    due_date = Column(DateTime, nullable=False)
    priority = Column(String(50), default="medium")
    status = Column(String(50), default="pending")
    is_automated = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow)

    assigned_user = relationship("User", back_populates="tasks")
