# Secret Santa Frontend 🎄

The website for a family Secret Santa ("Wichteln"), in German. Built with Vue 3, Vite and Tailwind CSS 4, for the [Secret Santa backend](https://github.com/zockerei/secret-santa-backend).

## What It Does

- **🎁 Dashboard**: join events, write your wish list (markdown) and, once the draw is done, see who you give a gift to and their wish list
- **📦 Archiv**: past events, who you gave to and both wish lists
- **👤 Profil**: change your name, email and password
- **🛠️ Verwaltung** (admins only): create users and events, add participants, start or undo the draw
- **✨ Extras**: Christmas Cannon, a nonogram puzzle game and a music visualizer, linked from the home page

There is no registration, the admin creates every account.

### Spoiler-Free Admin

The admin takes part like everyone else. The Verwaltung page only shows who joined an event and whether they wrote a wish list (✅ or ⏳), never who gives to whom or what is in the wish lists. The backend doesn't hand that out to admins either, so it isn't just hidden in the frontend.

## Running

**On the NAS** (Docker): copy `.env.example` to `.env`, set `BACKEND_URL` to the backend's LAN address and `FRONTEND_IP` for the `br0` network, then `docker compose up -d`. GitHub Actions builds the image on every push to `main` and Watchtower updates it.

The browser only talks to this container: nginx serves the website and forwards `/api` to `BACKEND_URL`. So only the frontend goes through Nginx Proxy Manager, the backend stays on the LAN. The API address isn't built into the image, it is read from `.env` when the container starts.

**Locally**: start the backend on port 8000 (`run.bat` in the backend), then:

```
npm install
npm run dev
```

The website is at http://localhost:3000. The Vite dev server forwards `/api` to the backend, like nginx does in production.

## Project Structure

```
src/
├── api.js            # All backend calls
├── format.js         # Date formatting
├── markdown.js       # Wish list rendering (sanitized with DOMPurify)
├── nonogram.js       # Nonogram pictures, random puzzles and the solver that checks them
├── style.css         # Tailwind setup and the shared classes (card, btn, input, ...)
├── main.js           # Routes and login checks
├── App.vue           # Navbar, lights and toasts
├── composables/      # Login state (useAuth) and toasts (useToast)
├── components/       # Shared parts, admin/ holds the Verwaltung tabs
└── views/            # The pages
```

Pages are only loaded when they are opened, so the home page doesn't download three.js for the music visualizer.

## Notes

- The Christmas Cannon (`src/christmasCannon.js`) builds its room and everything it fires from code with three.js and cannon-es, so it needs no model files or CDNs.
- Every nonogram (the Christmas pictures and the random ones) is checked by a line solver, so it has exactly one solution and can be solved without guessing. New pictures go in `CHRISTMAS_PUZZLES` in `src/nonogram.js`.
