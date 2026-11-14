# haydenbell.co.uk

My portfolio site: a home page, a projects index, and a write-up page for each featured project.

Plain HTML, CSS and a few lines of JavaScript. No build step, no framework, no third-party requests. It's hosted on GitHub Pages from this repo, and the custom domain is set in `CNAME`.

## Layout

```
index.html                 home: intro, selected work, experience, skills
projects.html              every project, grouped by area
projects/*.html            one page per featured project
css/styles.css             the only stylesheet (colours and spacing are tokens at the top)
js/apps.js                 dark mode toggle, remembered in localStorage
assets/fonts/archivo.woff2 Archivo variable font (SIL Open Font License), self-hosted
assets/                    photo and CVs
```

## Run it locally

```
python3 -m http.server
```

Then open http://localhost:8000.

## Pictures

Each featured project has three pictures in `assets/projects/<project>/`:
`shot-1.jpg`, `shot-2.jpg` and `shot-3.jpg` (16:9, about 1600x900).
They start as template images. Replace them with your own using the same
file names and nothing else needs changing. `shot-1.jpg` is also used on
that project's cards.

## Adding a project

1. Copy an existing page in `projects/`, rename it, and change the text.
2. Make a folder `assets/projects/<project>/` with `shot-1.jpg` to `shot-3.jpg`.
3. Add a card to `projects.html` (copy an existing `<a class="card">`). If it's a favourite, add one to the selected work on `index.html` too.
4. Add it to the "More projects" list on the other project pages.
