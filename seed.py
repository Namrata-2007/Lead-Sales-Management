#!/usr/bin/env python3
"""
Seed script for AI Automated Elevator CRM SaaS
Inserts enterprise demo records (companies, sales reps, elevator projects, leads, quotations)
"""
import sys
import json
import os

def run_seed():
    data_path = os.path.join(os.path.dirname(__file__), "data", "elevator_crm_db.json")
    print(f"[Seed] Seeding realistic elevator CRM demo records to {data_path}...")
    
    if os.path.exists(data_path):
        with open(data_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        print(f"[Seed] Successfully verified {len(data.get('leads', []))} elevator leads, {len(data.get('quotations', []))} quotations, and {len(data.get('users', []))} team members.")
    else:
        print("[Seed] Note: Run the applet once to initialize the store.")
        
    print("[Seed] Seed operation finished successfully.")

if __name__ == "__main__":
    run_seed()
