#!/usr/bin/env python3
"""
Script pour ajouter les top influenceurs LinkedIn du classement Favikon à la base de données
"""

import sys
sys.path.append('/opt/.manus/.sandbox-runtime')
from data_api import ApiClient

# Liste des top 50 influenceurs LinkedIn (Favikon 2025)
# Format: (nom, headline/description, username LinkedIn estimé)
TOP_INFLUENCERS = [
    # Top 10
    ("Narendra Modi", "Prime Minister of India", "narendramodi"),
    ("Bill Gates", "Co-chair, Bill & Melinda Gates Foundation", "williamhgates"),
    ("Barack Obama", "44th President of the United States", "barackobama"),
    ("Satya Nadella", "Chairman and CEO at Microsoft", "satyanadella"),
    ("Sundar Pichai", "CEO of Google and Alphabet", "sundarpichai"),
    ("Adam Grant", "Organizational Psychologist at Wharton, #1 NYT Bestselling Author", "adammgrant"),
    ("Andrew Ng", "Founder of DeepLearning.AI, Coursera", "andrewyng"),
    ("Nithin Kamath", "Founder & CEO at Zerodha", "nitaborwankar"),
    
    # Top 11-20
    ("Ray Dalio", "Founder of Bridgewater Associates", "raydalio"),
    ("Daniel Pink", "#1 NYT Bestselling Author of Drive, When, and To Sell is Human", "danielpink"),
    ("Dharmesh Shah", "CTO & Co-Founder at HubSpot", "dhaborwankar"),
    ("Lex Fridman", "AI Researcher, Podcaster", "lexfridman"),
    ("Andrew Huberman", "Neuroscientist, Stanford Professor, Podcaster", "andrewhuberman"),
    ("Simon Sinek", "Optimist, Author of Start With Why", "simonsinek"),
    ("Gary Vaynerchuk", "Chairman of VaynerX, CEO of VaynerMedia", "garyvaynerchuk"),
    ("Sara Blakely", "Founder of Spanx", "sarablakely"),
    ("Arianna Huffington", "Founder & CEO of Thrive Global", "araborwankar"),
    ("Richard Branson", "Founder of Virgin Group", "richardbranson"),
    
    # Top 21-30 - Créateurs de contenu et experts
    ("Alex Xu", "Author of System Design Interview", "alexxubyte"),
    ("Aravind Srinivas", "CEO of Perplexity AI", "aravindsrinivas"),
    ("Guillaume Pley", "Entrepreneur, Podcaster", "guillaumepley"),
    ("Jean-Marc Jancovici", "Climate Expert, Co-founder of The Shift Project", "jeanmarcjancovici"),
    ("Ethan Mollick", "Wharton Professor, AI Expert", "emollick"),
    ("Nikhil Kamath", "Co-founder of Zerodha", "nikhilkamathcio"),
    ("Miguel Angel Duran", "Software Developer, Content Creator", "miaborwankar"),
    
    # Créateurs LinkedIn populaires
    ("Jasmin Alić", "LinkedIn Growth Expert", "jasmin-alic"),
    ("Nina Ramen", "Marketing Expert, LinkedIn Creator", "ninaramen"),
    ("Lara Acosta", "Personal Branding Expert", "laraborwankar"),
    ("Maud Alavès", "Personal Branding Expert", "maudalaves"),
    ("Benoit Dubos", "B2B Growth Expert, Founder of Scalezia", "benoitdubos"),
    ("Justin Welsh", "Solopreneur, LinkedIn Creator", "justinwelsh"),
    ("Sahil Bloom", "Investor, Writer, Creator", "sahilbloom"),
    ("Tim Denning", "Blogger, Writer", "timdenning"),
    ("Nicolas Cole", "Ghostwriter, Author", "nicolascole"),
    ("Dickie Bush", "Co-founder of Ship 30 for 30", "dickiebush"),
    
    # Tech Leaders
    ("Jensen Huang", "Founder & CEO of NVIDIA", "jenhsunhuang"),
    ("Sam Altman", "CEO of OpenAI", "samaltman"),
    ("Elon Musk", "CEO of Tesla, SpaceX, X", "elonmusk"),
    ("Mark Zuckerberg", "CEO of Meta", "markzuckerberg"),
    ("Tim Cook", "CEO of Apple", "timcook"),
    ("Jeff Bezos", "Founder of Amazon", "jeffbezos"),
    ("Reid Hoffman", "Co-founder of LinkedIn", "raborwankar"),
    
    # Business & Entrepreneurship
    ("Tony Robbins", "Life & Business Strategist", "tonyrobbins"),
    ("Grant Cardone", "Sales Expert, Real Estate Investor", "gaborwankar"),
    ("Alex Hormozi", "Founder of Acquisition.com", "alexhormozi"),
    ("Patrick Bet-David", "Founder of Valuetainment", "patrickbetdavid"),
    ("Naval Ravikant", "Entrepreneur, Investor, Philosopher", "navalravikant"),
    
    # French Influencers
    ("Oussama Ammar", "Co-founder of The Family", "oussamaammar"),
    ("Roxanne Varza", "Director of Station F", "roxannevarza"),
]

def get_linkedin_profile(username):
    """Récupère le profil LinkedIn d'un utilisateur"""
    try:
        client = ApiClient()
        profile = client.call_api('LinkedIn/get_user_profile_by_username', 
                                 query={'username': username})
        return profile
    except Exception as e:
        print(f"Erreur pour {username}: {e}")
        return None

def main():
    """Fonction principale pour récupérer les profils"""
    print("Récupération des profils LinkedIn des top influenceurs...")
    print("=" * 60)
    
    results = []
    
    # Tester avec quelques profils connus
    test_usernames = [
        "garyvaynerchuk",
        "simonsinek", 
        "adammgrant",
        "justinwelsh",
        "sahilbloom",
        "alexhormozi",
        "jasmin-alic",
        "benoitdubos",
    ]
    
    for username in test_usernames:
        print(f"\nRécupération du profil: {username}")
        profile = get_linkedin_profile(username)
        
        if profile and profile.get('firstName'):
            result = {
                'username': username,
                'name': f"{profile.get('firstName', '')} {profile.get('lastName', '')}".strip(),
                'headline': profile.get('headline', ''),
                'followers': profile.get('followersCount', 0),
                'profilePicture': profile.get('profilePicture', ''),
                'linkedinUrl': f"https://linkedin.com/in/{username}",
            }
            results.append(result)
            print(f"  ✓ {result['name']} - {result['followers']} abonnés")
        else:
            print(f"  ✗ Profil non trouvé")
    
    print("\n" + "=" * 60)
    print(f"Profils récupérés: {len(results)}")
    
    # Afficher les résultats en format JSON pour insertion
    print("\n// Données à insérer dans la base:")
    for r in results:
        print(f"""{{
  username: "{r['username']}",
  name: "{r['name']}",
  headline: "{r['headline'][:100]}...",
  followers: {r['followers']},
  profilePicture: "{r['profilePicture']}",
  linkedinUrl: "{r['linkedinUrl']}"
}},""")

if __name__ == "__main__":
    main()
