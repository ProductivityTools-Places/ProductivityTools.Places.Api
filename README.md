## Firestore Migration

To migrate Firestore database data from one Firebase project to another, follow these steps using the `gcloud` CLI.

### Prerequisites

1.  **Install gcloud CLI**: Ensure you have the Google Cloud CLI installed.
2.  **Permissions**: You need the `Owner` or `Datastore Import Export Admin` role on both projects.

### Step 1: Export Data from Source Project

Set your active project to the source project and start the export operation.

```bash
# Set the source project
gcloud config set project ptprojectsweb
gcloud storage buckets create gs://places-migraton --location=europe-west1  
gcloud firestore export gs://places-migraton --database=places --project=ptprojectsweb
```
*Note: This will create a folder in your bucket named with a timestamp (e.g., `2026-04-11T20_23_45_12345`).*

### Step 2: Grant Permissions to Destination Project

If your Cloud Storage bucket is in the source project, you must grant the destination project's Firestore service agent permission to read from that bucket.

1.  Find the project number of your destination project.
2.  The service account name follows this pattern: `service-785198365463@gcp-sa-firestore.iam.gserviceaccount.com`.
3.  Grant this service account the **Storage Object Viewer** (`roles/storage.objectViewer`)  and ***Storage Legacy bukcet reader** role on the source bucket.

```
gcloud config set project ptprojectsdev
gcloud config get-value project
gcloud projects describe ptprojectsdev --format="value(projectNumber)"
```

### Step 3: Import Data to Destination Project

Set your active project to the destination project and start the import operation.

```bash
# Import data from the bucket
gcloud firestore import gs://places-migraton/2026-04-11T20:42:22_95631 --datase=places
```
*Replace `[EXPORT_PREFIX]` with the specific folder created by the export command.*


places-migraton2/2026-04-12T22:01:42_72281



## Debug development
NODE_ENV=development npm run start
