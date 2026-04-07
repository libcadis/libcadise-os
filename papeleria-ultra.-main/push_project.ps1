$ErrorActionPreference = 'Continue'
$repo = "C:\Users\Hogr\Downloads\libcadisweb\papeleria-ultra"

# Unstage everything from any previous git add
git -C $repo reset HEAD -- . 2>&1

# Stage only the project files (not home dir)
git -C $repo add . 2>&1

# Commit (skip if nothing to commit)
git -C $repo commit -m "feat: admin editable home sections, sticker options, mobile UX, scroll to top, SQL migration" 2>&1

# Push to origin main
git -C $repo push origin main 2>&1
