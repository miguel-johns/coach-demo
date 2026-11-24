# Rules for changes

## Screen actions need Milton tools
Whenever a new action is added to a screen (a button, menu item or panel action), add its Milton tool in the same change:
1. Put the logic in one function the button calls (for sessions, `M.sessOps` in `public/legacy/sched.js`).
2. Add the tool in `src/milton/actions.js` that calls that same function. Never copy the logic.
3. Add its catalog entry in `src/milton/catalog.js`, with a description read from the function, including its effect on credits or money.
4. Add the tool and its rules to the matching file in `skills/`.
5. Update `docs/milton-actions.md`.
