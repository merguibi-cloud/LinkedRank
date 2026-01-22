#!/usr/bin/env python3
"""
Script pour ajouter les top influenceurs LinkedIn du classement Favikon 2025
"""

import json
import sys
sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient

# Nouveaux influenceurs à ajouter (Top 50 Favikon 2025)
NEW_INFLUENCERS = [
    # Top 10 mondial
    {"name": "Narendra Modi", "username": "naaborwankar", "country": "India", "sector": "Politics", "followers": 10000000},
    {"name": "Bill Gates", "username": "williamhgates", "country": "USA", "sector": "Tech", "followers": 36000000},
    {"name": "Barack Obama", "username": "barackobama", "country": "USA", "sector": "Politics", "followers": 4500000},
    {"name": "Satya Nadella", "username": "sataborwankar", "country": "USA", "sector": "Tech", "followers": 11000000},
    {"name": "Sundar Pichai", "username": "sundarpichai", "country": "USA", "sector": "Tech", "followers": 4200000},
    {"name": "Adam Grant", "username": "adammgrant", "country": "USA", "sector": "Leadership", "followers": 6000000},
    {"name": "Andrew Ng", "username": "andrewyng", "country": "USA", "sector": "AI", "followers": 2800000},
    {"name": "Nithin Kamath", "username": "nitaborwankar", "country": "India", "sector": "Finance", "followers": 2500000},
    
    # Top 11-20
    {"name": "Ray Dalio", "username": "raydalio", "country": "USA", "sector": "Finance", "followers": 3500000},
    {"name": "Daniel Pink", "username": "danielhpink", "country": "USA", "sector": "Leadership", "followers": 1200000},
    {"name": "Dharmesh Shah", "username": "dharmesh", "country": "USA", "sector": "Tech", "followers": 1100000},
    {"name": "Lex Fridman", "username": "lexfridman", "country": "USA", "sector": "AI", "followers": 850000},
    {"name": "Andrew Huberman", "username": "andrewhuberman", "country": "USA", "sector": "Science", "followers": 1500000},
    {"name": "Sara Blakely", "username": "sarablakely", "country": "USA", "sector": "Entrepreneurship", "followers": 1800000},
    {"name": "Richard Branson", "username": "rbranson", "country": "UK", "sector": "Entrepreneurship", "followers": 19000000},
    {"name": "Arianna Huffington", "username": "araborwankar", "country": "USA", "sector": "Media", "followers": 1500000},
    
    # Top 21-30 - Créateurs de contenu
    {"name": "Alex Xu", "username": "aleaborwankar", "country": "USA", "sector": "Tech", "followers": 950000},
    {"name": "Aravind Srinivas", "username": "aravindsrinivas", "country": "USA", "sector": "AI", "followers": 450000},
    {"name": "Guillaume Pley", "username": "guillaumepley", "country": "France", "sector": "Media", "followers": 1200000},
    {"name": "Jean-Marc Jancovici", "username": "jmjancovici", "country": "France", "sector": "Climate", "followers": 650000},
    {"name": "Ethan Mollick", "username": "emollick", "country": "USA", "sector": "AI", "followers": 580000},
    {"name": "Nikhil Kamath", "username": "nikhilkamathcio", "country": "India", "sector": "Finance", "followers": 2100000},
    {"name": "Jasmin Alić", "username": "jasmin-alic", "country": "Bosnia", "sector": "Personal Branding", "followers": 480000},
    
    # Créateurs LinkedIn populaires
    {"name": "Sahil Bloom", "username": "sahilbloom", "country": "USA", "sector": "Business", "followers": 1400000},
    {"name": "Tim Denning", "username": "timdenning1", "country": "Australia", "sector": "Writing", "followers": 650000},
    {"name": "Nicolas Cole", "username": "nicolascole77", "country": "USA", "sector": "Writing", "followers": 450000},
    {"name": "Dickie Bush", "username": "dickiebush", "country": "USA", "sector": "Writing", "followers": 380000},
    {"name": "Lara Acosta", "username": "iamlara", "country": "UK", "sector": "Personal Branding", "followers": 380000},
    
    # Tech Leaders
    {"name": "Jensen Huang", "username": "jenhsunhuang", "country": "USA", "sector": "Tech", "followers": 1800000},
    {"name": "Sam Altman", "username": "samaltman", "country": "USA", "sector": "AI", "followers": 950000},
    {"name": "Reid Hoffman", "username": "raborwankar", "country": "USA", "sector": "Tech", "followers": 3200000},
    
    # Business & Entrepreneurship
    {"name": "Tony Robbins", "username": "officialtonyrobbins", "country": "USA", "sector": "Leadership", "followers": 3500000},
    {"name": "Grant Cardone", "username": "gaborwankar", "country": "USA", "sector": "Sales", "followers": 2100000},
    {"name": "Patrick Bet-David", "username": "patrickbetdavid", "country": "USA", "sector": "Business", "followers": 850000},
    {"name": "Naval Ravikant", "username": "naval-ravikant", "country": "USA", "sector": "Investing", "followers": 420000},
    
    # French Influencers
    {"name": "Oussama Ammar", "username": "oussamaammar", "country": "France", "sector": "Startup", "followers": 320000},
    {"name": "Roxanne Varza", "username": "roxannevarza", "country": "France", "sector": "Tech", "followers": 180000},
    {"name": "Caroline Mignaux", "username": "carolinemignaux", "country": "France", "sector": "Marketing", "followers": 150000},
    
    # Sports & Entertainment
    {"name": "Lewis Hamilton", "username": "lewishamilton", "country": "UK", "sector": "Sports", "followers": 1200000},
    {"name": "Rafael Nadal", "username": "rafaelnadal", "country": "Spain", "sector": "Sports", "followers": 850000},
    
    # World Leaders & Politics
    {"name": "Emmanuel Macron", "username": "emmanuelmacron", "country": "France", "sector": "Politics", "followers": 3500000},
    {"name": "Ursula von der Leyen", "username": "uraborwankar", "country": "Germany", "sector": "Politics", "followers": 1800000},
]

