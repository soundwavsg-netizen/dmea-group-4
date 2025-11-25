#!/usr/bin/env python3
"""
MUFE Group 4 - User Research + Persona Generator
Backend API Testing Script

Tests all API endpoints:
- GET /api/health
- POST /api/insights
- GET /api/insights
- GET /api/insights/{id}
- GET /api/report
- POST /api/personas/generate
- GET /api/personas
"""

import requests
import sys
import json
from datetime import datetime
from typing import Dict, Any, List

# Backend URL from frontend .env
BASE_URL = "https://tcss-engine.preview.emergentagent.com"
API_URL = f"{BASE_URL}/api"

class BackendTester:
    def __init__(self):
        self.tests_run = 0
        self.tests_passed = 0
        self.created_insight_id = None
        
    def print_header(self, title: str):
        """Print test section header"""
        print(f"\n{'='*70}")
        print(f"  {title}")
        print(f"{'='*70}")
    
    def run_test(self, name: str, method: str, endpoint: str, expected_status: int, 
                 data: Dict = None, validate_response: callable = None) -> tuple:
        """Run a single API test"""
        url = f"{API_URL}/{endpoint}"
        self.tests_run += 1
        
        print(f"\n🔍 Test {self.tests_run}: {name}")
        print(f"   {method} {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, timeout=30)
            elif method == 'POST':
                response = requests.post(url, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported method: {method}")
            
            print(f"   Status: {response.status_code}")
            
            # Check status code
            if response.status_code != expected_status:
                print(f"   ❌ FAIL: Expected {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"   Response: {response.text[:200]}")
                return False, None
            
            # Parse JSON response
            try:
                response_data = response.json()
            except:
                response_data = None
            
            # Validate response if validator provided
            if validate_response and response_data:
                is_valid, error_msg = validate_response(response_data)
                if not is_valid:
                    print(f"   ❌ FAIL: {error_msg}")
                    return False, response_data
            
            self.tests_passed += 1
            print(f"   ✅ PASS")
            return True, response_data
            
        except requests.exceptions.Timeout:
            print(f"   ❌ FAIL: Request timeout (30s)")
            return False, None
        except requests.exceptions.RequestException as e:
            print(f"   ❌ FAIL: Request error - {str(e)}")
            return False, None
        except Exception as e:
            print(f"   ❌ FAIL: Unexpected error - {str(e)}")
            return False, None
    
    def test_health_check(self):
        """Test health check endpoint"""
        self.print_header("HEALTH CHECK")
        
        def validate(data):
            if 'status' not in data:
                return False, "Missing 'status' field"
            return True, None
        
        success, _ = self.run_test(
            "Health Check",
            "GET",
            "health",
            200,
            validate_response=validate
        )
        return success
    
    def test_create_insight(self):
        """Test creating a new insight"""
        self.print_header("CREATE INSIGHT")
        
        # Sample insight data
        insight_data = {
            "age_group": "25-32",
            "gender": "Female",
            "skin_type": "Combination",
            "skin_tone": "Medium",
            "lifestyle": "Young Working Adult",
            "platform": "Instagram",
            "research_method": "User Interview",
            "products": ["Foundation", "Concealer"],
            "motivations": [
                {"name": "Natural finish", "strength": 80},
                {"name": "Long-lasting", "strength": 70}
            ],
            "pains": [
                {"name": "Shade mismatch", "strength": 75},
                {"name": "Oxidation", "strength": 65}
            ],
            "behaviours": ["Watches review videos", "Compares brands"],
            "channels": ["Instagram", "YouTube"],
            "purchase_intent": 75,
            "influencer_effect": 60,
            "quote": "I need a foundation that matches my skin tone perfectly.",
            "notes": "Test insight for API testing"
        }
        
        def validate(data):
            if 'id' not in data:
                return False, "Missing 'id' field in response"
            if data.get('age_group') != insight_data['age_group']:
                return False, "Age group mismatch"
            return True, None
        
        success, response = self.run_test(
            "Create Insight",
            "POST",
            "insights",
            200,
            data=insight_data,
            validate_response=validate
        )
        
        if success and response:
            self.created_insight_id = response.get('id')
            print(f"   Created insight ID: {self.created_insight_id}")
        
        return success
    
    def test_get_all_insights(self):
        """Test getting all insights"""
        self.print_header("GET ALL INSIGHTS")
        
        def validate(data):
            if not isinstance(data, list):
                return False, "Response should be a list"
            if len(data) == 0:
                return False, "No insights found (expected at least 1)"
            # Check first insight structure
            insight = data[0]
            required_fields = ['id', 'age_group', 'gender', 'skin_type', 'motivations', 'pains']
            for field in required_fields:
                if field not in insight:
                    return False, f"Missing field '{field}' in insight"
            return True, None
        
        success, response = self.run_test(
            "Get All Insights",
            "GET",
            "insights",
            200,
            validate_response=validate
        )
        
        if success and response:
            print(f"   Total insights: {len(response)}")
        
        return success
    
    def test_get_insight_by_id(self):
        """Test getting a single insight by ID"""
        self.print_header("GET INSIGHT BY ID")
        
        if not self.created_insight_id:
            print("   ⚠️  SKIP: No insight ID available (create test may have failed)")
            return True  # Don't fail if we don't have an ID
        
        def validate(data):
            if 'id' not in data:
                return False, "Missing 'id' field"
            if data['id'] != self.created_insight_id:
                return False, "ID mismatch"
            return True, None
        
        success, _ = self.run_test(
            "Get Insight by ID",
            "GET",
            f"insights/{self.created_insight_id}",
            200,
            validate_response=validate
        )
        
        return success
    
    def test_get_report(self):
        """Test getting aggregated report"""
        self.print_header("GET REPORT")
        
        def validate(data):
            required_fields = [
                'total_insights', 'top_motivations', 'top_pains',
                'demographics', 'top_behaviours', 'top_channels',
                'avg_purchase_intent', 'avg_influencer_effect'
            ]
            for field in required_fields:
                if field not in data:
                    return False, f"Missing field '{field}' in report"
            
            # Check data types
            if not isinstance(data['total_insights'], int):
                return False, "total_insights should be an integer"
            if not isinstance(data['top_motivations'], list):
                return False, "top_motivations should be a list"
            if not isinstance(data['demographics'], dict):
                return False, "demographics should be a dict"
            
            return True, None
        
        success, response = self.run_test(
            "Get Report",
            "GET",
            "report",
            200,
            validate_response=validate
        )
        
        if success and response:
            print(f"   Total insights: {response.get('total_insights')}")
            print(f"   Top motivations: {len(response.get('top_motivations', []))}")
            print(f"   Top pains: {len(response.get('top_pains', []))}")
            print(f"   Avg purchase intent: {response.get('avg_purchase_intent', 0):.1f}")
        
        return success
    
    def test_generate_personas(self):
        """Test generating personas"""
        self.print_header("GENERATE PERSONAS")
        
        def validate(data):
            required_fields = ['success', 'message', 'personas_count']
            for field in required_fields:
                if field not in data:
                    return False, f"Missing field '{field}' in response"
            
            if not isinstance(data['success'], bool):
                return False, "success should be a boolean"
            
            return True, None
        
        print("   ⚠️  Note: This may take 10-30 seconds due to LLM processing...")
        
        success, response = self.run_test(
            "Generate Personas",
            "POST",
            "personas/generate",
            200,
            validate_response=validate
        )
        
        if success and response:
            print(f"   Success: {response.get('success')}")
            print(f"   Message: {response.get('message')}")
            print(f"   Personas count: {response.get('personas_count')}")
        
        return success
    
    def test_get_personas(self):
        """Test getting all personas"""
        self.print_header("GET PERSONAS")
        
        def validate(data):
            if not isinstance(data, list):
                return False, "Response should be a list"
            
            # If personas exist, check structure
            if len(data) > 0:
                persona = data[0]
                required_fields = [
                    'id', 'name', 'background', 'motivations', 'pains',
                    'behaviours', 'channels', 'demographics'
                ]
                for field in required_fields:
                    if field not in persona:
                        return False, f"Missing field '{field}' in persona"
                
                # Check demographics structure
                demo = persona.get('demographics', {})
                if 'age' not in demo or 'skin_type' not in demo:
                    return False, "Demographics missing required fields"
            
            return True, None
        
        success, response = self.run_test(
            "Get Personas",
            "GET",
            "personas",
            200,
            validate_response=validate
        )
        
        if success and response:
            print(f"   Total personas: {len(response)}")
            if len(response) > 0:
                for i, persona in enumerate(response, 1):
                    print(f"   Persona {i}: {persona.get('name')} - {persona.get('demographics', {}).get('age')}")
        
        return success
    
    def run_all_tests(self):
        """Run all backend tests"""
        print("\n" + "="*70)
        print("  MUFE GROUP 4 - BACKEND API TEST SUITE")
        print("  Testing: https://tcss-engine.preview.emergentagent.com/api")
        print("="*70)
        
        # Run tests in sequence
        tests = [
            ("Health Check", self.test_health_check),
            ("Create Insight", self.test_create_insight),
            ("Get All Insights", self.test_get_all_insights),
            ("Get Insight by ID", self.test_get_insight_by_id),
            ("Get Report", self.test_get_report),
            ("Generate Personas", self.test_generate_personas),
            ("Get Personas", self.test_get_personas),
        ]
        
        for test_name, test_func in tests:
            try:
                test_func()
            except Exception as e:
                print(f"\n❌ CRITICAL ERROR in {test_name}: {str(e)}")
                self.tests_run += 1
        
        # Print summary
        self.print_header("TEST SUMMARY")
        print(f"\n   Tests Run: {self.tests_run}")
        print(f"   Tests Passed: {self.tests_passed}")
        print(f"   Tests Failed: {self.tests_run - self.tests_passed}")
        print(f"   Success Rate: {(self.tests_passed/self.tests_run*100):.1f}%")
        
        if self.tests_passed == self.tests_run:
            print("\n   🎉 SUCCESS: All backend tests passed!")
            return 0
        else:
            print(f"\n   ⚠️  WARNING: {self.tests_run - self.tests_passed} test(s) failed")
            return 1

def main():
    tester = BackendTester()
    return tester.run_all_tests()

if __name__ == "__main__":
    sys.exit(main())
