# Preview release guide

The deployed GitHub Pages artifact has three independent areas:

- Production catalog and original configurators at `/SAC-Assembly-Product-Studio/` (unmodified source HTML on `main`).
- React migration preview at `/SAC-Assembly-Product-Studio/preview/` (from `refactor/modular-foundation`).
- Experimental IDD Three.js product showroom at `/SAC-Assembly-Product-Studio/preview-next/#/products/idd-insect-doors/3d` (from `feature/idd-three-viewer`).

The IDD showroom includes neutral and studio lighting modes; neither is meant for manufacturing color calibration. The buttons are in the top center of the product scene, distinct from the original standalone configurator.

The deployment workflow resides on `main`, checks out the candidate feature branch independently, type-checks and tests both React apps, builds all preview artifacts, and copies the unchanged production source HTML into the GitHub Pages output. A new commit on `main` or a workflow dispatch creates a fresh deployment run.

**Do not rerun a previously successful Pages deployment job to refresh the preview.** That can create a second `github-pages` artifact in the same run, causing `actions/deploy-pages` to fail with “Multiple artifacts named github-pages”. Use a new workflow run instead.

Do not merge unapproved product geometry, RAL visualizations, or conceptual dimension ranges into production manufacturing logic.
