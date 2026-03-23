# Stream Overlay Creator

Mini app front-end pour créer un overlay de stream avec Firebase Realtime Database.

## Fonctionnalités

- création de compte avec identifiant servant aussi de `room`
- mot de passe hashé en SHA-256 côté client avant stockage en base
- dashboard d'édition de l'overlay
- lien public type `?room=mon-id` pour OBS / browser source
- mise à jour temps réel via Firebase Realtime Database
- suppression de compte et réinitialisation d'overlay

## Utilisation

1. Ouvrir `index.html` via un serveur statique.
2. Créer un compte avec un identifiant et un mot de passe.
3. Personnaliser l'overlay puis cliquer sur **Enregistrer**.
4. Copier le lien OBS affiché dans le dashboard.
5. Ajouter ce lien comme source navigateur dans OBS.

## Note sécurité

Le hashage du mot de passe est fait côté client pour répondre au besoin demandé, mais ce n'est pas l'équivalent d'une vraie authentification backend avec salage/pepper, règles Firebase strictes, et sessions serveur.