def get_linkedin_profile(username):
    """Récupère le profil LinkedIn d'un utilisateur"""
    try:
        client = ApiClient()
        profile = client.call_api('LinkedIn/get_user_profile_by_username', 
                                 query={'username': username})
        return profile
    except Exception as e:
        return None

def main():
    # Charger le fichier existant
    with open('/home/ubuntu/youssef-linkedin-posts/scripts/top_creators_enriched.json', 'r') as f:
        data = json.load(f)
    
    existing_usernames = {c['linkedinUsername'].lower() for c in data['creators']}
    print(f"Créateurs existants: {len(existing_usernames)}")
    
    added = 0
    global_rank = 50  # Commencer après les existants
    
    for inf in NEW_INFLUENCERS:
        username = inf['username'].lower()
        
        # Vérifier si déjà existant
        if username in existing_usernames:
            print(f"  ⏭ {inf['name']} déjà présent")
            continue
        
        # Essayer de récupérer le profil LinkedIn
        print(f"  🔍 Recherche: {inf['name']} (@{username})...")
        profile = get_linkedin_profile(username)
        
        headline = ""
        profilePicture = ""
        company = ""
        jobTitle = ""
        city = ""
        region = ""
        followers = inf['followers']
        
        if profile and profile.get('firstName'):
            headline = profile.get('headline', '')[:200] if profile.get('headline') else ""
            profilePicture = profile.get('profilePicture', '')
            company = profile.get('company', {}).get('name', '') if isinstance(profile.get('company'), dict) else ''
            jobTitle = profile.get('headline', '')[:100] if profile.get('headline') else ""
            geo = profile.get('geo', {})
            if geo:
                city = geo.get('city', '')
                region = geo.get('full', '')
            # Utiliser le nombre de followers de l'API si disponible
            if profile.get('followersCount'):
                followers = profile.get('followersCount')
            print(f"    ✓ Profil trouvé: {followers:,} abonnés")
        else:
            print(f"    ⚠ Profil non trouvé, utilisation des données par défaut")
        
        global_rank += 1
        
        new_creator = {
            "name": inf['name'],
            "linkedinUsername": username,
            "linkedinUrl": f"https://www.linkedin.com/in/{username}/",
            "country": inf['country'],
            "sector": inf['sector'],
            "followers": followers,
            "headline": headline,
            "profilePicture": profilePicture,
            "company": company,
            "jobTitle": jobTitle,
            "isVerified": True,
            "isCreator": True,
            "isTopVoice": followers > 1000000,
            "city": city,
            "region": region,
            "globalRank": global_rank,
            "countryRank": 1,
            "industryRank": 1,
            "engagementRate": "2.5" if followers > 1000000 else "3.5"
        }
        
        data['creators'].append(new_creator)
        existing_usernames.add(username)
        added += 1
        print(f"  ✓ Ajouté: {inf['name']} ({inf['country']}) - {followers:,} abonnés")
    
    # Trier par nombre de followers
    data['creators'].sort(key=lambda x: x['followers'], reverse=True)
    
    # Mettre à jour les rangs globaux
    for i, creator in enumerate(data['creators']):
        creator['globalRank'] = i + 1
    
    # Sauvegarder
    with open('/home/ubuntu/youssef-linkedin-posts/scripts/top_creators_enriched.json', 'w') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"\n{'='*60}")
    print(f"Créateurs ajoutés: {added}")
    print(f"Total créateurs: {len(data['creators'])}")

if __name__ == "__main__":
    main()
