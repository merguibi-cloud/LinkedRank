#!/usr/bin/env python3
"""
Script pour enrichir les profils LinkedIn des créateurs via l'API Data de Manus.
Ce script récupère les données réelles des profils LinkedIn et les formate pour mise à jour.
"""

import sys
import json
from typing import Dict, Any, List

# Add the Manus API client path
sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient

def get_linkedin_profile(username: str) -> Dict[str, Any]:
    """
    Récupère les données d'un profil LinkedIn par username.
    """
    client = ApiClient()
    
    try:
        print(f"  Fetching profile for: {username}")
        profile_data = client.call_api('LinkedIn/get_user_profile_by_username', 
                                      query={'username': username})
        return profile_data
    except Exception as e:
        print(f"  Error fetching profile for {username}: {str(e)}")
        return {"error": str(e)}

def extract_profile_data(raw_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Extrait les données pertinentes du profil LinkedIn.
    """
    if not raw_data or "error" in raw_data:
        return None
    
    # Handle different API response structures
    data = raw_data
    
    # Extract basic info
    profile = {
        "linkedinUsername": data.get("username", ""),
        "name": f"{data.get('firstName', '')} {data.get('lastName', '')}".strip(),
        "headline": data.get("headline", ""),
        "profilePicture": data.get("profilePicture", ""),
        "bannerImage": data.get("backgroundImage", ""),
        "followers": data.get("followersCount", 0),
        "connections": data.get("connectionsCount", 0),
        "isTopVoice": data.get("isTopVoice", False),
        "isCreator": data.get("isCreator", False),
        "isVerified": data.get("isPremium", False),
    }
    
    # Extract location
    geo = data.get("geo", {})
    if geo:
        profile["country"] = geo.get("country", "")
        profile["city"] = geo.get("city", "")
        profile["region"] = geo.get("full", "")
    
    # Extract company info from current position
    positions = data.get("position", [])
    if positions and len(positions) > 0:
        current_position = positions[0]
        profile["company"] = current_position.get("companyName", "")
        profile["jobTitle"] = current_position.get("title", "")
    
    # Extract summary for headline if empty
    if not profile["headline"] and data.get("summary"):
        profile["headline"] = data.get("summary", "")[:200]
    
    return profile

def main():
    """
    Main function - enrichit les profils des top créateurs LinkedIn.
    """
    print("=" * 60)
    print("LinkedIn Profile Enrichment Script")
    print("=" * 60)
    
    # Liste des usernames LinkedIn à enrichir
    # Ces usernames correspondent aux créateurs dans notre base de données
    creators_to_enrich = [
        # Top French creators
        {"username": "youssefkoutari", "expected_name": "Youssef Koutari"},
        {"username": "guillaumemoubeche", "expected_name": "Guillaume Moubeche"},
        {"username": "carolinereceveur", "expected_name": "Caroline Receveur"},
        {"username": "tikitofficiel", "expected_name": "Tibo InShape"},
        {"username": "ninjabrioche", "expected_name": "Nina Ramen"},
        {"username": "benoitdubos", "expected_name": "Benoit Dubos"},
        {"username": "justinewelsh", "expected_name": "Justin Welsh"},
        {"username": "garaborisov", "expected_name": "Gara Borisov"},
        
        # Global creators
        {"username": "richardbranson", "expected_name": "Richard Branson"},
        {"username": "satlouis", "expected_name": "Simon Sinek"},
        {"username": "garyvee", "expected_name": "Gary Vaynerchuk"},
        {"username": "gaborgeorge", "expected_name": "Gabor George"},
        {"username": "alexhormozi", "expected_name": "Alex Hormozi"},
        {"username": "noahkagan", "expected_name": "Noah Kagan"},
        {"username": "sahaborja", "expected_name": "Sahil Bloom"},
        {"username": "chrisdo", "expected_name": "Chris Do"},
        {"username": "jasonfried", "expected_name": "Jason Fried"},
        {"username": "dhaborja", "expected_name": "Dharmesh Shah"},
    ]
    
    enriched_profiles = []
    errors = []
    
    for creator in creators_to_enrich:
        username = creator["username"]
        expected_name = creator["expected_name"]
        
        print(f"\n[{len(enriched_profiles) + 1}/{len(creators_to_enrich)}] Processing: {expected_name}")
        
        raw_data = get_linkedin_profile(username)
        
        if raw_data and "error" not in raw_data:
            profile = extract_profile_data(raw_data)
            if profile:
                profile["original_username"] = username
                profile["expected_name"] = expected_name
                enriched_profiles.append(profile)
                print(f"  ✓ Success: {profile.get('name', 'Unknown')} - {profile.get('followers', 0):,} followers")
            else:
                errors.append({"username": username, "error": "Failed to extract data"})
                print(f"  ✗ Failed to extract data")
        else:
            error_msg = raw_data.get("error", "Unknown error") if raw_data else "No response"
            errors.append({"username": username, "error": error_msg})
            print(f"  ✗ Error: {error_msg}")
    
    # Save results
    print("\n" + "=" * 60)
    print("RESULTS SUMMARY")
    print("=" * 60)
    print(f"Successfully enriched: {len(enriched_profiles)} profiles")
    print(f"Errors: {len(errors)} profiles")
    
    # Save enriched data to JSON file
    output_file = "/home/ubuntu/youssef-linkedin-posts/scripts/enriched_profiles.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump({
            "enriched_profiles": enriched_profiles,
            "errors": errors,
            "total_processed": len(creators_to_enrich)
        }, f, indent=2, ensure_ascii=False)
    
    print(f"\nResults saved to: {output_file}")
    
    # Print sample of enriched data
    if enriched_profiles:
        print("\n" + "=" * 60)
        print("SAMPLE ENRICHED PROFILES")
        print("=" * 60)
        for profile in enriched_profiles[:5]:
            print(f"\n{profile.get('name', 'Unknown')}:")
            print(f"  Username: {profile.get('linkedinUsername', 'N/A')}")
            print(f"  Headline: {profile.get('headline', 'N/A')[:80]}...")
            print(f"  Followers: {profile.get('followers', 0):,}")
            print(f"  Company: {profile.get('company', 'N/A')}")
            print(f"  Location: {profile.get('country', 'N/A')}")

if __name__ == "__main__":
    main()
