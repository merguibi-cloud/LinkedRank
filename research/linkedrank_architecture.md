# LinkedRank - Architecture de la Plateforme

## Vision
LinkedRank est la plateforme de référence pour les créateurs de contenu LinkedIn. Elle combine classements data-driven, génération de contenu IA basée sur les meilleurs posts du marché, et publication automatisée.

## Personas

### 1. Visiteur (Non inscrit)
- Accès aux classements publics (France, Monde)
- Consultation des profils créateurs (limité)
- Lecture des ressources/blog

### 2. Creator (Abonné Free)
- Onboarding personnalisé
- Dashboard basique
- Accès limité aux top contenus
- 3 générations IA/mois

### 3. Creator Pro (Abonné Payant)
- Dashboard complet avec analytics
- Accès illimité aux top contenus par secteur
- Génération IA illimitée
- Publication LinkedIn automatique
- Planification des posts

### 4. Admin
- Gestion complète de la base de données
- Import/Export de données
- Supervision des utilisateurs
- Analytics de la plateforme

## Structure des Pages

### Pages Publiques

#### 1. Page d'Accueil (/)
- Hero avec proposition de valeur
- Aperçu du classement (Top 5 France)
- Fonctionnalités clés
- Témoignages
- CTA inscription

#### 2. Classement France (/rankings/france)
- Top 100 créateurs LinkedIn France
- Filtres : Secteur, Croissance, Engagement
- Tri : Abonnés, Authority Score, Engagement Rate
- Cartes créateurs avec métriques

#### 3. Classement Mondial (/rankings/world)
- Top 200 créateurs LinkedIn mondiaux
- Filtres : Pays, Secteur, Langue
- Même structure que France

#### 4. Profil Créateur (/creator/:username)
- Photo, nom, bio
- Métriques détaillées
- Top posts (aperçu)
- Évolution des stats
- CTA "S'inspirer de ce créateur"

#### 5. Ressources (/resources)
- Guides de création de contenu
- Templates de posts
- Tips et bonnes pratiques
- News LinkedIn

### Pages Authentifiées (Creator)

#### 6. Onboarding (/onboarding)
- Étape 1 : Profil (Nom, entreprise, secteur)
- Étape 2 : Objectifs (Visibilité, leads, recrutement...)
- Étape 3 : Style de contenu préféré
- Étape 4 : Connexion LinkedIn (optionnel)

#### 7. Dashboard (/dashboard)
- Résumé des stats
- Posts générés récents
- Créateurs suivis
- Suggestions personnalisées

#### 8. Bibliothèque de Contenus (/library)
- Top posts par secteur
- Filtres : Langue, Format, Thématique
- Sauvegarde en favoris
- "S'inspirer" pour générer un post similaire

#### 9. Générateur IA (/generate)
- Sélection de la source d'inspiration
- Personnalisation du ton et style
- Preview du post
- Publication directe ou planification

#### 10. Mes Posts (/my-posts)
- Posts générés
- Posts publiés
- Planifiés
- Brouillons

### Pages Admin (/admin)

#### 11. Dashboard Admin (/admin)
- Stats globales de la plateforme
- Utilisateurs actifs
- Posts générés
- Revenue

#### 12. Gestion Créateurs (/admin/creators)
- Liste des créateurs
- Ajout/Modification/Suppression
- Import CSV/API
- Mise à jour des stats

#### 13. Gestion Contenus (/admin/content)
- Top posts de la base
- Ajout de nouveaux posts
- Catégorisation

#### 14. Gestion Utilisateurs (/admin/users)
- Liste des utilisateurs
- Plans d'abonnement
- Activité

## Modèle de Données

### Tables Principales

#### creators
- id, username, name, headline, profileUrl
- profileImage, bannerImage
- followers, connections
- authorityScore, engagementRate, growthRate
- country, sector, language
- isVerified, isPremium
- createdAt, updatedAt

#### top_posts
- id, creatorId, content, mediaUrl, mediaType
- likes, comments, shares, impressions
- engagementRate, viralScore
- language, sector, theme
- postedAt, scrapedAt

#### users
- id, email, name, profileImage
- linkedinId, linkedinAccessToken
- plan (free, pro, business)
- sector, objectives, preferredStyle
- onboardingCompleted
- createdAt

#### generated_posts
- id, userId, content, mediaUrl
- inspirationPostId, theme, language
- status (draft, scheduled, published)
- scheduledAt, publishedAt

#### subscriptions
- id, userId, plan, status
- stripeCustomerId, stripeSubscriptionId
- currentPeriodStart, currentPeriodEnd

## Design System

### Couleurs
- Background : #0f0f1a (très sombre)
- Surface : #1a1a2e
- Primary : #8b5cf6 (violet)
- Secondary : #f472b6 (rose)
- Accent : #fbbf24 (doré)
- Success : #10b981
- Text : #ffffff, #a1a1aa

### Typographie
- Titres : Playfair Display (serif élégant)
- Corps : Inter (sans-serif moderne)

### Composants
- Cartes avec glassmorphism
- Badges colorés par secteur
- Progress bars pour les métriques
- Avatars avec bordure dégradée
- Boutons avec dégradé violet-rose
