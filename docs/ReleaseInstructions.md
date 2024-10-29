# Release Instructions

1. Merge development changes into master.
   1. If merging from `development` branch, use a merge commit, do not squash or rebase.
   2. If done on github, pull changes to local development environment before proceeding.
2. Remove or comment out `/dist` line from .gitignore, this will allow us to include our build results into source control.
3. Run `npm run build` from terminal
   1. NOTE: build assets should now be in `/dist` folder.
   2. if any errors, ensure you have node installed and run `npm install` to install esbuild
4. IMPORTANT: DO NOT STAGE AND COMMIT CHANGES TO .GITIGNORE FILE! We don't want to include our build results normally.
5. stage and commit contents of `/dist` folder. DO NOT STAGE AND COMMIT CHANGES TO .GITIGNORE!
6. Push commits to origin
7. Discard changes to .gitignore
8. Create a new release: https://github.com/usdos-cgfs/car-cap/releases
   1. Be sure to increment the version number from last release
9. Purge Cache:
   1. https://www.jsdelivr.com/tools/purge
   2. Purge the following files:  
      https://cdn.jsdelivr.net/gh/usdos-cgfs/car-cap@latest/dist/pages/app.txt  
      https://cdn.jsdelivr.net/gh/usdos-cgfs/car-cap@latest/dist/pages/app.js  
      https://cdn.jsdelivr.net/gh/usdos-cgfs/car-cap@latest/dist/pages/app.js.map

      https://cdn.jsdelivr.net/gh/usdos-cgfs/car-cap@latest/dist/styles.css
