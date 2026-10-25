# Semantic image releases

Push a Git tag `vMAJOR.MINOR.PATCH` to publish `kaljo14/my-map:MAJOR.MINOR.PATCH`
for Linux AMD64 and ARM64. For example, `v1.2.3` publishes
`kaljo14/my-map:1.2.3`. Each repository has its own version sequence.
Use a new patch version for fixes, minor version for compatible features, and
major version for breaking changes. Versions are explicit; CI does not infer bumps
from commit messages or `package.json`.

## Automatic production deployment

Every push to `main` (or manual run on `main`) publishes `kaljo14/my-map:latest`
for Linux AMD64 and ARM64. After publication, the workflow commits the exact
image-index digest to `apps/frontend/deployment.yaml` on `kaljo14/map-infra`'s
`main` branch. Flux watches that branch and deploys the new image. No Renovate
PR or version tag is needed for this production path.

`MAP_INFRA_DISPATCH_TOKEN` is required for main builds and must allow Contents
read/write access to `kaljo14/map-infra`. The target branch must permit this
bot to push; protected branches must have an appropriate bot bypass configured.
The workflow fails if publication or the infrastructure update fails.

Version tags still publish immutable semantic releases without moving `latest`
or automatically deploying them. Stable tags must have three numeric components
without leading zeroes; prereleases and build metadata are not supported.

## GitHub secrets

In this repository's Settings → Secrets and variables → Actions, add:

- `DOCKERHUB_USERNAME`: the Docker Hub account with push access to `kaljo14/my-map`.
- `DOCKERHUB_TOKEN`: a Docker Hub personal access token with Read & Write access.
- `VITE_CLERK_PUBLISHABLE_KEY`: the frontend build-time Clerk key.
- `MAP_INFRA_DISPATCH_TOKEN`: GitHub token with Contents read/write access to `kaljo14/map-infra`, required to commit production image updates. Also triggers Renovate for version-tag releases.

Create the Docker Hub repository before the first release.
The workflow fails before building if the Clerk key is missing. The key is embedded
in the static JavaScript bundle, so changing a Kubernetes runtime Secret cannot
repair an already published image; publish and deploy a new image after setting it.

## Publish

Commit and push the workflow changes to `main` first. From a clean checkout of
the commit you intend to release, choose an unused version and run:

```bash
git tag -a v1.2.3 -m "Release v1.2.3"
git push origin refs/tags/v1.2.3
```

The version above is an example. Inspect existing Git/Docker Hub tags before
choosing the next version. Never move a released Git tag or rebuild it from different
source; publish a new version for fixes. Configure Docker Hub tag immutability for
release tags if you need the registry to enforce this policy.

Alternatively, `./build-push.sh v1.2.3` checks the version, working tree, and existing tags,
then pushes the release tag. It no longer builds or pushes images locally.

## Optional semantic deployment

To deploy a versioned release manually, after the image is published run this from `map-infra` (using the real version):

```bash
python3 scripts/adopt-release.py frontend 1.2.3
```

This verifies the registry image includes AMD64 and ARM64, then changes the manifest
to the version plus its image-index digest. Review and merge the change to `main`.
Flux deploys it; Renovate proposes subsequent stable semantic version updates.
Existing `latest` deployments remain on the legacy path until this one-time adoption.
A notification alone cannot convert `latest` into a versioned reference.

A subsequent main build returns the frontend to the automatic `latest@sha256` path.
