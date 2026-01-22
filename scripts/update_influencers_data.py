#!/usr/bin/env python3
"""
Script pour mettre à jour les données des influenceurs LinkedIn via l'API
"""

import sys
import json
import time
import os

sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient

# Charger les influenceurs existants
def load_existing_influencers():
    json_path = '/home/ubuntu/youssef-linkedin-posts/scripts/top_creators_enriched.json'
    if os.path.exists(json_path):
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            # Le fichier a une structure {"creators": [...]}
            if isinstance(data, dict) and 'creators' in data:
                return data['creators']
            return data
    return []

def get_linkedin_profile(username: str) -> dict:
    """Récupère le profil LinkedIn d'un utilisateur"""
    try:
        client = ApiClient()
        profile = client.call_api('LinkedIn/get_user_profile_by_username', 
                                 query={'username': username})
        return profile
    except Exception as e:
        print(f"  Erreur pour {username}: {str(e)}")
        return None

def extract_followers(profile: dict) -> int:
    """Extrait le nombre de followers du profil"""
    if not profile:
        return 0
    
    # Essayer différents chemins possibles
    followers = profile.get('followersCount', 0)
    if not followers:
        followers = profile.get('followerCount', 0)
    if not followers:
        followers = profile.get('followers', 0)
    if not followers:
        network_info = profile.get('networkInfo', {})
        followers = network_info.get('followersCount', 0)
    
    return followers or 0

def format_followers(count: int) -> str:
    """Formate le nombre de followers pour l'affichage"""
    if count >= 1000000:
        return f"{count / 1000000:.1f}M"
    elif count >= 1000:
        return f"{count / 1000:.1f}K"
    else:
        return str(count)

def main():
    print("=" * 60)
    print("Mise à jour des données des influenceurs LinkedIn")
    print("=" * 60)
    
    influencers = load_existing_influencers()
    print(f"\nNombre d'influenceurs à mettre à jour: {len(influencers)}")
    
    updated_influencers = []
    errors = []
    
    for i, inf in enumerate(influencers):
        username = inf.get('linkedinUsername', '') or inf.get('username', '')
        name = inf.get('name', 'Unknown')
        
        if not username:
            print(f"\n[{i+1}/{len(influencers)}] {name} - Pas de username, ignoré")
            updated_influencers.append(inf)
            continue
        
        print(f"\n[{i+1}/{len(influencers)}] {name} (@{username})...")
        
        profile = get_linkedin_profile(username)
        
        if profile:
            # Extraire les données mises à jour
            new_followers = extract_followers(profile)
            old_followers = inf.get('followers', 0)
            
            # Mettre à jour les données
            inf['followers'] = new_followers if new_followers > 0 else old_followers
            inf['followersFormatted'] = format_followers(inf['followers'])
            
            # Mettre à jour d'autres champs si disponibles
            if profile.get('headline'):
                inf['headline'] = profile.get('headline')
            if profile.get('profilePicture'):
                inf['profilePicture'] = profile.get('profilePicture')
            if profile.get('summary'):
                inf['summary'] = profile.get('summary', '')[:500]
            
            print(f"  ✓ Followers: {format_followers(old_followers)} → {format_followers(inf['followers'])}")
        else:
            errors.append(username)
            print(f"  ✗ Erreur de récupération")
        
        updated_influencers.append(inf)
        
        # Pause pour éviter le rate limiting
        time.sleep(1)
    
    # Sauvegarder les données mises à jour
    output_path = '/home/ubuntu/youssef-linkedin-posts/scripts/top_creators_enriched.json'
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump({"creators": updated_influencers}, f, ensure_ascii=False, indent=2)
    
    print("\n" + "=" * 60)
    print(f"Mise à jour terminée!")
    print(f"  - Influenceurs mis à jour: {len(updated_influencers) - len(errors)}")
    print(f"  - Erreurs: {len(errors)}")
    if errors:
        print(f"  - Usernames en erreur: {', '.join(errors[:10])}{'...' if len(errors) > 10 else ''}")
    print(f"\nFichier sauvegardé: {output_path}")
    print("=" * 60)

if __name__ == "__main__":
    main()
