# Frontend Boilerplate

<!-- MDTOC maxdepth:6 firsth1:0 numbering:1 flatten:1 bullets:0 updateOnSave:1 -->

1. [Deploy styleguide and prototype to gh-pages](#deploy-styleguide-and-prototype-to-gh-pages)   
1.1. [Fist time setup](#fist-time-setup)   
1.2. [Every day usage](#every-day-usage)   

<!-- /MDTOC -->


## Deploy styleguide and prototype to gh-pages
### Fist time setup
NOTE: Before the gh-pages can be setup it must be a GitHub repository.

Setup a orphan gh-pages branch, add and commit a temporary file to it.

```bash
$ git checkout --orphan gh-pages
$ git rm -rf .
$ touch README.md
$ git add README.md
$ git commit -m "Init gh-pages"
$ git push --set-upstream origin gh-pages
$ git checkout master
```

Make sure gulp-gh-pages, CNAME and deploy:styleproto is uncommented in gulpfile.js

Make sure /source/CNAME is available and set the url to what you want it to be. `[yourname].gh.front.no`

### Every day usage
```bash
$ gulp deploy:styleproto
```
