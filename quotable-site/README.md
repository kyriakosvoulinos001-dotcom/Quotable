# Quotable: deploy to Netlify

1. Put this folder in a GitHub repository (new repo > upload the files, keep the folder structure).
2. Netlify > Add new site > Import an existing project > GitHub > choose the repo. Leave build command empty. Publish directory: `.`  Deploy.
3. Site configuration > Environment variables > add `ANTHROPIC_API_KEY` (from console.anthropic.com). Optional: `MODEL`, `ALLOWED_ORIGIN` (your site URL, e.g. https://quotable.netlify.app).
4. Deploys > Trigger deploy (variables apply to the next deploy).
5. In the Anthropic console set a monthly spend limit.
6. Test: open the site, Essay Lab, paste 150 words, press Mark.
