# Kėdainiai 3D — website

Website of **Kėdainiai 3D**: drive the real Kėdainiai — the Old Town, the Nevėžis, the minaret and every street. Free.
Hosted on GitHub Pages: https://gediminasurvila.github.io/kedainiai-3d-site/

Game downloads (Windows, macOS, Linux) are published as [releases of this repository](https://github.com/gediminasurvila/kedainiai-3d-site/releases).

- `index.html` — the page (Lithuanian by default, English switch)
- `img/` — in-game screenshots

Game by Gediminas Survila. Map data © OpenStreetMap contributors (ODbL).

## Checks

The site workflow checks local links, download filenames, browser pack/engine sizes and the language switch
on PRs and pushes. When a release is published it also checks that all three packages and `SHA256SUMS.txt`
exist and are nonempty. Run locally with:

```bash
python3 -I scripts/check_site.py
python3 -I -m unittest discover -s tests -v
node --test tests/language.test.mjs
```
